<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LawyerServiceArea */
class LawyerServiceAreaResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'province' => $this->whenLoaded('province', fn () => [
                'id' => $this->province->id,
                'name' => $this->province->name,
            ]),
            'city' => $this->whenLoaded('city', fn () => $this->city === null ? null : [
                'id' => $this->city->id,
                'name' => $this->city->name,
            ]),
            'covers_entire_province' => $this->city_id === null,
        ];
    }
}
