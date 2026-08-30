<?php

namespace App\Http\Requests\Lawyers;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateLawyerServiceAreasRequest extends LawyerProfileRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'service_areas' => ['present', 'array', 'max:100'],
            'service_areas.*.province_id' => [
                'required',
                'integer',
                Rule::exists('provinces', 'id'),
            ],
            'service_areas.*.city_id' => [
                'nullable',
                'integer',
                Rule::exists('cities', 'id'),
            ],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $areas = collect($this->input('service_areas', []))
                    ->filter(fn (mixed $area): bool => is_array($area));

                $seen = [];
                $provinceModes = [];

                foreach ($areas as $index => $area) {
                    $provinceId = $area['province_id'] ?? null;
                    $cityId = $area['city_id'] ?? null;

                    if ($provinceId === null) {
                        continue;
                    }

                    if ($cityId !== null) {
                        $cityBelongsToProvince = \App\Models\City::query()
                            ->whereKey($cityId)
                            ->where('province_id', $provinceId)
                            ->exists();

                        if (! $cityBelongsToProvince) {
                            $validator->errors()->add(
                                "service_areas.{$index}.city_id",
                                'The selected city does not belong to the selected province.',
                            );
                        }
                    }

                    $key = $provinceId.':'.($cityId ?? 'all');

                    if (isset($seen[$key])) {
                        $validator->errors()->add(
                            "service_areas.{$index}",
                            'Duplicate service areas are not allowed.',
                        );
                    }

                    $seen[$key] = true;
                    $mode = $cityId === null ? 'province' : 'city';

                    if (isset($provinceModes[$provinceId])
                        && $provinceModes[$provinceId] !== $mode) {
                        $validator->errors()->add(
                            "service_areas.{$index}",
                            'A whole province and specific cities from it cannot be selected together.',
                        );
                    }

                    $provinceModes[$provinceId] = $mode;
                }
            },
        ];
    }
}
