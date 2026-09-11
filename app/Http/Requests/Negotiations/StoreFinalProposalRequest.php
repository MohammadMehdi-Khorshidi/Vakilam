<?php

namespace App\Http\Requests\Negotiations;

use App\Rules\NoContactInformation;
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
            'summary' => [
                'required',
                'string',
                'max:10000',
                new NoContactInformation(),
            ],
            'service_scope' => [
                'required',
                'string',
                'max:20000',
                new NoContactInformation(),
            ],
            'proposed_fee_rial' => ['required', 'integer', 'min:1'],
            'estimated_days' => ['required', 'integer', 'min:1', 'max:3650'],
        ];
    }
}
