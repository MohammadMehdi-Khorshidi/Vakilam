<?php

namespace App\Http\Resources;

use App\Models\LegalRequestParty;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LegalRequest */
class LegalRequestResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'client_user_id' => $this->client_user_id,
            'title' => $this->title,
            'description' => $this->description,
            'legal_category_id' => $this->legal_category_id,
            'province_id' => $this->province_id,
            'city_id' => $this->city_id,
            'urgency' => $this->urgency,
            'service_intent' => $this->service_intent,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'parties' => $this->whenLoaded('parties', fn () => $this->parties
                ->map(fn (LegalRequestParty $party): array => [
                    'id' => $party->id,
                    'party_role' => $party->party_role,
                    'full_name' => $party->full_name,
                    'relation_note' => $party->relation_note,
                    'is_client' => $party->is_client,
                ])),
            'documents' => $this->whenLoaded(
                'documents',
                fn () => DocumentResource::collection($this->documents)->resolve(),
            ),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
