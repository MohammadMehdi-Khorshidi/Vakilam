<?php

namespace App\Http\Requests\Negotiations;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RespondLawyerInterestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', 'string', Rule::in(['accept', 'reject'])],
        ];
    }
}
