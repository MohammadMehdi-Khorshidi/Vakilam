<?php

namespace App\Http\Requests\Lawyers;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateLawyerProfileRequest extends LawyerProfileRequest
{
    protected function prepareForValidation(): void
    {
        $values = [];

        foreach (['first_name', 'last_name', 'bio'] as $field) {
            if ($this->has($field) && is_string($this->input($field))) {
                $values[$field] = trim($this->input($field));
            }
        }

        $this->merge($values);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'license_number' => ['prohibited'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'is_available' => ['sometimes', 'boolean'],
            'specialties' => ['sometimes', 'array', 'max:20'],
            'specialties.*.specialty_id' => [
                'required',
                'uuid',
                'distinct:strict',
                Rule::exists('specialties', 'id')->where('status', true),
            ],
            'specialties.*.years_experience' => [
                'nullable',
                'integer',
                'min:0',
                'max:100',
            ],
            'service_areas' => ['sometimes', 'array', 'max:100'],
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
                if (! $this->has('service_areas')) {
                    return;
                }

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

                    if ($cityId !== null && ! \App\Models\City::query()
                        ->whereKey($cityId)
                        ->where('province_id', $provinceId)
                        ->exists()) {
                        $validator->errors()->add(
                            "service_areas.{$index}.city_id",
                            'The selected city does not belong to the selected province.',
                        );
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
