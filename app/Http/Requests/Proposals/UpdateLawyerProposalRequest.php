<?php

namespace App\Http\Requests\Proposals;

use App\Models\LawyerProposal;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLawyerProposalRequest extends FormRequest
{
    /**
     * Determine whether the authenticated user may update this proposal.
     *
     * The user must:
     * - Be active.
     * - Have an approved lawyer profile.
     * - Own the proposal being updated.
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

        return $lawyerProfile !== null
            && $lawyerProfile->verification_status === 'approved'
            && $proposal->lawyer_profile_id === $lawyerProfile->id;
    }

    /**
     * Validation rules for editing a proposal draft.
     *
     * "sometimes" allows partial draft updates without requiring
     * the lawyer to send all proposal fields on every autosave/update.
     *
     * Status and ownership fields are intentionally not accepted here.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'summary' => ['sometimes', 'nullable', 'string'],
            'proposed_fee_rial' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'estimated_days' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}