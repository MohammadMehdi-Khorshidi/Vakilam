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

        return $user->mayActAsRole('lawyer')
            && $lawyerProfile !== null
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

            $proposal->loadMissing(['legalRequest', 'negotiation']);
            $legalRequest = $proposal->legalRequest;

            if ($proposal->status !== LawyerProposal::STATUS_DRAFT
                || $legalRequest?->status !== 'submitted') {
                return;
            }

            if ($proposal->negotiation === null || $proposal->negotiation->status !== \App\Models\Negotiation::STATUS_ACTIVE) {
                $validator->errors()->add('negotiation', 'An active negotiation is required before final proposal submission.');
            }

            if (blank($proposal->summary)) {
                $validator->errors()->add('summary', 'A final proposal explanation is required before submission.');
            }

            if (blank($proposal->service_scope)) {
                $validator->errors()->add('service_scope', 'A service scope is required before submission.');
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
