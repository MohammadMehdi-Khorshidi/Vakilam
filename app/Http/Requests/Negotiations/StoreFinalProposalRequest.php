<?php

namespace App\Http\Requests\Negotiations;

use Illuminate\Foundation\Http\FormRequest;

class StoreFinalProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'summary' => ['nullable', 'string', 'max:10000'],
            'service_scope' => ['nullable', 'string', 'max:20000'],
            'proposed_fee_rial' => ['nullable', 'integer', 'min:0'],
            'estimated_days' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
