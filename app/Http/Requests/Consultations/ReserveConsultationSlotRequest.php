<?php

namespace App\Http\Requests\Consultations;

use Illuminate\Foundation\Http\FormRequest;

class ReserveConsultationSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }
}