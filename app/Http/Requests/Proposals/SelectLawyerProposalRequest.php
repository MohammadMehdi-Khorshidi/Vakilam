<?php

namespace App\Http\Requests\Proposals;

use App\Models\LawyerProposal;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class SelectLawyerProposalRequest extends FormRequest
{
    /**
     * Determine whether the authenticated client owns
     * the legal request associated with this proposal.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $proposal = $this->route('proposal');

        if (
            ! $user instanceof User
            || $user->status !== 'active'
            || ! $proposal instanceof LawyerProposal
        ) {
            return false;
        }

        $proposal->loadMissing(['legalRequest', 'distribution.legalRequest']);

        $legalRequest = $proposal->legalRequest ?? $proposal->distribution?->legalRequest;

        return $legalRequest?->client_user_id === $user->id;
    }

    /**
     * Selecting a proposal does not require request body fields.
     *
     * Proposal state, expiry, and atomic selection rules
     * are enforced inside the controller.
     */
    public function rules(): array
    {
        return [];
    }
}