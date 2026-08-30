<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LawyerProposal */
class FinalLawyerSelectionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'proposal_public_id' => $this->public_id,
            'summary' => $this->summary,
            'service_scope' => $this->service_scope,
            'proposed_fee_rial' => $this->proposed_fee_rial,
            'estimated_days' => $this->estimated_days,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at?->toISOString(),
            'lawyer' => LawyerPublicResource::make($this->lawyerProfile)->resolve(),
        ];
    }
}
