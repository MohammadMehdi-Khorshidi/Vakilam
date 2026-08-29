<?php

namespace App\Services\LawyerSelection;

use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * Compatibility wrapper for the legacy LegalRequest final-selection endpoint.
 *
 * New frontend integrations should use:
 * POST /api/legal-requests/{legalRequest}/proposals/{proposal:public_id}/select
 *
 * The legacy endpoint delegates to ProposalSelectionService so both routes use
 * the exact same atomic selection, cancellation and idempotency rules.
 */
class FinalLawyerSelectionService
{
    public function __construct(
        private readonly ProposalSelectionService $proposalSelectionService,
    ) {
    }

    /** @return array{proposal: LawyerProposal, engagement: \App\Models\Engagement, created: bool} */
    public function select(
        LegalRequest $legalRequest,
        string $proposalPublicId,
        User $client,
        ?string $ipAddress = null,
    ): array {
        $proposal = LawyerProposal::query()
            ->where('public_id', $proposalPublicId)
            ->where(function ($query) use ($legalRequest): void {
                $query->where('legal_request_id', $legalRequest->id)
                    ->orWhereHas(
                        'distribution',
                        fn ($distributionQuery) => $distributionQuery
                            ->where('legal_request_id', $legalRequest->id),
                    );
            })
            ->first();

        if ($proposal === null || ! in_array($proposal->status, [
            LawyerProposal::STATUS_SUBMITTED,
            LawyerProposal::STATUS_SELECTED,
        ], true)) {
            throw ValidationException::withMessages([
                'proposal_public_id' => [
                    'The selected proposal must be a submitted final proposal for this legal request.',
                ],
            ]);
        }

        return $this->proposalSelectionService->select(
            $proposal,
            $client,
            $ipAddress,
        );
    }

    public function current(LegalRequest $legalRequest): ?LawyerProposal
    {
        $proposal = LawyerProposal::query()
            ->where('status', LawyerProposal::STATUS_SELECTED)
            ->where(function ($query) use ($legalRequest): void {
                $query->where('legal_request_id', $legalRequest->id)
                    ->orWhereHas(
                        'distribution',
                        fn ($distributionQuery) => $distributionQuery
                            ->where('legal_request_id', $legalRequest->id),
                    );
            })
            ->first();

        return $proposal === null ? null : $this->loadSelection($proposal);
    }

    private function loadSelection(LawyerProposal $proposal): LawyerProposal
    {
        return $proposal->load([
            'negotiation:id,public_id,status',
            'lawyerProfile.lawyerSpecialties.specialty:id,code,name,status',
            'lawyerProfile.serviceAreas.province:id,name',
            'lawyerProfile.serviceAreas.city:id,province_id,name',
        ]);
    }
}
