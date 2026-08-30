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
use App\Models\User;
use App\Services\LawyerMatching\LawyerMatchingService;
use App\Services\Negotiations\NegotiationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LawyerSelectionController extends Controller
{
    /**
     * List lawyer invitations for the authenticated lawyer.
     */
    public function lawyerInvitations(Request $request): JsonResponse
    {
        $user = $request->user();

        $profile = $user instanceof User
            ? $user->lawyerProfile
            : null;

        abort_unless(
            $user instanceof User
            && $user->status === 'active'
            && $profile !== null
            && $profile->verification_status === 'approved',
            403,
            'Only approved lawyers can view invitations.',
        );

        $invitations = $profile->distributions()
            ->with([
                'legalRequest.legalCategory',
                'legalRequest.province',
                'legalRequest.city',
                'negotiation',
            ])
            ->latest('sent_at')
            ->paginate(20);

        $invitations->through(
            fn (LegalRequestDistribution $distribution): array => [
                'distribution_id' => $distribution->id,
                'status' => $distribution->status,
                'sent_at' => $distribution->sent_at?->toISOString(),
                'expires_at' => $distribution->expires_at?->toISOString(),
                'negotiation_public_id' => $distribution->negotiation?->public_id,
                'legal_request' => [
                    'public_id' => $distribution->legalRequest?->public_id,
                    'title' => $distribution->legalRequest?->title,
                    'description' => $distribution->legalRequest?->description,
                    'urgency' => $distribution->legalRequest?->urgency,
                    'category' => $distribution->legalRequest?->legalCategory?->name,
                    'province' => $distribution->legalRequest?->province?->name,
                    'city' => $distribution->legalRequest?->city?->name,
                ],
            ],
        );

        return response()->json($invitations);
    }

    /**
     * List lawyer invitations for a client's legal request.
     */
    public function clientInvitations(
        Request $request,
        LegalRequest $legalRequest,
    ): JsonResponse {
        $user = $request->user();

        abort_unless(
            $user instanceof User
            && $user->status === 'active'
            && $legalRequest->client_user_id === $user->id,
            403,
            'You are not allowed to view these lawyer invitations.',
        );

        return response()->json([
            'data' => $legalRequest->distributions()
                ->with([
                    'lawyerProfile',
                    'negotiation',
                ])
                ->orderBy('sent_at')
                ->get()
                ->map(
                    fn (LegalRequestDistribution $distribution): array => [
                        'distribution_id' => $distribution->id,
                        'status' => $distribution->status,
                        'sent_at' => $distribution->sent_at?->toISOString(),
                        'responded_at' => $distribution->responded_at?->toISOString(),
                        'expires_at' => $distribution->expires_at?->toISOString(),
                        'closed_at' => $distribution->closed_at?->toISOString(),
                        'negotiation_public_id' => $distribution->negotiation?->public_id,
                        'lawyer' => [
                            'public_id' => $distribution->lawyerProfile?->public_id,
                            'full_name' => $distribution->lawyerProfile?->full_name,
                            'average_rating' => $distribution->lawyerProfile?->average_rating,
                        ],
                    ],
                ),
        ]);
    }

    /**
     * Compatibility endpoint for sending one client invitation.
     *
     * The canonical bulk endpoint remains:
     * /legal-requests/{legalRequest}/lawyer-requests
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

        $distribution = $distributions->firstWhere(
            'lawyer_profile_id',
            $lawyerProfile->id,
        );

        abort_unless(
            $distribution instanceof LegalRequestDistribution,
            500,
            'Failed to create lawyer request.',
        );

        return response()->json([
            'message' => 'Lawyer collaboration request sent successfully.',
            'distribution' => $distribution,
        ], 201);
    }

    /**
     * Accepting or rejecting a direct lawyer invitation.
     *
     * Accepting opens a Negotiation.
     * It never creates an Engagement.
     */
    public function respond(
        RespondLawyerSelectionRequest $request,
        LegalRequestDistribution $distribution,
        NegotiationService $negotiationService,
    ): JsonResponse {
        $result = DB::transaction(
            function () use (
                $request,
                $distribution,
                $negotiationService
            ): array {
                $lockedDistribution = LegalRequestDistribution::query()
                    ->whereKey($distribution->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                /*
                 * The lawyer can only respond to a client invitation
                 * that is still pending.
                 */
                abort_unless(
                    $lockedDistribution->source === Negotiation::SOURCE_CLIENT_INVITE
                    && $lockedDistribution->status === 'pending',
                    409,
                    'This lawyer request is no longer pending.',
                );

                /*
                 * An invitation without an expiry date is treated
                 * as invalid/expired by the current business rule.
                 */
                if (
                    $lockedDistribution->expires_at === null
                    || ! $lockedDistribution->expires_at->isFuture()
                ) {
                    $lockedDistribution->forceFill([
                        'status' => 'expired',
                        'responded_at' => now(),
                        'closed_at' => now(),
                    ])->save();

                    $this->audit(
                        $request,
                        $lockedDistribution,
                        'lawyer_invitation.expired',
                    );

                    return [
                        'distribution' => $lockedDistribution,
                        'negotiation' => null,
                        'accepted' => false,
                        'expired' => true,
                    ];
                }

                /*
                 * Lock the legal request as well so that its state
                 * cannot change during the response transaction.
                 */
                $legalRequest = LegalRequest::query()
                    ->whereKey($lockedDistribution->legal_request_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                abort_unless(
                    $legalRequest->status === 'submitted'
                    && $legalRequest->service_intent === 'lawyer_selection',
                    409,
                    'This legal request is not available for negotiation.',
                );

                /*
                 * Reject invitation.
                 */
                if ($request->validated('action') === 'reject') {
                    $lockedDistribution->forceFill([
                        'status' => 'rejected',
                        'responded_at' => now(),
                        'closed_at' => now(),
                    ])->save();

                    $this->audit(
                        $request,
                        $lockedDistribution,
                        'lawyer_invitation.rejected',
                    );

                    return [
                        'distribution' => $lockedDistribution,
                        'negotiation' => null,
                        'accepted' => false,
                        'expired' => false,
                    ];
                }

                /*
                 * Accept invitation.
                 *
                 * NegotiationService is the canonical owner of
                 * negotiation creation/opening.
                 */
                $lockedDistribution->forceFill([
                    'status' => 'negotiating',
                    'responded_at' => now(),
                ])->save();

                $negotiation = $negotiationService->openForDistribution(
                    $lockedDistribution,
                    Negotiation::SOURCE_CLIENT_INVITE,
                );

                $this->audit(
                    $request,
                    $lockedDistribution,
                    'lawyer_selection.negotiation_opened',
                    [
                        'negotiation_id' => $negotiation->id,
                    ],
                );

                return [
                    'distribution' => $lockedDistribution,
                    'negotiation' => $negotiation,
                    'accepted' => true,
                    'expired' => false,
                ];
            },
        );

        /*
         * Expired invitation.
         */
        if ($result['expired']) {
            return response()->json([
                'message' => 'This lawyer request has expired.',
                'distribution' => $result['distribution'],
                'negotiation' => null,
                'engagement' => null,
            ], 409);
        }

        /*
         * Accepted / rejected invitation.
         */
        return response()->json([
            'message' => $result['accepted']
                ? 'Lawyer collaboration request accepted and negotiation opened.'
                : 'Lawyer collaboration request rejected successfully.',

            'distribution' => $result['distribution'],

            'negotiation' => $result['negotiation'] === null
                ? null
                : [
                    'public_id' => $result['negotiation']->public_id,
                    'status' => $result['negotiation']->status,
                ],

            'engagement' => null,
        ], $result['accepted'] ? 201 : 200);
    }

    /**
     * Write an audit log entry for a lawyer-selection action.
     *
     * @param array<string, mixed> $metadata
     */
    private function audit(
        RespondLawyerSelectionRequest $request,
        LegalRequestDistribution $distribution,
        string $action,
        array $metadata = [],
    ): void {
        AuditLog::query()->create([
            'actor_user_id' => $request->user()->id,
            'action' => $action,
            'target_type' => LegalRequestDistribution::class,
            'target_id' => $distribution->id,
            'ip_address' => $request->ip(),
            'metadata' => [
                'legal_request_id' => $distribution->legal_request_id,
                'lawyer_profile_id' => $distribution->lawyer_profile_id,
                ...$metadata,
            ],
        ]);
    }
}
