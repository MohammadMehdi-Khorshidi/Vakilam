<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Engagement */
class EngagementResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'status' => $this->status,
            'contract_due_at' => $this->contract_due_at,
            'started_at' => $this->started_at,
            'ended_at' => $this->ended_at,
            'created_at' => $this->created_at,
            'legal_request' => $this->legalRequest === null ? null : [
                'public_id' => $this->legalRequest->public_id,
                'title' => $this->legalRequest->title,
                'status' => $this->legalRequest->status,
            ],
            'proposal' => $this->proposal === null ? null : [
                'public_id' => $this->proposal->public_id,
                'status' => $this->proposal->status,
                'summary' => $this->proposal->summary,
                'service_scope' => $this->proposal->service_scope,
                'proposed_fee_rial' => $this->proposal->proposed_fee_rial,
                'estimated_days' => $this->proposal->estimated_days,
                'negotiation' => $this->proposal->relationLoaded('negotiation') && $this->proposal->negotiation !== null ? [
                    'public_id' => $this->proposal->negotiation->public_id,
                    'status' => $this->proposal->negotiation->status,
                ] : null,
            ],
            'lawyer' => $this->lawyerProfile === null ? null : [
                'public_id' => $this->lawyerProfile->public_id,
                'full_name' => $this->lawyerProfile->full_name,
                'verification_status' => $this->lawyerProfile->verification_status,
            ],
            'client' => $this->client === null ? null : [
                'public_id' => $this->client->public_id,
                'name' => $this->client->name,
                'last_name' => $this->client->last_name,
            ],
            'confirmations' => $this->whenLoaded('confirmations', fn () => $this->confirmations->map(fn ($confirmation): array => [
                'role' => $confirmation->role,
                'confirmed_at' => $confirmation->confirmed_at,
            ])->values()),
            'contract' => $this->contract === null ? null : [
                'public_id' => $this->contract->public_id,
                'status' => $this->contract->status,
            ],
        ];
    }
}
