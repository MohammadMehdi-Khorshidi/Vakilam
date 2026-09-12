<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Negotiation */
class NegotiationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $mapProposal = static fn ($proposal): array => [
            'public_id' => $proposal->public_id,
            'status' => $proposal->status,
            'summary' => $proposal->summary,
            'service_scope' => $proposal->service_scope,
            'proposed_fee_rial' => $proposal->proposed_fee_rial,
            'estimated_days' => $proposal->estimated_days,
            'submitted_at' => $proposal->submitted_at,
            'expires_at' => $proposal->expires_at,
            'created_at' => $proposal->created_at,
        ];

        $attachments = $this->attachments()
            ->where('expires_at', '>', now())
            ->with('sender:id,public_id,name,last_name')
            ->orderBy('created_at')
            ->get();

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
            'proposal' => $this->proposal === null ? null : $mapProposal($this->proposal),
            'proposals' => $this->whenLoaded(
                'proposals',
                fn () => $this->proposals->map($mapProposal)->values(),
            ),
            'engagement' => $this->engagement === null ? null : [
                'public_id' => $this->engagement->public_id,
                'status' => $this->engagement->status,
                'proposal_public_id' => $this->engagement->proposal?->public_id,
                'agreement_snapshot' => $this->engagement->agreement_snapshot,
                'contract_due_at' => $this->engagement->contract_due_at,
            ],
            'messages' => $this->whenLoaded(
                'messages',
                fn () => $this->messages->map(fn ($message): array => [
                    'id' => $message->id,
                    'body' => $message->body,
                    'created_at' => $message->created_at,
                    'sender' => $message->sender === null ? null : [
                        'public_id' => $message->sender->public_id,
                        'name' => $message->sender->name,
                        'last_name' => $message->sender->last_name,
                    ],
                ])->values(),
            ),
            'attachments' => $attachments->map(fn ($attachment): array => [
                'public_id' => $attachment->public_id,
                'original_name' => $attachment->original_name,
                'mime_type' => $attachment->mime_type,
                'size_bytes' => (int) $attachment->size_bytes,
                'created_at' => $attachment->created_at,
                'expires_at' => $attachment->expires_at,
                'sender' => $attachment->sender === null ? null : [
                    'public_id' => $attachment->sender->public_id,
                    'name' => $attachment->sender->name,
                    'last_name' => $attachment->sender->last_name,
                ],
            ])->values(),
        ];
    }
}
