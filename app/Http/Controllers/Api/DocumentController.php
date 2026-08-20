<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreDocumentRequest;
use App\Http\Requests\Documents\StoreDocumentVersionRequest;
use App\Http\Requests\Documents\StoreLegalMatterDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\LegalMatter;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\Documents\DocumentAccessService;
use App\Services\Documents\DocumentUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function __construct(private DocumentAccessService $access)
    {
    }

    public function index(Request $request, LegalRequest $legalRequest): JsonResponse
    {
        $this->ensureLegalRequestManagement($request, $legalRequest);

        $documents = $legalRequest->documents()
            ->where('status', '!=', 'archived')
            ->with(['documentType', 'currentFile'])
            ->latest('created_at')
            ->get();

        return response()->json(['documents' => DocumentResource::collection($documents)->resolve()]);
    }

    public function store(StoreDocumentRequest $request, LegalRequest $legalRequest, DocumentUploadService $service): JsonResponse
    {
        abort_if(
            in_array($legalRequest->status, ['cancelled', 'closed'], true),
            409,
            'Documents cannot be uploaded to a closed legal request.',
        );

        /** @var UploadedFile $file */
        $file = $request->file('file');
        /** @var User $user */
        $user = $request->user();
        $document = $service->createForLegalRequest(
            $legalRequest,
            $user,
            $file,
            $request->safe()->only(['title', 'document_type_id']),
        );

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'document' => DocumentResource::make($document)->resolve(),
        ], 201);
    }

    public function indexMatter(Request $request, LegalMatter $legalMatter): JsonResponse
    {
        $this->ensureLegalMatterView($request, $legalMatter);

        $matterDocuments = $legalMatter->documents()
            ->where('status', '!=', 'archived')
            ->with(['documentType', 'currentFile'])
            ->get();
        $requestDocuments = $legalMatter->sourceLegalRequest()
            ->firstOrFail()
            ->documents()
            ->where('status', '!=', 'archived')
            ->with(['documentType', 'currentFile'])
            ->get();
        $documents = $requestDocuments->concat($matterDocuments)->sortByDesc('created_at')->values();

        return response()->json(['documents' => DocumentResource::collection($documents)->resolve()]);
    }

    public function storeMatter(
        StoreLegalMatterDocumentRequest $request,
        LegalMatter                     $legalMatter,
        DocumentUploadService           $service,
    ): JsonResponse
    {
        abort_if(
            in_array($legalMatter->status, ['completed', 'closed'], true),
            409,
            'Documents cannot be uploaded to a closed legal matter.',
        );

        /** @var UploadedFile $file */
        $file = $request->file('file');
        /** @var User $user */
        $user = $request->user();
        $document = $service->createForLegalMatter(
            $legalMatter,
            $user,
            $file,
            $request->safe()->only(['title', 'document_type_id']),
        );

        return response()->json([
            'message' => 'Matter document uploaded successfully.',
            'document' => DocumentResource::make($document)->resolve(),
        ], 201);
    }

    public function show(Request $request, Document $document): JsonResponse
    {
        $this->ensureDocumentView($request, $document);

        return response()->json([
            'document' => DocumentResource::make(
                $document->load(['documentType', 'currentFile', 'versions.file']),
            )->resolve(),
        ]);
    }

    public function download(Request $request, Document $document): StreamedResponse
    {
        $this->ensureDocumentView($request, $document);
        abort_if($document->status === 'archived', 409, 'Archived documents cannot be downloaded.');

        $storedFile = $document->currentFile;
        abort_if(
            $storedFile === null
            || $storedFile->status !== 'ready'
            || !Storage::disk($storedFile->disk)->exists($storedFile->path),
            404,
            'The document file was not found.',
        );

        return Storage::disk($storedFile->disk)->download(
            $storedFile->path,
            $storedFile->original_name,
            ['Content-Type' => $storedFile->mime_type],
        );
    }

    public function storeVersion(
        StoreDocumentVersionRequest $request,
        Document                    $document,
        DocumentUploadService       $service,
    ): JsonResponse
    {
        abort_if($document->status === 'archived', 409, 'Archived documents cannot accept new versions.');
        $this->ensureDocumentContextIsOpen($document);

        /** @var UploadedFile $file */
        $file = $request->file('file');
        /** @var User $user */
        $user = $request->user();
        $document = $service->createVersion($document, $user, $file);

        return response()->json([
            'message' => 'Document version uploaded successfully.',
            'document' => DocumentResource::make($document)->resolve(),
        ]);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        $this->ensureDocumentManagement($request, $document);

        DB::transaction(function () use ($document): void {
            $lockedDocument = Document::query()->whereKey($document->id)->lockForUpdate()->firstOrFail();
            $lockedDocument->forceFill([
                'status' => 'archived',
                'archived_at' => now(),
                'current_file_id' => null,
            ])->save();
        });

        return response()->json(['message' => 'Document archived successfully.']);
    }

    private function ensureLegalRequestManagement(Request $request, LegalRequest $legalRequest): void
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User && $this->access->canManageLegalRequest($user, $legalRequest),
            403,
            'You are not allowed to manage documents for this legal request.',
        );
    }

    private function ensureLegalMatterView(Request $request, LegalMatter $legalMatter): void
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User && $this->access->canViewLegalMatter($user, $legalMatter),
            403,
            'You are not allowed to view documents for this legal matter.',
        );
    }

    private function ensureDocumentView(Request $request, Document $document): void
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User && $this->access->canViewDocument($user, $document),
            403,
            'You are not allowed to view this document.',
        );
    }

    private function ensureDocumentManagement(Request $request, Document $document): void
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User && $this->access->canManageDocument($user, $document),
            403,
            'You are not allowed to manage this document.',
        );
    }

    private function ensureDocumentContextIsOpen(Document $document): void
    {
        if ($document->legal_request_id !== null && $document->legal_matter_id === null) {
            $legalRequest = $document->legalRequest()->firstOrFail();
            abort_if(
                in_array($legalRequest->status, ['cancelled', 'closed'], true),
                409,
                'New versions cannot be uploaded to a closed legal request.',
            );

            return;
        }

        if ($document->legal_matter_id !== null && $document->legal_request_id === null) {
            $legalMatter = $document->legalMatter()->firstOrFail();
            abort_if(
                in_array($legalMatter->status, ['completed', 'closed'], true),
                409,
                'New versions cannot be uploaded to a closed legal matter.',
            );

            return;
        }

        abort(409, 'The document does not have a valid legal context.');
    }
}
