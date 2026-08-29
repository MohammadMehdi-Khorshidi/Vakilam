<?php

namespace App\Http\Requests\Negotiations;

use Illuminate\Foundation\Http\FormRequest;

class StoreNegotiationMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:10000'],
        ];
    }
}
