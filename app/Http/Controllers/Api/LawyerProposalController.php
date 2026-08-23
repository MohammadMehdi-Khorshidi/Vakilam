<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Proposals\StoreLawyerProposalRequest;
use App\Http\Requests\Proposals\SubmitLawyerProposalRequest;
use App\Http\Requests\Proposals\UpdateLawyerProposalRequest;
use App\Models\LawyerProposal;
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
        $proposal = DB::transaction(function () use ($request, $distribution, $user): LawyerProposal {
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
        $proposal = DB::transaction(function () use ($request, $proposal): LawyerProposal {
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
            $lockedProposal->forceFill([
                'status' => 'submitted',
                'submitted_at' => now(),
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
}