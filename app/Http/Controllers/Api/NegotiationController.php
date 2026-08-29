<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Engagement;
use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\NegotiationThread;
use App\Models\User;
use App\Services\Negotiations\ContactInformationDetector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class NegotiationController extends Controller
{
    public function index(Request $request, LegalRequest $legalRequest): JsonResponse
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $legalRequest->client_user_id === $user->id,
            403,
            'You are not allowed to view these negotiations.',
        );

        $threads = NegotiationThread::query()
            ->whereHas(
                'distribution',
                fn ($query) => $query->where('legal_request_id', $legalRequest->id),
            )
            ->with([
                'distribution.lawyerProfile.user:id,name,last_name,status',
                'proposals' => fn ($query) => $query->latest('version_number'),
            ])
            ->latest('updated_at')
            ->get();

        return response()->json([
            'data' => $threads->map(fn (NegotiationThread $thread) => $this->threadData($thread)),
        ]);
    }

    public function show(Request $request, NegotiationThread $negotiation): JsonResponse
    {
        $this->ensureParticipant($request, $negotiation);

        return response()->json([
            'data' => $this->threadData($negotiation->load([
                'distribution.legalRequest',
                'distribution.lawyerProfile.user:id,name,last_name,status',
                'proposals' => fn ($query) => $query->orderBy('version_number'),
            ])),
        ]);
    }

    public function messages(Request $request, NegotiationThread $negotiation): JsonResponse
    {
        $this->ensureParticipant($request, $negotiation);

        $messages = $negotiation->messages()
            ->with('sender:id,name,last_name')
            ->orderBy('created_at')
            ->paginate(50);

        return response()->json($messages);
    }

    public function storeMessage(
        Request $request,
        NegotiationThread $negotiation,
        ContactInformationDetector $detector,
    ): JsonResponse {
        $user = $this->ensureParticipant($request, $negotiation);
        $data = $request->validate([
            'body' => ['required', 'string', 'max:3000'],
        ]);

        abort_unless(
            $negotiation->status === NegotiationThread::STATUS_OPEN,
            409,
            'This negotiation is closed.',
        );

        if ($detector->containsContactInformation($data['body'])) {
            AuditLog::query()->create([
                'actor_user_id' => $user->id,
                'action' => 'negotiation.contact_information_blocked',
                'target_type' => NegotiationThread::class,
                'target_id' => $negotiation->id,
                'ip_address' => $request->ip(),
                'metadata' => [
                    'content_hash' => hash('sha256', $data['body']),
                ],
            ]);

            throw ValidationException::withMessages([
                'body' => ['Direct contact information cannot be shared before the contract is active.'],
            ]);
        }

        $message = $negotiation->messages()->create([
            'sender_user_id' => $user->id,
            'body' => $data['body'],
        ]);

        return response()->json([
            'message' => 'Negotiation message sent.',
            'data' => $message,
        ], 201);
    }

    /** A proposal is an immutable submitted version prepared by the invited lawyer. */
    public function storeProposal(
        Request $request,
        NegotiationThread $negotiation,
    ): JsonResponse {
        $user = $this->ensureParticipant($request, $negotiation);
        $distribution = $negotiation->distribution()
            ->with(['legalRequest', 'lawyerProfile.user'])
            ->firstOrFail();

        abort_unless(
            $distribution->lawyerProfile?->user_id === $user->id,
            403,
            'Only the invited lawyer can submit a proposal.',
        );

        $data = $request->validate([
            'summary' => ['required', 'string', 'max:3000'],
            'proposed_fee_rial' => ['required', 'integer', 'min:1'],
            'advance_payment_rial' => ['required', 'integer', 'min:0', 'lte:proposed_fee_rial'],
            'estimated_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'service_scope' => ['required', 'array', 'min:1', 'max:50'],
            'service_scope.*' => ['required', 'string', 'max:500'],
            'excluded_services' => ['sometimes', 'array', 'max:50'],
            'excluded_services.*' => ['required', 'string', 'max:500'],
            'payment_terms' => ['required', 'array', 'min:1', 'max:20'],
            'payment_terms.*' => ['required', 'string', 'max:500'],
            'other_terms' => ['nullable', 'string', 'max:5000'],
        ]);

        $proposal = DB::transaction(function () use ($negotiation, $distribution, $data): LawyerProposal {
            $lockedThread = NegotiationThread::query()
                ->whereKey($negotiation->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedThread->status === NegotiationThread::STATUS_OPEN,
                409,
                'This negotiation is closed.',
            );

            $previous = $lockedThread->proposals()
                ->orderByDesc('version_number')
                ->lockForUpdate()
                ->first();

            if ($previous?->status === LawyerProposal::STATUS_SUBMITTED) {
                $previous->forceFill([
                    'status' => LawyerProposal::STATUS_COUNTERED,
                    'countered_at' => now(),
                ])->save();
            }

            $terms = [
                'summary' => $data['summary'],
                'total_fee_rial' => $data['proposed_fee_rial'],
                'advance_payment_rial' => $data['advance_payment_rial'],
                'estimated_days' => $data['estimated_days'],
                'service_scope' => $data['service_scope'],
                'excluded_services' => $data['excluded_services'] ?? [],
                'payment_terms' => $data['payment_terms'],
                'other_terms' => $data['other_terms'] ?? null,
            ];

            $submittedAt = now();

            return LawyerProposal::query()->create([
                'legal_request_id' => $distribution->legal_request_id,
                'distribution_id' => $distribution->id,
                'negotiation_thread_id' => $lockedThread->id,
                'parent_proposal_id' => $previous?->id,
                'version_number' => ($previous?->version_number ?? 0) + 1,
                'lawyer_profile_id' => $distribution->lawyer_profile_id,
                'summary' => $data['summary'],
                'proposed_fee_rial' => $data['proposed_fee_rial'],
                'advance_payment_rial' => $data['advance_payment_rial'],
                'estimated_days' => $data['estimated_days'],
                'service_scope' => $data['service_scope'],
                'excluded_services' => $data['excluded_services'] ?? [],
                'payment_terms' => $data['payment_terms'],
                'other_terms' => $data['other_terms'] ?? null,
                'terms_hash' => hash('sha256', json_encode(
                    $terms,
                    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
                )),
                'status' => LawyerProposal::STATUS_SUBMITTED,
                'source' => LawyerProposal::SOURCE_INVITED,
                'submitted_at' => $submittedAt,
                'expires_at' => $submittedAt->copy()->addHours(72),
            ]);
        });

        return response()->json([
            'message' => 'Proposal version submitted.',
            'data' => $proposal,
        ], 201);
    }

    public function rejectProposal(
        Request $request,
        NegotiationThread $negotiation,
        LawyerProposal $proposal,
    ): JsonResponse {
        $user = $this->ensureParticipant($request, $negotiation);
        $distribution = $negotiation->distribution()->firstOrFail();

        abort_unless(
            $distribution->legalRequest()->value('client_user_id') === $user->id,
            403,
            'Only the client can reject a proposal.',
        );

        DB::transaction(function () use ($negotiation, $proposal): void {
            $lockedThread = NegotiationThread::query()
                ->whereKey($negotiation->id)
                ->lockForUpdate()
                ->firstOrFail();
            $lockedProposal = LawyerProposal::query()
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedThread->status === NegotiationThread::STATUS_OPEN
                    && $lockedProposal->negotiation_thread_id === $lockedThread->id
                    && $lockedProposal->status === LawyerProposal::STATUS_SUBMITTED,
                409,
                'This proposal cannot be rejected.',
            );

            $lockedProposal->forceFill([
                'status' => LawyerProposal::STATUS_REJECTED,
                'rejected_at' => now(),
            ])->save();
        });

        return response()->json([
            'message' => 'Proposal rejected; negotiation remains open.',
        ]);
    }

    public function acceptProposal(
        Request $request,
        NegotiationThread $negotiation,
        LawyerProposal $proposal,
    ): JsonResponse {
        $user = $this->ensureParticipant($request, $negotiation);
        $distribution = $negotiation->distribution()->firstOrFail();
        abort_unless(
            $distribution->legalRequest()->value('client_user_id') === $user->id,
            403,
            'Only the client can accept a proposal.',
        );

        $engagement = DB::transaction(function () use ($request, $user, $negotiation, $proposal): Engagement {
            $lockedThread = NegotiationThread::query()
                ->whereKey($negotiation->id)
                ->lockForUpdate()
                ->firstOrFail();
            $lockedProposal = LawyerProposal::query()
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();
            $distribution = LegalRequestDistribution::query()
                ->whereKey($lockedThread->distribution_id)
                ->lockForUpdate()
                ->firstOrFail();
            $legalRequest = LegalRequest::query()
                ->whereKey($distribution->legal_request_id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $legalRequest->client_user_id === $user->id
                    && $legalRequest->status === 'submitted'
                    && $lockedThread->status === NegotiationThread::STATUS_OPEN
                    && $lockedProposal->negotiation_thread_id === $lockedThread->id
                    && $lockedProposal->status === LawyerProposal::STATUS_SUBMITTED,
                409,
                'This proposal cannot be accepted.',
            );

            abort_unless(
                $lockedProposal->expires_at?->isFuture(),
                409,
                'This proposal has expired.',
            );

            abort_if(
                Engagement::query()->where('legal_request_id', $legalRequest->id)->exists(),
                409,
                'A proposal has already been accepted for this legal request.',
            );

            $lockedProposal->forceFill([
                'status' => LawyerProposal::STATUS_ACCEPTED,
                'accepted_at' => now(),
            ])->save();
            $lockedThread->forceFill([
                'status' => NegotiationThread::STATUS_AGREED,
                'agreed_at' => now(),
                'closed_at' => now(),
            ])->save();
            $distribution->forceFill([
                'status' => LegalRequestDistribution::STATUS_SELECTED,
                'closed_at' => now(),
            ])->save();

            $engagement = Engagement::query()->create([
                'legal_request_id' => $legalRequest->id,
                'proposal_id' => $lockedProposal->id,
                'client_user_id' => $legalRequest->client_user_id,
                'lawyer_profile_id' => $distribution->lawyer_profile_id,
                'status' => 'pending_contract',
            ]);

            $legalRequest->forceFill(['status' => 'matched'])->save();

            $otherThreadIds = NegotiationThread::query()
                ->whereKeyNot($lockedThread->id)
                ->whereHas(
                    'distribution',
                    fn ($query) => $query->where('legal_request_id', $legalRequest->id),
                )
                ->where('status', NegotiationThread::STATUS_OPEN)
                ->pluck('id');

            NegotiationThread::query()
                ->whereIn('id', $otherThreadIds)
                ->update([
                    'status' => NegotiationThread::STATUS_CLOSED,
                    'closed_at' => now(),
                ]);
            LawyerProposal::query()
                ->whereIn('negotiation_thread_id', $otherThreadIds)
                ->whereIn('status', [
                    LawyerProposal::STATUS_DRAFT,
                    LawyerProposal::STATUS_SUBMITTED,
                ])
                ->update([
                    'status' => LawyerProposal::STATUS_REJECTED,
                    'rejected_at' => now(),
                ]);
            LegalRequestDistribution::query()
                ->where('legal_request_id', $legalRequest->id)
                ->whereKeyNot($distribution->id)
                ->whereIn('status', [
                    LegalRequestDistribution::STATUS_SENT,
                    LegalRequestDistribution::STATUS_ACCEPTED,
                ])
                ->update([
                    'status' => LegalRequestDistribution::STATUS_CLOSED,
                    'closed_at' => now(),
                ]);

            AuditLog::query()->create([
                'actor_user_id' => $user->id,
                'action' => 'negotiation.proposal_accepted',
                'target_type' => LawyerProposal::class,
                'target_id' => $lockedProposal->id,
                'ip_address' => $request->ip(),
                'metadata' => [
                    'legal_request_id' => $legalRequest->id,
                    'negotiation_thread_id' => $lockedThread->id,
                    'engagement_id' => $engagement->id,
                ],
            ]);

            return $engagement;
        });

        return response()->json([
            'message' => 'Proposal accepted and pre-contract engagement created.',
            'data' => $engagement,
            'next_action' => 'create_contract',
        ], 201);
    }

    public function cancel(Request $request, NegotiationThread $negotiation): JsonResponse
    {
        $user = $this->ensureParticipant($request, $negotiation);

        DB::transaction(function () use ($request, $user, $negotiation): void {
            $lockedThread = NegotiationThread::query()
                ->whereKey($negotiation->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedThread->status === NegotiationThread::STATUS_OPEN,
                409,
                'This negotiation is already closed.',
            );

            $lockedThread->forceFill([
                'status' => NegotiationThread::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'closed_at' => now(),
            ])->save();
            $lockedThread->distribution()->update([
                'status' => LegalRequestDistribution::STATUS_CANCELLED,
                'closed_at' => now(),
            ]);
            $lockedThread->proposals()
                ->whereIn('status', [
                    LawyerProposal::STATUS_DRAFT,
                    LawyerProposal::STATUS_SUBMITTED,
                ])
                ->update([
                    'status' => LawyerProposal::STATUS_REJECTED,
                    'rejected_at' => now(),
                ]);

            AuditLog::query()->create([
                'actor_user_id' => $user->id,
                'action' => 'negotiation.cancelled',
                'target_type' => NegotiationThread::class,
                'target_id' => $lockedThread->id,
                'ip_address' => $request->ip(),
            ]);
        });

        return response()->json(['message' => 'Negotiation cancelled.']);
    }

    private function ensureParticipant(
        Request $request,
        NegotiationThread $negotiation,
    ): User {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active', 403);

        $negotiation->loadMissing([
            'distribution.legalRequest',
            'distribution.lawyerProfile.user',
        ]);
        $distribution = $negotiation->distribution;

        abort_unless(
            $distribution !== null
                && ($distribution->legalRequest?->client_user_id === $user->id
                    || $distribution->lawyerProfile?->user_id === $user->id),
            403,
            'Only the client and invited lawyer can access this negotiation.',
        );

        return $user;
    }

    /** @return array<string, mixed> */
    private function threadData(NegotiationThread $thread): array
    {
        return [
            'public_id' => $thread->public_id,
            'status' => $thread->status,
            'started_at' => $thread->started_at?->toISOString(),
            'agreed_at' => $thread->agreed_at?->toISOString(),
            'closed_at' => $thread->closed_at?->toISOString(),
            'lawyer' => $thread->distribution?->lawyerProfile === null
                ? null
                : [
                    'public_id' => $thread->distribution->lawyerProfile->public_id,
                    'full_name' => $thread->distribution->lawyerProfile->full_name,
                ],
            'proposals' => $thread->relationLoaded('proposals')
                ? $thread->proposals
                : [],
        ];
    }
}
