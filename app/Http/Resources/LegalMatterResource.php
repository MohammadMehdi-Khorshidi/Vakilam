<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LegalMatter */
class LegalMatterResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $source = $this->sourceLegalRequest;

        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'title' => $this->title,
            'status' => $this->status,
            'origin_type' => $this->origin_type,
            'source_request' => $source === null ? null : [
                'id' => $source->id,
                'public_id' => $source->public_id,
                'title' => $source->title,
                'description' => $source->description,
                'legal_category' => $source->legalCategory === null ? null : [
                    'id' => $source->legalCategory->id,
                    'code' => $source->legalCategory->code,
                    'name' => $source->legalCategory->name,
                ],
                'province' => $source->province === null ? null : [
                    'id' => $source->province->id,
                    'name' => $source->province->name,
                ],
                'city' => $source->city === null ? null : [
                    'id' => $source->city->id,
                    'name' => $source->city->name,
                ],
            ],
            'opened_at' => $this->opened_at?->toISOString(),
            'closed_at' => $this->closed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
