<?php

namespace App\Http\Requests\Lawyers;

use Illuminate\Foundation\Http\FormRequest;

class StoreLawyerAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'starts_at' => ['required', 'date', 'after:now'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}