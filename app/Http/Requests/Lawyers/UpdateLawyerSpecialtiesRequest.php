<?php

namespace App\Http\Requests\Lawyers;

use Illuminate\Validation\Rule;

class UpdateLawyerSpecialtiesRequest extends LawyerProfileRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'specialties' => ['present', 'array', 'max:20'],
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
        ];
    }
}
