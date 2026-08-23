<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LawyerMatchRun */
class LawyerMatchRunResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'algorithm_version' => $this->algorithm_version,
            'status' => $this->status,
            'candidates_count' => $this->candidates_count,
            'completed_at' => $this->completed_at?->toISOString(),
            'candidates' => $this->whenLoaded(
                'candidates',
                fn () => LawyerMatchCandidateResource::collection($this->candidates)->resolve(),
            ),
        ];
    }
}
