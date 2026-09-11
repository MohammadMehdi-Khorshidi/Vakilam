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
                'legalRequest.parties',
                'legalRequest.documents' => fn ($query) => $query
                    ->where('status', '!=', 'archived')
                    ->latest('created_at'),
                'legalRequest.documents.documentType',
                'legalRequest.documents.currentFile',
                'negotiation',
            ])
            ->latest('sent_at')
            ->paginate(20);

        $invitations->through(
            fn (LegalRequestDistribution $distribution): array => [
                'distribution_id' => $distribution->id,
                'status' => $distribution->status,
                'sent_at' => $distribution->sent_at?->toISOString(),
                'responded_at' => $distribution->responded_at?->toISOString(),
                'expires_at' => $distribution->expires_at?->toISOString(),
                'closed_at' => $distribution->closed_at?->toISOString(),
                'negotiation_public_id' => $distribution->negotiation?->public_id,
                'legal_request' => $distribution->legalRequest === null
                    ? null
                    : [
                        'public_id' => $distribution->legalRequest->public_id,
                        'title' => $distribution->legalRequest->title,
                        'description' => $distribution->legalRequest->description,
                        'urgency' => $distribution->legalRequest->urgency,
                        'service_intent' => $distribution->legalRequest->service_intent,
                        'status' => $distribution->legalRequest->status,
                        'submitted_at' => $distribution->legalRequest->submitted_at?->toISOString(),
                        'created_at' => $distribution->legalRequest->created_at?->toISOString(),
                        'category' => $distribution->legalRequest->legalCategory?->name,
                        'province' => $distribution->legalRequest->province?->name,
                        'city' => $distribution->legalRequest->city?->name,
                        'parties' => $distribution->legalRequest->parties
                            ->map(fn ($party): array => [
                                'id' => $party->id,
                                'party_role' => $party->party_role,
                                'full_name' => $party->full_name,
                                'relation_note' => $party->relation_note,
                                'is_client' => (bool) $party->is_client,
                            ])
                            ->values(),
                        'documents' => $distribution->legalRequest->documents
                            ->map(fn ($document): array => [
                                'id' => $document->id,
                                'public_id' => $document->public_id,
                                'title' => $document->title,
                                'status' => $document->status,
                                'document_type' => $document->documentType === null
                                    ? null
                                    : [
                                        'id' => $document->documentType->id,
                                        'code' => $document->documentType->code,
                                        'name' => $document->documentType->name,
                                    ],
                                'current_file' => $document->currentFile === null
                                    ? null
                                    : [
                                        'original_name' => $document->currentFile->original_name,
                                        'mime_type' => $document->currentFile->mime_type,
                                        'size_bytes' => $document->currentFile->size_bytes,
                                    ],
                            ])
                            ->values(),
                    ],
            ],
        );

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

    public function store(
        SendLawyerSelectionRequest $request,
        LegalRequest $legalRequest,
        LawyerProfile $lawyerProfile,
        LawyerMatchingService $matchingService,
    ): JsonResponse {
        $previousInvitation = LegalRequestDistribution::query()
            ->where('legal_request_id', $legalRequest->id)
            ->where('lawyer_profile_id', $lawyerProfile->id)
            ->where('source', Negotiation::SOURCE_CLIENT_INVITE)
            ->first();

        abort_if(
            $previousInvitation?->status === 'rejected',
            409,
            'This lawyer has already rejected this legal request and cannot be invited again.',
        );

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
            'negotiation' => $result['negotiation'] === null
                ? null
                : [
                    'public_id' => $result['negotiation']->public_id,
                    'status' => $result['negotiation']->status,
                ],
            'engagement' => null,
        ], $result['accepted'] ? 201 : 200);
    }

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
