<?php

namespace App\Http\Requests\LawyerMatching;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendLawyerRequestsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'lawyer_public_ids' => ['required', 'array', 'min:1', 'max:5'],
            'lawyer_public_ids.*' => [
                'required',
                'uuid',
                'distinct',
                Rule::exists('lawyer_profiles', 'public_id'),
            ],
        ];
    }
}
