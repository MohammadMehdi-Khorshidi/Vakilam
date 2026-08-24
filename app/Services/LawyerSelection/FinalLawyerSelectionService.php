<?php

namespace App\Services\LawyerSelection;

use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinalLawyerSelectionService
{
    public function select(
        LegalRequest $legalRequest,
        string $proposalPublicId,
    ): LawyerProposal
    {
        return DB::transaction(function () use ($legalRequest, $proposalPublicId): LawyerProposal {
            $lockedRequest = LegalRequest::query()
                ->whereKey($legalRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedRequest->status === 'submitted'
                    && $lockedRequest->service_intent === 'lawyer_selection',
                409,
                'A lawyer can only be selected for a submitted lawyer-selection request.',
            );

            $alreadySelected = LawyerProposal::query()
                ->where('status', 'selected')
                ->whereHas(
                    'distribution',
                    fn ($query) => $query->where('legal_request_id', $lockedRequest->id),
                )
                ->exists();

            abort_if(
                $alreadySelected,
                409,
                'A lawyer has already been selected for this legal request.',
            );

            $proposal = LawyerProposal::query()
                ->with([
                    'distribution',
                    'lawyerProfile.user',
                    'lawyerProfile.lawyerSpecialties.specialty:id,code,name,status',
                    'lawyerProfile.serviceAreas.province:id,name',
                    'lawyerProfile.serviceAreas.city:id,province_id,name',
                ])
                ->where('public_id', $proposalPublicId)
                ->whereHas(
                    'distribution',
                    fn ($query) => $query->where('legal_request_id', $lockedRequest->id),
                )
                ->lockForUpdate()
                ->first();

            if ($proposal === null || $proposal->status !== 'submitted') {
                throw ValidationException::withMessages([
                    'proposal_public_id' => [
                        'The selected proposal must be a submitted proposal for this legal request.',
                    ],
                ]);
            }

            $distribution = $proposal->distribution;
            $lawyerProfile = $proposal->lawyerProfile;

            abort_if(
                $proposal->expires_at?->isPast()
                    || $distribution === null
                    || $distribution->status === 'expired'
                    || $distribution->expires_at?->isPast(),
                409,
                'The selected proposal is no longer available.',
            );

            abort_unless(
                $lawyerProfile !== null
                    && $lawyerProfile->id === $distribution->lawyer_profile_id
                    && $lawyerProfile->verification_status === 'approved'
                    && $lawyerProfile->user?->status === 'active',
                409,
                'The selected lawyer is no longer eligible.',
            );

            LawyerProposal::query()
                ->where('id', '!=', $proposal->id)
                ->whereIn('status', ['draft', 'submitted', 'shortlisted'])
                ->whereHas(
                    'distribution',
                    fn ($query) => $query->where('legal_request_id', $lockedRequest->id),
                )
                ->update(['status' => 'rejected']);

            $proposal->forceFill(['status' => 'selected'])->save();
            $lockedRequest->forceFill(['status' => 'matched'])->save();

            return $this->loadSelection($proposal);
        });
    }

    public function current(LegalRequest $legalRequest): ?LawyerProposal
    {
        $proposal = LawyerProposal::query()
            ->where('status', 'selected')
            ->whereHas(
                'distribution',
                fn ($query) => $query->where('legal_request_id', $legalRequest->id),
            )
            ->first();

        return $proposal === null ? null : $this->loadSelection($proposal);
    }

    private function loadSelection(LawyerProposal $proposal): LawyerProposal
    {
        return $proposal->load([
            'lawyerProfile.lawyerSpecialties.specialty:id,code,name,status',
            'lawyerProfile.serviceAreas.province:id,name',
            'lawyerProfile.serviceAreas.city:id,province_id,name',
        ]);
    }
}
