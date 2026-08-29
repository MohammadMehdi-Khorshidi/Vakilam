<?php

namespace App\Http\Requests\Proposals;

use App\Models\LegalRequestDistribution;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreLawyerProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $distribution = $this->route('distribution');

        if (! $user instanceof User
            || $user->status !== 'active'
            || ! $distribution instanceof LegalRequestDistribution) {
            return false;
        }

        $lawyerProfile = $user->lawyerProfile;

        return $lawyerProfile !== null
            && $lawyerProfile->verification_status === 'approved'
            && $distribution->lawyer_profile_id === $lawyerProfile->id;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'summary' => ['nullable', 'string'],
            'proposed_fee_rial' => ['nullable', 'integer', 'min:0'],
            'estimated_days' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
