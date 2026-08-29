<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Proposals\SelectLawyerProposalRequest;
use App\Http\Requests\Proposals\StoreLawyerProposalRequest;
use App\Http\Requests\Proposals\SubmitLawyerProposalRequest;
use App\Http\Requests\Proposals\UpdateLawyerProposalRequest;
use App\Http\Requests\Proposals\WithdrawLawyerProposalRequest;
use App\Models\AuditLog;
use App\Models\Engagement;
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

        /*
         * Use a database transaction and row lock to prevent concurrent
         * requests from creating duplicate proposals for one distribution.
         */
        $proposal = DB::transaction(function () use (
            $request,
            $distribution,
            $user,
        ): LawyerProposal {
            $lockedDistribution = LegalRequestDistribution::query()
                ->with('legalRequest')
                ->whereKey($distribution->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * A proposal may only be created for a LegalRequest
             * that has already been submitted by the client.
             */
            abort_unless(
                $lockedDistribution->legalRequest !== null
                    && $lockedDistribution->legalRequest->status === 'submitted',
                409,
                'Proposal can only be created for a submitted legal request.',
            );

            abort_unless(
                $lockedDistribution->status === 'sent',
                409,
                'A proposal cannot be created for this distribution.',
            );

            /*
             * The database also protects this with a unique constraint,
             * but this explicit check provides a clear API error message.
             */
            abort_if(
                LawyerProposal::query()
                    ->where('distribution_id', $lockedDistribution->id)
                    ->exists(),
                409,
                'A proposal already exists for this distribution.',
            );

            /*
             * Lawyer ownership and verification have already been checked
             * by StoreLawyerProposalRequest::authorize().
             */
            $lawyerProfile = $user->lawyerProfile;

            /*
             * Every newly created proposal starts as a draft.
             * Status cannot be supplied directly by the API consumer.
             */
            return LawyerProposal::query()->create([
                'legal_request_id' => $lockedDistribution->legal_request_id,
                'distribution_id' => $lockedDistribution->id,
                'lawyer_profile_id' => $lawyerProfile->id,
                'summary' => $request->validated('summary'),
                'proposed_fee_rial' => $request->validated('proposed_fee_rial'),
                'estimated_days' => $request->validated('estimated_days'),
                'status' => 'draft',
            ]);
        });

        return response()->json([
            'message' => 'Proposal draft created successfully.',
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
                $lockedProposal->status === 'draft',
                409,
                'Only draft proposals can be updated.',
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
        /*
         * Lock the proposal row during the state transition so that
         * concurrent requests cannot submit the same proposal twice.
         */
        $proposal = DB::transaction(function () use ($proposal): LawyerProposal {
            $lockedProposal = LawyerProposal::query()
                ->with('distribution.legalRequest')
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * Only a draft proposal may move to the submitted state.
             */
            abort_unless(
                $lockedProposal->status === 'draft',
                409,
                'Only draft proposals can be submitted.',
            );

            /*
             * The underlying LegalRequest must still be submitted.
             */
            abort_unless(
                $lockedProposal->distribution?->legalRequest?->status === 'submitted',
                409,
                'Proposal cannot be submitted for this legal request.',
            );

            /*
             * Finalize the proposal submission.
             */
            $submittedAt = now();

            $lockedProposal->forceFill([
                'status' => 'submitted',
                'submitted_at' => $submittedAt,
                'expires_at' => $submittedAt->copy()->addHours(72),
            ])->save();

            /*
             * These relations were loaded only for server-side validation
             * and should not be exposed automatically in the API response.
             */
            $lockedProposal->unsetRelation('distribution');

            return $lockedProposal;
        });

        return response()->json([
            'message' => 'Proposal submitted successfully.',
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

            $lockedProposal->forceFill([
                'status' => 'withdrawn',
            ])->save();

            return $lockedProposal;
        });

        return response()->json([
            'message' => 'Proposal withdrawn successfully.',
            'proposal' => $proposal,
        ]);
    }

    /**
     * Select a submitted lawyer proposal.
     *
     * Selection creates the pre-contract Engagement atomically.
     * It does not create a LegalMatter.
     */
    public function select(
        SelectLawyerProposalRequest $request,
        LawyerProposal $proposal,
    ): JsonResponse {
        /** @var User $client */
        $client = $request->user();

        $result = DB::transaction(function () use (
            $request,
            $proposal,
            $client,
        ): array {
            $lockedProposal = LawyerProposal::query()
                ->with('distribution')
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            $distribution = $lockedProposal->distribution;

            abort_unless(
                $distribution !== null,
                409,
                'Proposal distribution is not available.',
            );

            /*
             * The LegalRequest is the common competition boundary between
             * Proposal selection and direct lawyer selection.
             */
            $legalRequest = LegalRequest::query()
                ->whereKey($distribution->legal_request_id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $legalRequest->client_user_id === $client->id,
                403,
                'You are not allowed to select this proposal.',
            );

            /*
             * Make retries idempotent when this proposal
             * has already been selected successfully.
             */
            if ($lockedProposal->status === 'selected') {
                $existingEngagement = Engagement::query()
                    ->where('proposal_id', $lockedProposal->id)
                    ->first();

                abort_unless(
                    $existingEngagement !== null,
                    409,
                    'Selected proposal has no engagement.',
                );

                /*
                 * Distribution is required only for server-side validation
                 * and should not be exposed in the API response.
                 */
                $lockedProposal->unsetRelation('distribution');

                return [
                    'proposal' => $lockedProposal,
                    'engagement' => $existingEngagement,
                    'created' => false,
                ];
            }

            abort_unless(
                $lockedProposal->status === 'submitted',
                409,
                'Only submitted proposals can be selected.',
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

            /*
             * Prevent two simultaneous active/pre-contract engagements
             * for the same LegalRequest.
             *
             * This protects both possible winning paths:
             * - Client selects a Lawyer Proposal.
             * - Lawyer accepts a direct client request.
             */
            $existingEngagement = Engagement::query()
                ->where('legal_request_id', $legalRequest->id)
                ->whereIn('status', [
                    'pending_contract',
                    'active',
                    'paused',
                ])
                ->first();

            abort_if(
                $existingEngagement !== null,
                409,
                'A lawyer has already been selected for this legal request.',
            );

            /*
             * Mark this proposal as the winning proposal.
             */
            $lockedProposal->forceFill([
                'status' => 'selected',
            ])->save();

            $legalRequest->forceFill([
                'status' => 'matched',
            ])->save();

            LawyerProposal::query()
                ->whereKeyNot($lockedProposal->id)
                ->whereIn('status', ['draft', 'submitted', 'shortlisted'])
                ->whereHas(
                    'distribution',
                    fn ($query) => $query->where('legal_request_id', $legalRequest->id),
                )
                ->update(['status' => 'rejected']);

            /*
             * Create the shared pre-contract Engagement.
             *
             * LegalMatter is intentionally not created here.
             */
            $engagement = Engagement::query()->create([
                'legal_request_id' => $legalRequest->id,
                'proposal_id' => $lockedProposal->id,
                'client_user_id' => $client->id,
                'lawyer_profile_id' => $lockedProposal->lawyer_profile_id,
                'status' => 'pending_contract',
            ]);

            /*
             * A selected Proposal wins the lawyer-selection race.
             *
             * Any direct collaboration requests that are still waiting
             * for lawyer response must now be closed.
             */
            LegalRequestDistribution::query()
                ->where('legal_request_id', $legalRequest->id)
                ->whereKeyNot($distribution->id)
                ->whereIn('status', ['sent', 'pending'])
                ->update([
                    'status' => 'cancelled',
                ]);

            /*
             * Record the final lawyer selection for auditing.
             */
            AuditLog::query()->create([
                'actor_user_id' => $client->id,
                'action' => 'lawyer_proposal.selected',
                'target_type' => LawyerProposal::class,
                'target_id' => $lockedProposal->id,
                'ip_address' => $request->ip(),
                'metadata' => [
                    'legal_request_id' => $legalRequest->id,
                    'engagement_id' => $engagement->id,
                    'lawyer_profile_id' => $lockedProposal->lawyer_profile_id,
                ],
            ]);

            /*
             * Distribution is required only for server-side validation
             * and should not be exposed in the API response.
             */
            $lockedProposal->unsetRelation('distribution');

            return [
                'proposal' => $lockedProposal,
                'engagement' => $engagement,
                'created' => true,
            ];
        });

        return response()->json([
            'message' => $result['created']
                ? 'Lawyer proposal selected successfully.'
                : 'Lawyer proposal was already selected.',
            'proposal' => $result['proposal'],
            'engagement' => $result['engagement'],
        ], $result['created'] ? 201 : 200);
    }
}
