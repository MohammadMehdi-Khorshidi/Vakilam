<?php

namespace App\Services\Documents;

use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\LegalMatter;
use App\Models\LegalRequest;
use App\Models\StoredFile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class DocumentUploadService
{
    private const DISK = 'local';

    /** @param array{title: string, document_type_id?: string|null} $data */
    public function createForLegalRequest(LegalRequest $legalRequest, User $user, UploadedFile $upload, array $data): Document
    {
        return $this->createDocument(
            $user,
            $upload,
            $data,
            "legal-requests/{$legalRequest->public_id}/documents",
            $legalRequest,
            null,
        );
    }

    /** @param array{title: string, document_type_id?: string|null} $data */
    public function createForLegalMatter(LegalMatter $legalMatter, User $user, UploadedFile $upload, array $data): Document
    {
        return $this->createDocument(
            $user,
            $upload,
            $data,
            "legal-matters/{$legalMatter->public_id}/documents",
            null,
            $legalMatter,
        );
    }

    public function createVersion(Document $document, User $user, UploadedFile $upload): Document
    {
        $path = $this->storeUpload($upload, $this->documentDirectory($document));

        try {
            return DB::transaction(function () use ($document, $path, $upload, $user): Document {
                $lockedDocument = Document::query()->whereKey($document->id)->lockForUpdate()->firstOrFail();

                abort_if($lockedDocument->status === 'archived', 409, 'Archived documents cannot accept new versions.');

                $nextVersion = ((int) DocumentVersion::query()
                    ->where('document_id', $lockedDocument->id)
                    ->max('version_number')) + 1;
                $storedFile = $this->createStoredFile($upload, $path, $user);

                DocumentVersion::query()->create([
                    'document_id' => $lockedDocument->id,
                    'file_id' => $storedFile->id,
                    'version_number' => $nextVersion,
                    'uploaded_by' => $user->id,
                ]);

                $lockedDocument->forceFill(['current_file_id' => $storedFile->id])->save();

                return $lockedDocument->load(['documentType', 'currentFile', 'versions.file']);
            });
        } catch (Throwable $exception) {
            Storage::disk(self::DISK)->delete($path);

            throw $exception;
        }
    }

    /** @param array{title: string, document_type_id?: string|null} $data */
    private function createDocument(
        User $user,
        UploadedFile $upload,
        array $data,
        string $directory,
        ?LegalRequest $legalRequest,
        ?LegalMatter $legalMatter,
    ): Document {
        if (($legalRequest === null) === ($legalMatter === null)) {
            throw new RuntimeException('A document must belong to exactly one legal context.');
        }

        $path = $this->storeUpload($upload, $directory);

        try {
            return DB::transaction(function () use ($data, $legalMatter, $legalRequest, $path, $upload, $user): Document {
                $storedFile = $this->createStoredFile($upload, $path, $user);
                $document = Document::query()->create([
                    'legal_request_id' => $legalRequest?->id,
                    'legal_matter_id' => $legalMatter?->id,
                    'owner_user_id' => $user->id,
                    'document_type_id' => $data['document_type_id'] ?? null,
                    'title' => $data['title'],
                    'status' => 'active',
                    'current_file_id' => null,
                ]);

                DocumentVersion::query()->create([
                    'document_id' => $document->id,
                    'file_id' => $storedFile->id,
                    'version_number' => 1,
                    'uploaded_by' => $user->id,
                ]);

                $document->forceFill(['current_file_id' => $storedFile->id])->save();

                return $document->load(['documentType', 'currentFile', 'versions.file']);
            });
        } catch (Throwable $exception) {
            Storage::disk(self::DISK)->delete($path);

            throw $exception;
        }
    }

    private function documentDirectory(Document $document): string
    {
        if ($document->legal_request_id !== null && $document->legal_matter_id === null) {
            $legalRequest = $document->legalRequest()->firstOrFail();

            return "legal-requests/{$legalRequest->public_id}/documents";
        }

        if ($document->legal_matter_id !== null && $document->legal_request_id === null) {
            $legalMatter = $document->legalMatter()->firstOrFail();

            return "legal-matters/{$legalMatter->public_id}/documents";
        }

        throw new RuntimeException('The document must belong to exactly one legal context.');
    }

    private function storeUpload(UploadedFile $upload, string $directory): string
    {
        $extension = strtolower($upload->guessExtension() ?: $upload->getClientOriginalExtension());
        $fileName = Str::uuid().($extension !== '' ? ".{$extension}" : '');
        $path = $upload->storeAs($directory, $fileName, self::DISK);

        if (! is_string($path)) {
            throw new RuntimeException('The document could not be stored.');
        }

        return $path;
    }

    private function createStoredFile(UploadedFile $upload, string $path, User $user): StoredFile
    {
        $realPath = $upload->getRealPath();

        if (! is_string($realPath)) {
            throw new RuntimeException('The temporary document file could not be read.');
        }

        $checksum = hash_file('sha256', $realPath);

        if (! is_string($checksum)) {
            throw new RuntimeException('The document checksum could not be generated.');
        }

        return StoredFile::query()->create([
            'disk' => self::DISK,
            'path' => $path,
            'original_name' => $upload->getClientOriginalName(),
            'mime_type' => $upload->getMimeType() ?: $upload->getClientMimeType(),
            'size_bytes' => $upload->getSize(),
            'checksum_sha256' => $checksum,
            'status' => 'ready',
            'uploaded_by' => $user->id,
        ]);
    }
}
