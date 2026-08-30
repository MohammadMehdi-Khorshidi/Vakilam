<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LawyerProfile */
class LawyerPublicResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'full_name' => $this->full_name,
            'bio' => $this->bio,
            'average_rating' => $this->average_rating,
            'rating_count' => $this->rating_count,
            'is_available' => $this->is_available,
            'specialties' => $this->whenLoaded(
                'lawyerSpecialties',
                fn () => LawyerSpecialtyResource::collection(
                    $this->lawyerSpecialties,
                )->resolve(),
            ),
            'service_areas' => $this->whenLoaded(
                'serviceAreas',
                fn () => LawyerServiceAreaResource::collection(
                    $this->serviceAreas,
                )->resolve(),
            ),
        ];
    }
}
