<?php

namespace App\Http\Requests\Lawyers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ListLawyersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'specialty_id' => [
                'nullable',
                'uuid',
                Rule::exists('specialties', 'id')->where('status', true),
            ],
            'province_id' => ['nullable', 'integer', Rule::exists('provinces', 'id')],
            'city_id' => ['nullable', 'integer', Rule::exists('cities', 'id')],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (! $this->filled('province_id') || ! $this->filled('city_id')) {
                    return;
                }

                if (! \App\Models\City::query()
                    ->whereKey($this->input('city_id'))
                    ->where('province_id', $this->input('province_id'))
                    ->exists()) {
                    $validator->errors()->add(
                        'city_id',
                        'The selected city does not belong to the selected province.',
                    );
                }
            },
        ];
    }
}
