<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LawyerSpecialty */
class LawyerSpecialtyResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'specialty_id' => $this->specialty_id,
            'code' => $this->whenLoaded('specialty', fn () => $this->specialty->code),
            'name' => $this->whenLoaded('specialty', fn () => $this->specialty->name),
            'years_experience' => $this->years_experience,
        ];
    }
}
