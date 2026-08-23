<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LawyerProfile */
class LawyerProfileResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'first_name' => $this->whenLoaded('user', fn () => $this->user->name),
            'last_name' => $this->whenLoaded('user', fn () => $this->user->last_name),
            'full_name' => $this->full_name,
            'phone' => $this->whenLoaded('user', fn () => $this->user->phone),
            'license_number' => $this->license_number,
            'bio' => $this->bio,
            'verification_status' => $this->verification_status,
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
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
