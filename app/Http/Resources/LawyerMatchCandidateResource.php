<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LawyerMatchCandidate */
class LawyerMatchCandidateResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'rank' => $this->rank_position,
            'score' => (float) $this->score,
            'explanation' => $this->explanation,
            'lawyer' => LawyerPublicResource::make($this->lawyerProfile)->resolve(),
        ];
    }
}
