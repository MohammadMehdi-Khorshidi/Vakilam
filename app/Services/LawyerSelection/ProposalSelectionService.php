<?php

namespace App\Services\LawyerSelection;

use App\Models\AuditLog;
use App\Models\Engagement;
use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Negotiation;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class ProposalSelectionService
{
    /**
     * Atomically select one submitted FINAL proposal and create the single
     * pre-contract Engagement. A proposal is final only when it belongs to a
     * valid negotiation that already reached proposal_submitted state.
     *
     * @return array{proposal: LawyerProposal, engagement: Engagement, created: bool}
     */
    public function select(
        LawyerProposal $proposal,
        User $client,
        ?string $ipAddress = null,
    ): array {
        return DB::transaction(function () use ($proposal, $client, $ipAddress): array {
            $lockedProposal = LawyerProposal::query()
                ->with(['distribution', 'negotiation', 'lawyerProfile.user'])
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedProposal->legal_request_id !== null,
                409,
                'Proposal legal request is not available.',
            );

            $legalRequest = LegalRequest::query()
                ->whereKey($lockedProposal->legal_request_id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $legalRequest->client_user_id === $client->id,
                403,
                'You are not allowed to select this proposal.',
            );

            if ($lockedProposal->status === LawyerProposal::STATUS_SELECTED) {
                $existingEngagement = Engagement::query()
                    ->where('proposal_id', $lockedProposal->id)
                    ->first();

                abort_unless(
                    $existingEngagement !== null,
                    409,
                    'Selected proposal has no engagement.',
                );

                return [
                    'proposal' => $this->loadProposalForResponse($lockedProposal),
                    'engagement' => $existingEngagement,
                    'created' => false,
                ];
            }

            abort_unless(
                $lockedProposal->status === LawyerProposal::STATUS_SUBMITTED,
                409,
                'Only submitted final proposals can be selected.',
            );

            abort_unless(
                $lockedProposal->expires_at !== null
                    && $lockedProposal->expires_at->isFuture(),
                409,
                'This proposal has expired.',
            );

            abort_unless(
                $legalRequest->status === 'submitted'
                    && $legalRequest->service_intent === 'lawyer_selection',
                409,
                'This legal request is not available for lawyer selection.',
            );

            $negotiation = $lockedProposal->negotiation;

            abort_unless(
                $negotiation !== null
                    && $negotiation->legal_request_id === $legalRequest->id
                    && $negotiation->lawyer_profile_id === $lockedProposal->lawyer_profile_id
                    && $negotiation->status === Negotiation::STATUS_PROPOSAL_SUBMITTED,
                409,
                'The selected proposal is not the final output of an active negotiation.',
            );

            $lawyerProfile = $lockedProposal->lawyerProfile;

            abort_unless(
                $lawyerProfile !== null
                    && $lawyerProfile->verification_status === 'approved'
                    && $lawyerProfile->user?->status === 'active'
                    && $lawyerProfile->user?->mayActAsRole('lawyer'),
                409,
                'The selected lawyer is no longer eligible.',
            );

            $existingEngagement = Engagement::query()
                ->where('legal_request_id', $legalRequest->id)
                ->first();

            abort_if(
                $existingEngagement !== null,
                409,
                'A lawyer has already been selected for this legal request.',
            );

            LawyerProposal::query()
                ->where('legal_request_id', $legalRequest->id)
                ->whereKeyNot($lockedProposal->id)
                ->whereIn('status', [
                    LawyerProposal::STATUS_DRAFT,
                    LawyerProposal::STATUS_SUBMITTED,
                    LawyerProposal::STATUS_SHORTLISTED,
                ])
                ->update(['status' => LawyerProposal::STATUS_CANCELLED]);

            $lockedProposal->forceFill([
                'status' => LawyerProposal::STATUS_SELECTED,
            ])->save();

            Negotiation::query()
                ->where('legal_request_id', $legalRequest->id)
                ->whereKeyNot($negotiation->id)
                ->whereIn('status', [
                    Negotiation::STATUS_ACTIVE,
                    Negotiation::STATUS_PROPOSAL_SUBMITTED,
                ])
                ->update([
                    'status' => Negotiation::STATUS_CANCELLED,
                    'closed_at' => now(),
                ]);

            $negotiation->forceFill([
                'status' => Negotiation::STATUS_WON,
                'closed_at' => now(),
            ])->save();

            LegalRequestDistribution::query()
                ->where('legal_request_id', $legalRequest->id)
                ->whereKeyNot($lockedProposal->distribution_id)
                ->whereIn('status', ['pending', 'negotiating', 'interest_pending', 'sent'])
                ->update(['status' => 'cancelled']);

            if ($lockedProposal->distribution_id !== null) {
                LegalRequestDistribution::query()
                    ->whereKey($lockedProposal->distribution_id)
                    ->update(['status' => 'selected']);
            }

            $legalRequest->forceFill(['status' => 'matched'])->save();

            try {
                $engagement = Engagement::query()->create([
                    'legal_request_id' => $legalRequest->id,
                    'proposal_id' => $lockedProposal->id,
                    'client_user_id' => $client->id,
                    'lawyer_profile_id' => $lockedProposal->lawyer_profile_id,
                    'status' => 'pending_contract',
                    'contract_due_at' => now()->addHours(48),
                ]);
            } catch (QueryException $exception) {
                $engagement = Engagement::query()
                    ->where('legal_request_id', $legalRequest->id)
                    ->first();

                if ($engagement === null) {
                    throw $exception;
                }

                abort(409, 'A lawyer has already been selected for this legal request.');
            }

            AuditLog::query()->create([
                'actor_user_id' => $client->id,
                'action' => 'lawyer_proposal.selected',
                'target_type' => LawyerProposal::class,
                'target_id' => $lockedProposal->id,
                'ip_address' => $ipAddress,
                'metadata' => [
                    'legal_request_id' => $legalRequest->id,
                    'negotiation_id' => $negotiation->id,
                    'engagement_id' => $engagement->id,
                    'lawyer_profile_id' => $lockedProposal->lawyer_profile_id,
                ],
            ]);

            return [
                'proposal' => $this->loadProposalForResponse($lockedProposal),
                'engagement' => $engagement,
                'created' => true,
            ];
        });
    }

    private function loadProposalForResponse(LawyerProposal $proposal): LawyerProposal
    {
        $proposal->unsetRelation('distribution');

        return $proposal->load([
            'negotiation:id,public_id,status',
            'lawyerProfile.lawyerSpecialties.specialty:id,code,name,status',
            'lawyerProfile.serviceAreas.province:id,name',
            'lawyerProfile.serviceAreas.city:id,province_id,name',
        ]);
    }
}
