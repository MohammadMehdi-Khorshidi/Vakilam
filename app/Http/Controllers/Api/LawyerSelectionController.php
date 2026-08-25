<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LawyerSelection\RespondLawyerSelectionRequest;
use App\Http\Requests\LawyerSelection\SendLawyerSelectionRequest;
use App\Models\AuditLog;
use App\Models\Engagement;
use App\Models\LawyerMatchCandidate;
use App\Models\LawyerProfile;
use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class LawyerSelectionController extends Controller
{
    private const MAX_OPEN_REQUESTS = 5;

    private const REQUEST_EXPIRY_HOURS = 72;

    /**
     * Send a direct collaboration request from the client
     * to one matched lawyer.
     */
    public function store(
        SendLawyerSelectionRequest $request,
        LegalRequest $legalRequest,
        LawyerProfile $lawyerProfile,
    ): JsonResponse {
        $distribution = DB::transaction(function () use (
            $legalRequest,
            $lawyerProfile,
        ): LegalRequestDistribution {
            $lockedRequest = LegalRequest::query()
                ->whereKey($legalRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedRequest->status === 'submitted'
                    && $lockedRequest->service_intent === 'lawyer_selection',
                409,
                'This legal request is not available for lawyer selection.',
            );

            /*
             * Close stale direct collaboration requests before checking
             * idempotency or the client's five-open-request limit.
             */
            LegalRequestDistribution::query()
                ->where('legal_request_id', $lockedRequest->id)
                ->where('status', 'pending')
                ->whereNotNull('expires_at')
                ->where('expires_at', '<=', now())
                ->update([
                    'status' => 'expired',
                ]);

            /*
             * The client may only send a direct collaboration request
             * to a lawyer returned by a completed matching run
             * for this LegalRequest.
             */
            $candidate = LawyerMatchCandidate::query()
                ->where('lawyer_profile_id', $lawyerProfile->id)
                ->whereHas(
                    'matchRun',
                    fn ($query) => $query
                        ->where('legal_request_id', $lockedRequest->id)
                        ->where('status', 'completed'),
                )
                ->first();

            abort_unless(
                $candidate !== null,
                409,
                'This lawyer is not a matching candidate for this legal request.',
            );

            /*
             * A LegalRequest + Lawyer pair has only one Distribution.
             * Matching may already have created it with status "sent".
             */
            $existingDistribution = LegalRequestDistribution::query()
                ->where('legal_request_id', $lockedRequest->id)
                ->where('lawyer_profile_id', $lawyerProfile->id)
                ->lockForUpdate()
                ->first();

            /*
             * Repeating the same direct request while it is still pending
             * is idempotent and does not create a second Distribution.
             */
            if ($existingDistribution?->status === 'pending') {
                return $existingDistribution;
            }

            /*
             * The same lawyer must not simultaneously have:
             *
             * - an active Proposal, and
             * - a direct collaboration request
             *
             * for the same LegalRequest.
             */
            $hasActiveProposal = LawyerProposal::query()
                ->where('lawyer_profile_id', $lawyerProfile->id)
                ->whereHas(
                    'distribution',
                    fn ($query) => $query
                        ->where('legal_request_id', $lockedRequest->id),
                )
                ->whereIn('status', ['submitted', 'shortlisted'])
                ->exists();

            abort_if(
                $hasActiveProposal,
                409,
                'This lawyer already has an active proposal for this legal request.',
            );

            /*
             * A client may have at most five open direct collaboration
             * requests for the same LegalRequest at any one time.
             */
            $openRequestsCount = LegalRequestDistribution::query()
                ->where('legal_request_id', $lockedRequest->id)
                ->where('status', 'pending')
                ->count();

            abort_if(
                $openRequestsCount >= self::MAX_OPEN_REQUESTS,
                409,
                'A maximum of five lawyer requests may be open at the same time.',
            );

            /*
             * Matching may already have distributed the case to this lawyer
             * for the Proposal flow. Reuse that Distribution instead of
             * creating another record.
             *
             * The 72-hour direct-request window starts now.
             */
            if ($existingDistribution !== null) {
                $existingDistribution->forceFill([
                    'match_candidate_id' => $candidate->id,
                    'status' => 'pending',
                    'sent_at' => now(),
                    'viewed_at' => null,
                    'expires_at' => now()->addHours(self::REQUEST_EXPIRY_HOURS),
                ])->save();

                return $existingDistribution->fresh();
            }

            /*
             * This branch is available if a matching candidate exists
             * without a previously persisted Distribution.
             */
            return LegalRequestDistribution::query()->create([
                'legal_request_id' => $lockedRequest->id,
                'lawyer_profile_id' => $lawyerProfile->id,
                'match_candidate_id' => $candidate->id,
                'status' => 'pending',
                'sent_at' => now(),
                'expires_at' => now()->addHours(self::REQUEST_EXPIRY_HOURS),
            ]);
        });

        return response()->json([
            'message' => 'Lawyer collaboration request sent successfully.',
            'distribution' => $distribution,
        ], 201);
    }

    /**
     * Accept or reject a direct collaboration request.
     */
    public function respond(
        RespondLawyerSelectionRequest $request,
        LegalRequestDistribution $distribution,
    ): JsonResponse {
        $result = DB::transaction(function () use ($request, $distribution): array {
            $lockedDistribution = LegalRequestDistribution::query()
                ->whereKey($distribution->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * Only an active direct collaboration request
             * may be accepted or rejected.
             */
            abort_unless(
                $lockedDistribution->status === 'pending',
                409,
                'This lawyer request is no longer pending.',
            );

            /*
             * Direct collaboration requests are valid for 72 hours
             * from the time the client sends them.
             */
            if (
                $lockedDistribution->expires_at === null
                || ! $lockedDistribution->expires_at->isFuture()
            ) {
                $lockedDistribution->forceFill([
                    'status' => 'expired',
                ])->save();

                return [
                    'distribution' => $lockedDistribution,
                    'engagement' => null,
                    'accepted' => false,
                    'expired' => true,
                ];
            }

            /*
             * Lock the LegalRequest as the common competition boundary
             * between Direct Selection and Proposal selection.
             */
            $legalRequest = LegalRequest::query()
                ->whereKey($lockedDistribution->legal_request_id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $legalRequest->status === 'submitted'
                    && $legalRequest->service_intent === 'lawyer_selection',
                409,
                'This legal request is not available for lawyer selection.',
            );

            $action = $request->validated('action');

            /*
             * Rejecting closes only this lawyer's direct request.
             * This frees one of the client's five open-request slots.
             */
            if ($action === 'reject') {
                $lockedDistribution->forceFill([
                    'status' => 'rejected',
                ])->save();

                AuditLog::query()->create([
                    'actor_user_id' => $request->user()->id,
                    'action' => 'lawyer_selection.rejected',
                    'target_type' => LegalRequestDistribution::class,
                    'target_id' => $lockedDistribution->id,
                    'ip_address' => $request->ip(),
                    'metadata' => [
                        'legal_request_id' => $legalRequest->id,
                        'lawyer_profile_id' => $lockedDistribution->lawyer_profile_id,
                    ],
                ]);

                return [
                    'distribution' => $lockedDistribution,
                    'engagement' => null,
                    'accepted' => false,
                    'expired' => false,
                ];
            }

            /*
             * First valid mutual acceptance wins.
             *
             * If an Engagement has already been created by either:
             * - another direct lawyer acceptance, or
             * - a selected Lawyer Proposal,
             *
             * this request cannot win anymore.
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

            $lockedDistribution->forceFill([
                'status' => 'accepted',
            ])->save();

            /*
             * Direct lawyer acceptance creates the same pre-contract
             * Engagement used by the Proposal-selection flow.
             *
             * proposal_id remains null because this Engagement
             * came from direct client selection.
             */
            $engagement = Engagement::query()->create([
                'legal_request_id' => $legalRequest->id,
                'proposal_id' => null,
                'client_user_id' => $legalRequest->client_user_id,
                'lawyer_profile_id' => $lockedDistribution->lawyer_profile_id,
                'status' => 'pending_contract',
            ]);

            /*
             * The winning lawyer closes all remaining open
             * direct collaboration requests for this LegalRequest.
             */
            LegalRequestDistribution::query()
                ->where('legal_request_id', $legalRequest->id)
                ->whereKeyNot($lockedDistribution->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'cancelled',
                ]);

            AuditLog::query()->create([
                'actor_user_id' => $request->user()->id,
                'action' => 'lawyer_selection.accepted',
                'target_type' => LegalRequestDistribution::class,
                'target_id' => $lockedDistribution->id,
                'ip_address' => $request->ip(),
                'metadata' => [
                    'legal_request_id' => $legalRequest->id,
                    'engagement_id' => $engagement->id,
                    'lawyer_profile_id' => $lockedDistribution->lawyer_profile_id,
                ],
            ]);

            return [
                'distribution' => $lockedDistribution,
                'engagement' => $engagement,
                'accepted' => true,
                'expired' => false,
            ];
        });

        if ($result['expired']) {
            return response()->json([
                'message' => 'This lawyer request has expired.',
                'distribution' => $result['distribution'],
                'engagement' => null,
            ], 409);
        }

        return response()->json([
            'message' => $result['accepted']
                ? 'Lawyer collaboration request accepted successfully.'
                : 'Lawyer collaboration request rejected successfully.',
            'distribution' => $result['distribution'],
            'engagement' => $result['engagement'],
        ], $result['accepted'] ? 201 : 200);
    }

}