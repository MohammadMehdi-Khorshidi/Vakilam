<?php

namespace App\Http\Requests\Proposals;

use App\Models\LawyerProposal;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class WithdrawLawyerProposalRequest extends FormRequest
{
    /**
     * Determine whether the authenticated lawyer owns this proposal
     * and is allowed to perform proposal actions.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $proposal = $this->route('proposal');

        if (! $user instanceof User
            || $user->status !== 'active'
            || ! $proposal instanceof LawyerProposal) {
            return false;
        }

        $lawyerProfile = $user->lawyerProfile;

        return $user->mayActAsRole('lawyer')
            && $lawyerProfile !== null
            && $lawyerProfile->verification_status === 'approved'
            && $proposal->lawyer_profile_id === $lawyerProfile->id;
    }

    /**
     * Withdrawal does not require request body fields.
     *
     * The allowed state transition is enforced inside the controller.
     */
    public function rules(): array
    {
        return [];
    }
}