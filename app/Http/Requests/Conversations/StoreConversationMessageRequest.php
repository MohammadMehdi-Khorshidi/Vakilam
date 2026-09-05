<?php

namespace App\Http\Requests\Conversations;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:5000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'body.required' => 'متن پیام الزامی است.',
            'body.max' => 'متن پیام نمی‌تواند بیشتر از ۵۰۰۰ نویسه باشد.',
        ];
    }
}
