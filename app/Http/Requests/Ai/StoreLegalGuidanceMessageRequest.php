<?php

namespace App\Http\Requests\Ai;

use Illuminate\Foundation\Http\FormRequest;

class StoreLegalGuidanceMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:4000'],
            'legal_request_public_id' => ['nullable', 'uuid'],
            'legal_matter_public_id' => ['nullable', 'uuid'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'message.required' => 'متن پرسش الزامی است.',
            'message.max' => 'متن پرسش نمی‌تواند بیشتر از ۴۰۰۰ نویسه باشد.',
        ];
    }
}
