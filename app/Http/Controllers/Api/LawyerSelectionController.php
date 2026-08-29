<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LawyerSelection\RespondLawyerSelectionRequest;
use App\Http\Requests\LawyerSelection\SendLawyerSelectionRequest;
use App\Models\AuditLog;
use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Negotiation;
use App\Services\LawyerMatching\LawyerMatchingService;
use App\Services\Negotiations\NegotiationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class LawyerSelectionController extends Controller
{
    /**
     * Compatibility endpoint for sending one client invitation.
     * The canonical bulk endpoint remains /legal-requests/{legalRequest}/lawyer-requests.
     */
    public function store(
        SendLawyerSelectionRequest $request,
        LegalRequest $legalRequest,
        LawyerProfile $lawyerProfile,
        LawyerMatchingService $matchingService,
    ): JsonResponse {
        $distributions = $matchingService->sendRequests(
            $legalRequest,
            [$lawyerProfile->public_id],
        );

        $distribution = $distributions
            ->firstWhere('lawyer_profile_id', $lawyerProfile->id);

        abort_unless($distribution instanceof LegalRequestDistribution, 500);

        return response()->json([
            'message' => 'Lawyer collaboration request sent successfully.',
            'distribution' => $distribution,
        ], 201);
    }

    /**
     * Accepting a direct invitation opens a Negotiation; it never creates Engagement.
     * Engagement is created only after the client selects a submitted final proposal.
     */
    public function respond(
        RespondLawyerSelectionRequest $request,
        LegalRequestDistribution $distribution,
        NegotiationService $negotiationService,
    ): JsonResponse {
        $result = DB::transaction(function () use ($request, $distribution, $negotiationService): array {
            $lockedDistribution = LegalRequestDistribution::query()
                ->whereKey($distribution->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedDistribution->source === Negotiation::SOURCE_CLIENT_INVITE
                    && $lockedDistribution->status === 'pending',
                409,
                'This lawyer request is no longer pending.',
            );

            if (
                $lockedDistribution->expires_at === null
                || ! $lockedDistribution->expires_at->isFuture()
            ) {
                $lockedDistribution->forceFill([
                    'status' => 'expired',
                    'responded_at' => now(),
                ])->save();

                return [
                    'distribution' => $lockedDistribution,
                    'negotiation' => null,
                    'accepted' => false,
                    'expired' => true,
                ];
            }

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

            if ($request->validated('action') === 'reject') {
                $lockedDistribution->forceFill([
                    'status' => 'rejected',
                    'responded_at' => now(),
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
                    'negotiation' => null,
                    'accepted' => false,
                    'expired' => false,
                ];
            }

            $lockedDistribution->forceFill([
                'status' => 'negotiating',
                'responded_at' => now(),
            ])->save();

            $negotiation = $negotiationService->openForDistribution(
                $lockedDistribution,
                Negotiation::SOURCE_CLIENT_INVITE,
            );

            AuditLog::query()->create([
                'actor_user_id' => $request->user()->id,
                'action' => 'lawyer_selection.negotiation_opened',
                'target_type' => LegalRequestDistribution::class,
                'target_id' => $lockedDistribution->id,
                'ip_address' => $request->ip(),
                'metadata' => [
                    'legal_request_id' => $legalRequest->id,
                    'negotiation_id' => $negotiation->id,
                    'lawyer_profile_id' => $lockedDistribution->lawyer_profile_id,
                ],
            ]);

            return [
                'distribution' => $lockedDistribution,
                'negotiation' => $negotiation,
                'accepted' => true,
                'expired' => false,
            ];
        });

        if ($result['expired']) {
            return response()->json([
                'message' => 'This lawyer request has expired.',
                'distribution' => $result['distribution'],
                'negotiation' => null,
                'engagement' => null,
            ], 409);
        }

        return response()->json([
            'message' => $result['accepted']
                ? 'Lawyer collaboration request accepted and negotiation opened.'
                : 'Lawyer collaboration request rejected successfully.',
            'distribution' => $result['distribution'],
            'negotiation' => $result['negotiation'] === null ? null : [
                'public_id' => $result['negotiation']->public_id,
                'status' => $result['negotiation']->status,
            ],
            'engagement' => null,
        ], $result['accepted'] ? 201 : 200);
    }
}
