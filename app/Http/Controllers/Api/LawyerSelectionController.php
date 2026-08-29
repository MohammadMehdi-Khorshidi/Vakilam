<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LawyerSelection\RespondLawyerSelectionRequest;
use App\Models\AuditLog;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\NegotiationThread;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LawyerSelectionController extends Controller
{
    public function lawyerInvitations(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user instanceof User ? $user->lawyerProfile : null;
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
                'negotiationThread',
            ])
            ->latest('sent_at')
            ->paginate(20);

        $invitations->through(fn (LegalRequestDistribution $distribution): array => [
            'distribution_id' => $distribution->id,
            'status' => $distribution->status,
            'sent_at' => $distribution->sent_at?->toISOString(),
            'expires_at' => $distribution->expires_at?->toISOString(),
            'negotiation_public_id' => $distribution->negotiationThread?->public_id,
            'legal_request' => [
                'public_id' => $distribution->legalRequest?->public_id,
                'title' => $distribution->legalRequest?->title,
                'description' => $distribution->legalRequest?->description,
                'urgency' => $distribution->legalRequest?->urgency,
                'category' => $distribution->legalRequest?->legalCategory?->name,
                'province' => $distribution->legalRequest?->province?->name,
                'city' => $distribution->legalRequest?->city?->name,
            ],
        ]);

        return response()->json($invitations);
    }

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
                ->with(['lawyerProfile', 'negotiationThread'])
                ->orderBy('sent_at')
                ->get()
                ->map(fn (LegalRequestDistribution $distribution): array => [
                    'distribution_id' => $distribution->id,
                    'status' => $distribution->status,
                    'sent_at' => $distribution->sent_at?->toISOString(),
                    'responded_at' => $distribution->responded_at?->toISOString(),
                    'expires_at' => $distribution->expires_at?->toISOString(),
                    'closed_at' => $distribution->closed_at?->toISOString(),
                    'negotiation_public_id' => $distribution->negotiationThread?->public_id,
                    'lawyer' => [
                        'public_id' => $distribution->lawyerProfile?->public_id,
                        'full_name' => $distribution->lawyerProfile?->full_name,
                        'average_rating' => $distribution->lawyerProfile?->average_rating,
                    ],
                ]),
        ]);
    }

    /** Accepting an invitation opens a negotiation and never an Engagement. */
    public function respond(
        RespondLawyerSelectionRequest $request,
        LegalRequestDistribution $distribution,
    ): JsonResponse {
        $result = DB::transaction(function () use ($request, $distribution): array {
            $lockedDistribution = LegalRequestDistribution::query()
                ->whereKey($distribution->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedDistribution->status === LegalRequestDistribution::STATUS_ACCEPTED) {
                return [
                    'distribution' => $lockedDistribution,
                    'negotiation' => $lockedDistribution->negotiationThread()->firstOrFail(),
                    'created' => false,
                ];
            }

            abort_unless(
                $lockedDistribution->status === LegalRequestDistribution::STATUS_SENT,
                409,
                'This lawyer invitation is no longer awaiting a response.',
            );

            if (
                $lockedDistribution->expires_at !== null
                && ! $lockedDistribution->expires_at->isFuture()
            ) {
                $lockedDistribution->forceFill([
                    'status' => LegalRequestDistribution::STATUS_EXPIRED,
                    'responded_at' => now(),
                    'closed_at' => now(),
                ])->save();

                abort(409, 'This lawyer invitation has expired.');
            }

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

            if ($request->validated('action') === 'reject') {
                $lockedDistribution->forceFill([
                    'status' => LegalRequestDistribution::STATUS_REJECTED,
                    'responded_at' => now(),
                    'closed_at' => now(),
                ])->save();

                $this->audit($request, $lockedDistribution, 'lawyer_invitation.rejected');

                return [
                    'distribution' => $lockedDistribution,
                    'negotiation' => null,
                    'created' => false,
                ];
            }

            $lockedDistribution->forceFill([
                'status' => LegalRequestDistribution::STATUS_ACCEPTED,
                'responded_at' => now(),
            ])->save();

            $negotiation = NegotiationThread::query()->create([
                'distribution_id' => $lockedDistribution->id,
                'status' => NegotiationThread::STATUS_OPEN,
                'started_at' => now(),
            ]);

            $this->audit(
                $request,
                $lockedDistribution,
                'lawyer_invitation.accepted',
                ['negotiation_thread_id' => $negotiation->id],
            );

            return [
                'distribution' => $lockedDistribution,
                'negotiation' => $negotiation,
                'created' => true,
            ];
        });

        return response()->json([
            'message' => $result['negotiation'] === null
                ? 'Lawyer invitation rejected.'
                : ($result['created']
                    ? 'Lawyer invitation accepted and negotiation opened.'
                    : 'The existing negotiation was returned.'),
            'distribution' => $result['distribution'],
            'negotiation' => $result['negotiation'],
        ], $result['created'] ? 201 : 200);
    }

    /** @param array<string, mixed> $metadata */
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
