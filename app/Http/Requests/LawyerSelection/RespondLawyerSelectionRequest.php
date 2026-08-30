<?php

namespace App\Http\Requests\LawyerSelection;

use App\Models\LegalRequestDistribution;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RespondLawyerSelectionRequest extends FormRequest
{
    /**
     * Determine whether the authenticated lawyer owns the client invitation.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $distribution = $this->route('distribution');

        if (
            ! $user instanceof User
            || $user->status !== 'active'
            || ! $distribution instanceof LegalRequestDistribution
        ) {
            return false;
        }

        $lawyerProfile = $user->lawyerProfile;

        return $user->mayActAsRole('lawyer')
            && $lawyerProfile !== null
            && $lawyerProfile->verification_status === 'approved'
            && $distribution->lawyer_profile_id === $lawyerProfile->id;
    }

    /**
     * A lawyer may accept the invitation and open negotiation, or reject it.
     */
    public function rules(): array
    {
        return [
            'action' => [
                'required',
                'string',
                Rule::in(['accept', 'reject']),
            ],
        ];
    }
}
