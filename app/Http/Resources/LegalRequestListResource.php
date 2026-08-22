<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LegalRequest */
class LegalRequestListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,

            'title' => $this->title,
            'status' => $this->status,
            'urgency' => $this->urgency,
            'service_intent' => $this->service_intent,

            'legal_category' => [
                'id' => $this->legalCategory?->id,
                'name' => $this->legalCategory?->name,
            ],

            'province' => [
                'id' => $this->province?->id,
                'name' => $this->province?->name,
            ],

            'city' => [
                'id' => $this->city?->id,
                'name' => $this->city?->name,
            ],

            'submitted_at' => $this->submitted_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}