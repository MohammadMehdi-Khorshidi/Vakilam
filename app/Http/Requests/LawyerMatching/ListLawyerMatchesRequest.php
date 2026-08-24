<?php

namespace App\Http\Requests\LawyerMatching;

use Illuminate\Foundation\Http\FormRequest;

class ListLawyerMatchesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
