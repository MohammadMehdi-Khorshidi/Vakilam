<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Engagement */
class EngagementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $legalRequest = $this->legalRequest;

        return [
            'public_id' => $this->public_id,
            'status' => $this->status,
            'agreement_snapshot' => $this->agreement_snapshot,
            'contract_due_at' => $this->contract_due_at,
            'started_at' => $this->started_at,
            'ended_at' => $this->ended_at,
            'created_at' => $this->created_at,
            'legal_request' => $legalRequest === null ? null : [
                'id' => $legalRequest->id,
                'public_id' => $legalRequest->public_id,
                'title' => $legalRequest->title,
                'description' => $legalRequest->description,
                'status' => $legalRequest->status,
                'legal_category' => $legalRequest->legalCategory === null ? null : [
                    'id' => $legalRequest->legalCategory->id,
                    'code' => $legalRequest->legalCategory->code,
                    'name' => $legalRequest->legalCategory->name,
                ],
                'province' => $legalRequest->province === null ? null : [
                    'id' => $legalRequest->province->id,
                    'name' => $legalRequest->province->name,
                ],
                'city' => $legalRequest->city === null ? null : [
                    'id' => $legalRequest->city->id,
                    'name' => $legalRequest->city->name,
                ],
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
            'confirmations' => $this->whenLoaded(
                'confirmations',
                fn () => $this->confirmations->map(fn ($confirmation): array => [
                    'role' => $confirmation->role,
                    'confirmed_at' => $confirmation->confirmed_at,
                ])->values(),
            ),
            'contract' => $this->contract === null ? null : [
                'public_id' => $this->contract->public_id,
                'status' => $this->contract->status,
            ],
        ];
    }
}
