<?php

namespace App\Http\Resources;

use App\Models\DocumentVersion;
use App\Models\StoredFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Document */
class DocumentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'legal_request_id' => $this->legal_request_id,
            'legal_matter_id' => $this->legal_matter_id,
            'owner_user_id' => $this->owner_user_id,
            'title' => $this->title,
            'status' => $this->status,
            'document_type' => $this->whenLoaded('documentType', fn () => $this->documentType === null ? null : [
                'id' => $this->documentType->id,
                'code' => $this->documentType->code,
                'name' => $this->documentType->name,
            ]),
            'current_file' => $this->whenLoaded(
                'currentFile',
                fn () => $this->currentFile === null ? null : $this->fileData($this->currentFile),
            ),
            'versions' => $this->whenLoaded('versions', fn () => $this->versions
                ->sortBy('version_number')
                ->values()
                ->map(fn (DocumentVersion $version): array => $this->versionData($version))),
            'created_at' => $this->created_at?->toISOString(),
            'archived_at' => $this->archived_at?->toISOString(),
        ];
    }

    /** @return array<string, mixed> */
    private function fileData(StoredFile $file): array
    {
        return [
            'id' => $file->id,
            'original_name' => $file->original_name,
            'mime_type' => $file->mime_type,
            'size_bytes' => $file->size_bytes,
            'status' => $file->status,
        ];
    }

    /** @return array<string, mixed> */
    private function versionData(DocumentVersion $version): array
    {
        $file = $version->relationLoaded('file') ? $version->file : null;

        return [
            'id' => $version->id,
            'version_number' => $version->version_number,
            'uploaded_by' => $version->uploaded_by,
            'created_at' => $version->created_at?->toISOString(),
            'file' => $file instanceof StoredFile ? $this->fileData($file) : null,
        ];
    }
}
