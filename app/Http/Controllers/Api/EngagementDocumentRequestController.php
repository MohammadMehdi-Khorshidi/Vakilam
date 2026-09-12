<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Engagement;
use App\Models\EngagementDocumentRequest;
use App\Models\User;
use App\Services\Documents\DocumentUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

class EngagementDocumentRequestController extends Controller
{
    public function store(Request $request, Engagement $engagement): JsonResponse
    {
        $user = $this->participant($request, $engagement, 'lawyer');

        abort_unless(
            $engagement->status === 'pending_contract',
            409,
            'Document requests can only be changed before the engagement becomes active.',
        );

        $validated = $request->validate([
            'title' => ['required', 'string', 'min:2', 'max:160'],
            'instructions' => ['nullable', 'string', 'max:1500'],
            'is_required' => ['sometimes', 'boolean'],
        ]);

        $item = $engagement->documentRequests()->create([
            'requested_by' => $user->id,
            'title' => trim($validated['title']),
            'instructions' => trim((string) ($validated['instructions'] ?? '')),
            'is_required' => (bool) ($validated['is_required'] ?? true),
            'status' => 'requested',
        ]);

        return response()->json([
            'message' => 'Document request created.',
            'data' => $this->serialize($item),
        ], 201);
    }

    public function destroy(
        Request $request,
        EngagementDocumentRequest $documentRequest,
    ): JsonResponse {
        $engagement = $documentRequest->engagement()->firstOrFail();
        $this->participant($request, $engagement, 'lawyer');

        abort_unless(
            $documentRequest->document_id === null
                && $documentRequest->status === 'requested',
            409,
            'A document request with an uploaded file cannot be deleted.',
        );

        $documentRequest->delete();

        return response()->json(['message' => 'Document request deleted.']);
    }

    public function upload(
        Request $request,
        EngagementDocumentRequest $documentRequest,
        DocumentUploadService $uploads,
    ): JsonResponse {
        $engagement = $documentRequest->engagement()
            ->with('legalRequest')
            ->firstOrFail();

        /** @var User $user */
        $user = $this->participant($request, $engagement, 'client');

        abort_unless(
            in_array($documentRequest->status, ['requested', 'needs_revision', 'uploaded'], true),
            409,
            'This document request no longer accepts uploads.',
        );

        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimetypes:application/pdf,image/jpeg,image/png',
                'max:5120',
            ],
        ]);

        /** @var UploadedFile $file */
        $file = $validated['file'];
        $legalRequest = $engagement->legalRequest;

        abort_unless(
            $legalRequest !== null && $legalRequest->client_user_id === $user->id,
            409,
            'The legal request for this engagement is not available.',
        );

        if ($documentRequest->document_id === null) {
            $document = $uploads->createForLegalRequest(
                $legalRequest,
                $user,
                $file,
                [
                    'title' => $documentRequest->title,
                    'document_type_id' => null,
                ],
            );
        } else {
            $document = $documentRequest->document()->firstOrFail();
            $document = $uploads->createVersion($document, $user, $file);
        }

        $documentRequest->forceFill([
            'document_id' => $document->id,
            'status' => 'uploaded',
            'review_note' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
            'uploaded_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'data' => $this->serialize($documentRequest->fresh()),
        ]);
    }

    public function review(
        Request $request,
        EngagementDocumentRequest $documentRequest,
    ): JsonResponse {
        $engagement = $documentRequest->engagement()->firstOrFail();
        /** @var User $user */
        $user = $this->participant($request, $engagement, 'lawyer');

        abort_unless(
            $documentRequest->document_id !== null
                && $documentRequest->status === 'uploaded',
            409,
            'There is no uploaded document waiting for review.',
        );

        $validated = $request->validate([
            'status' => ['required', Rule::in(['accepted', 'needs_revision'])],
            'review_note' => [
                Rule::requiredIf(
                    fn () => $request->input('status') === 'needs_revision'
                ),
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $documentRequest->forceFill([
            'status' => $validated['status'],
            'review_note' => trim((string) ($validated['review_note'] ?? '')),
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Document review recorded.',
            'data' => $this->serialize($documentRequest->fresh()),
        ]);
    }

    private function participant(
        Request $request,
        Engagement $engagement,
        string $expectedRole,
    ): User {
        $user = $request->user();

        abort_unless($user instanceof User && $user->status === 'active', 403);

        $engagement->loadMissing('lawyerProfile');

        $role = null;

        if ($engagement->client_user_id === $user->id) {
            $role = 'client';
        } elseif (
            $user->mayActAsRole('lawyer')
            && $engagement->lawyerProfile?->user_id === $user->id
        ) {
            $role = 'lawyer';
        }

        abort_unless($role === $expectedRole, 403);

        return $user;
    }

    private function serialize(EngagementDocumentRequest $item): array
    {
        $item->loadMissing('document.currentFile');

        $file = $item->document?->currentFile;

        return [
            'public_id' => $item->public_id,
            'title' => $item->title,
            'instructions' => $item->instructions,
            'is_required' => $item->is_required,
            'status' => $item->status,
            'review_note' => $item->review_note,
            'uploaded_at' => $item->uploaded_at,
            'reviewed_at' => $item->reviewed_at,
            'document' => $item->document === null ? null : [
                'public_id' => $item->document->public_id,
                'title' => $item->document->title,
                'file_name' => $file?->original_name,
                'mime_type' => $file?->mime_type,
                'size_bytes' => $file?->size_bytes,
            ],
        ];
    }
}
