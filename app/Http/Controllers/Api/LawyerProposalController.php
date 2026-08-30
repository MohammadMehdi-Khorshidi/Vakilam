<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Proposals\SelectLawyerProposalRequest;
use App\Http\Requests\Proposals\StoreLawyerProposalRequest;
use App\Http\Requests\Proposals\SubmitLawyerProposalRequest;
use App\Http\Requests\Proposals\UpdateLawyerProposalRequest;
use App\Http\Requests\Proposals\WithdrawLawyerProposalRequest;
use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class LawyerProposalController extends Controller
{
    /**
     * Create a new proposal draft for an assigned legal request distribution.
     *
     * The authenticated lawyer must:
     * - Be active.
     * - Have an approved lawyer profile.
     * - Own the given distribution.
     *
     * Only one proposal may exist for each distribution.
     */
    public function store(
        StoreLawyerProposalRequest $request,
        LegalRequestDistribution $distribution,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $proposal = DB::transaction(function () use ($request, $distribution, $user): LawyerProposal {
            $lockedDistribution = LegalRequestDistribution::query()
                ->with(['legalRequest', 'negotiation'])
                ->whereKey($distribution->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedDistribution->legalRequest !== null
                    && $lockedDistribution->legalRequest->status === 'submitted',
                409,
                'Proposal can only be created for a submitted legal request.',
            );

            $negotiation = $lockedDistribution->negotiation;

            abort_unless(
                $lockedDistribution->status === 'negotiating'
                    && $negotiation !== null
                    && $negotiation->status === \App\Models\Negotiation::STATUS_ACTIVE,
                409,
                'A final proposal can only be created from an active negotiation.',
            );

            abort_if(
                LawyerProposal::query()
                    ->where('legal_request_id', $lockedDistribution->legal_request_id)
                    ->where('lawyer_profile_id', $lockedDistribution->lawyer_profile_id)
                    ->exists(),
                409,
                'A final proposal already exists for this lawyer and legal request.',
            );

            $lawyerProfile = $user->lawyerProfile;

            return LawyerProposal::query()->create([
                'legal_request_id' => $lockedDistribution->legal_request_id,
                'negotiation_id' => $negotiation->id,
                'distribution_id' => $lockedDistribution->id,
                'lawyer_profile_id' => $lawyerProfile->id,
                'source' => $negotiation->source === \App\Models\Negotiation::SOURCE_LAWYER_INTEREST
                    ? LawyerProposal::SOURCE_OPEN
                    : LawyerProposal::SOURCE_MATCHED,
                'summary' => $request->validated('summary'),
                'service_scope' => $request->validated('service_scope'),
                'proposed_fee_rial' => $request->validated('proposed_fee_rial'),
                'estimated_days' => $request->validated('estimated_days'),
                'status' => LawyerProposal::STATUS_DRAFT,
            ]);
        });

        return response()->json([
            'message' => 'Final proposal draft created successfully.',
            'proposal' => $proposal,
        ], 201);
    }

    /**
     * Update an existing proposal draft.
     *
     * Only the lawyer who owns the proposal may update it,
     * and only while the proposal is still in the "draft" state.
     */
    public function update(
        UpdateLawyerProposalRequest $request,
        LawyerProposal $proposal,
    ): JsonResponse {
        $proposal = DB::transaction(function () use (
            $request,
            $proposal,
        ): LawyerProposal {
            /*
             * Lock the proposal row to prevent concurrent updates
             * from overwriting each other unexpectedly.
             */
            $lockedProposal = LawyerProposal::query()
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * Submitted or otherwise finalized proposals
             * may not be edited through this endpoint.
             */
            abort_unless(
                $lockedProposal->status === LawyerProposal::STATUS_DRAFT,
                409,
                'Only draft proposals can be updated.',
            );

            $lockedProposal->loadMissing('negotiation');
            abort_unless(
                $lockedProposal->negotiation?->status === \App\Models\Negotiation::STATUS_ACTIVE,
                409,
                'Final proposal drafts can only be edited while negotiation is active.',
            );

            /*
             * Update only fields that were actually provided.
             * Status and ownership fields cannot be changed here.
             */
            $lockedProposal->fill($request->validated());
            $lockedProposal->save();

            return $lockedProposal;
        });

        return response()->json([
            'message' => 'Proposal draft updated successfully.',
            'proposal' => $proposal,
        ]);
    }

    /**
     * Submit an existing proposal draft.
     *
     * Submission changes the proposal status from "draft" to "submitted"
     * and records the exact submission timestamp.
     *
     * This action does not create an Engagement.
     */
    public function submit(
        SubmitLawyerProposalRequest $request,
        LawyerProposal $proposal,
    ): JsonResponse {
        $proposal = DB::transaction(function () use ($proposal): LawyerProposal {
            $lockedProposal = LawyerProposal::query()
                ->with(['legalRequest', 'negotiation'])
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedProposal->status === LawyerProposal::STATUS_DRAFT,
                409,
                'Only draft proposals can be submitted.',
            );

            abort_unless(
                $lockedProposal->legalRequest?->status === 'submitted'
                    && $lockedProposal->legalRequest?->service_intent === 'lawyer_selection',
                409,
                'Proposal cannot be submitted for this legal request.',
            );

            abort_unless(
                $lockedProposal->negotiation !== null
                    && $lockedProposal->negotiation->status === \App\Models\Negotiation::STATUS_ACTIVE,
                409,
                'Final proposal submission requires an active negotiation.',
            );

            $submittedAt = now();

            $lockedProposal->forceFill([
                'status' => LawyerProposal::STATUS_SUBMITTED,
                'submitted_at' => $submittedAt,
                'expires_at' => $submittedAt->copy()->addHours(72),
            ])->save();

            $lockedProposal->negotiation->forceFill([
                'status' => \App\Models\Negotiation::STATUS_PROPOSAL_SUBMITTED,
            ])->save();

            $lockedProposal->unsetRelation('negotiation');

            return $lockedProposal;
        });

        return response()->json([
            'message' => 'Final proposal submitted successfully.',
            'proposal' => $proposal,
        ]);
    }

    /**
     * Withdraw a previously submitted proposal.
     *
     * Only the lawyer who owns the proposal may withdraw it.
     * Only submitted proposals can move to the withdrawn state.
     *
     * Withdrawal does not create an Engagement or LegalMatter.
     */
    public function withdraw(
        WithdrawLawyerProposalRequest $request,
        LawyerProposal $proposal,
    ): JsonResponse {
        $proposal = DB::transaction(function () use ($proposal): LawyerProposal {
            $lockedProposal = LawyerProposal::query()
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedProposal->status === 'submitted',
                409,
                'Only submitted proposals can be withdrawn.',
            );

            $lockedProposal->loadMissing('negotiation');

            $lockedProposal->forceFill([
                'status' => LawyerProposal::STATUS_WITHDRAWN,
            ])->save();

            if ($lockedProposal->negotiation !== null
                && $lockedProposal->negotiation->status === \App\Models\Negotiation::STATUS_PROPOSAL_SUBMITTED) {
                $lockedProposal->negotiation->forceFill([
                    'status' => \App\Models\Negotiation::STATUS_CLOSED,
                    'closed_at' => now(),
                ])->save();

                if ($lockedProposal->negotiation->distribution_id !== null) {
                    $lockedProposal->negotiation->distribution()->update(['status' => 'closed']);
                }
            }

            return $lockedProposal;
        });

        return response()->json([
            'message' => 'Proposal withdrawn successfully.',
            'proposal' => $proposal,
        ]);
    }

    /**
     * Select a submitted proposal and create the pre-contract engagement.
     *
     * This endpoint is the canonical proposal-selection endpoint for the frontend.
     */
    public function select(
        SelectLawyerProposalRequest $request,
        LawyerProposal $proposal,
        \App\Services\LawyerSelection\ProposalSelectionService $selectionService,
    ): JsonResponse {
        /** @var User $client */
        $client = $request->user();

        $result = $selectionService->select(
            $proposal,
            $client,
            $request->ip(),
        );

        return response()->json([
            'message' => $result['created']
                ? 'Lawyer proposal selected successfully.'
                : 'Lawyer proposal was already selected.',
            'proposal' => $result['proposal'],
            'engagement' => $result['engagement'],
            'deprecated' => true,
        ], $result['created'] ? 201 : 200);
    }

    public function selectForLegalRequest(
        SelectLawyerProposalRequest $request,
        LegalRequest $legalRequest,
        LawyerProposal $proposal,
        \App\Services\LawyerSelection\ProposalSelectionService $selectionService,
    ): JsonResponse {
        abort_unless(
            $proposal->legal_request_id === $legalRequest->id,
            404,
            'Proposal does not belong to this legal request.',
        );

        /** @var User $client */
        $client = $request->user();
        $result = $selectionService->select($proposal, $client, $request->ip());

        return response()->json([
            'message' => $result['created']
                ? 'Final lawyer proposal selected successfully.'
                : 'Final lawyer proposal was already selected.',
            'proposal' => $result['proposal'],
            'engagement' => $result['engagement'],
        ], $result['created'] ? 201 : 200);
    }

}
