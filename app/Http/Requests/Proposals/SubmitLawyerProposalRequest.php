<?php

namespace App\Http\Requests\Proposals;

use App\Models\LawyerProposal;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

    /** @return array<int, callable> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $proposal = $this->route('proposal');

            if (! $proposal instanceof LawyerProposal) {
                return;
            }

            $proposal->loadMissing('distribution.legalRequest');

            if ($proposal->status !== LawyerProposal::STATUS_DRAFT
                || $proposal->distribution?->legalRequest?->status !== 'submitted') {
                return;
            }

            if (blank($proposal->summary)) {
                $validator->errors()->add('summary', 'A proposal summary is required before submission.');
            }

            if ($proposal->proposed_fee_rial === null) {
                $validator->errors()->add('proposed_fee_rial', 'A proposed fee is required before submission.');
            }

            if ($proposal->estimated_days === null || $proposal->estimated_days < 1) {
                $validator->errors()->add('estimated_days', 'Estimated days must be at least 1 before submission.');
            }
        }];
    }
}
