<?php

namespace App\Http\Requests\LawyerMatching;

use App\Services\LawyerMatching\LawyerMatchingService;
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
            'lawyer_public_ids' => [
                'required',
                'array',
                'min:1',
                'max:'.LawyerMatchingService::SELECTION_LIMIT,
            ],
            'lawyer_public_ids.*' => [
                'required',
                'uuid',
                'distinct',
                Rule::exists('lawyer_profiles', 'public_id'),
            ],
        ];
    }
}
