<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Negotiation */
class NegotiationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'source' => $this->source,
            'status' => $this->status,
            'opened_at' => $this->opened_at,
            'closed_at' => $this->closed_at,
            'legal_request' => $this->legalRequest === null ? null : [
                'public_id' => $this->legalRequest->public_id,
                'title' => $this->legalRequest->title,
                'status' => $this->legalRequest->status,
            ],
            'lawyer' => $this->lawyerProfile === null ? null : [
                'public_id' => $this->lawyerProfile->public_id,
                'full_name' => $this->lawyerProfile->full_name,
                'verification_status' => $this->lawyerProfile->verification_status,
            ],
            'distribution' => $this->distribution === null ? null : [
                'id' => $this->distribution->id,
                'source' => $this->distribution->source,
                'status' => $this->distribution->status,
            ],
            'proposal' => $this->proposal === null ? null : [
                'public_id' => $this->proposal->public_id,
                'status' => $this->proposal->status,
                'summary' => $this->proposal->summary,
                'service_scope' => $this->proposal->service_scope,
                'proposed_fee_rial' => $this->proposal->proposed_fee_rial,
                'estimated_days' => $this->proposal->estimated_days,
                'submitted_at' => $this->proposal->submitted_at,
                'expires_at' => $this->proposal->expires_at,
            ],
            'messages' => $this->whenLoaded('messages', fn () => $this->messages->map(fn ($message): array => [
                'id' => $message->id,
                'body' => $message->body,
                'created_at' => $message->created_at,
                'sender' => $message->sender === null ? null : [
                    'public_id' => $message->sender->public_id,
                    'name' => $message->sender->name,
                    'last_name' => $message->sender->last_name,
                ],
            ])->values()),
        ];
    }
}
