<?php

namespace App\Http\Requests\Proposals;

use App\Models\LawyerProposal;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class SubmitLawyerProposalRequest extends FormRequest
{
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

        return $lawyerProfile !== null
            && $lawyerProfile->verification_status === 'approved'
            && $proposal->lawyer_profile_id === $lawyerProfile->id;
    }

    public function rules(): array
    {
        return [];
    }
}