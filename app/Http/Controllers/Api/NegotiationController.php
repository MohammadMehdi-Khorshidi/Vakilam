<?php

namespace App\Http\Controllers\Api;

use App\Events\NegotiationMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Negotiations\StoreFinalProposalRequest;
use App\Http\Requests\Negotiations\StoreNegotiationMessageRequest;
use App\Http\Resources\NegotiationResource;
use App\Models\Engagement;
use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\Negotiation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NegotiationController extends Controller
{
    public function indexForLegalRequest(Request $request, LegalRequest $legalRequest): JsonResponse
    {
        $this->ensureClientOwner($request, $legalRequest);

        $negotiations = $legalRequest->negotiations()
            ->with($this->relations())
            ->latest('opened_at')
            ->get();

        return response()->json([
            'data' => NegotiationResource::collection($negotiations)->resolve(),
        ]);
    }

    public function indexForLawyer(Request $request): JsonResponse
    {
        $user = $this->ensureLawyer($request);
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 50);

        $paginator = Negotiation::query()
            ->where('lawyer_profile_id', $user->lawyerProfile->id)
            ->with($this->relations())
            ->latest('opened_at')
            ->paginate($perPage);

        return response()->json([
            'data' => NegotiationResource::collection(collect($paginator->items()))->resolve(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show(Request $request, Negotiation $negotiation): JsonResponse
    {
        $this->ensureParticipant($request, $negotiation);

        $negotiation->load([
            ...$this->relations(),
            'messages.sender:id,public_id,name,last_name',
        ]);

        return response()->json([
            'data' => NegotiationResource::make($negotiation)->resolve(),
        ]);
    }

    public function message(
        StoreNegotiationMessageRequest $request,
        Negotiation $negotiation,
    ): JsonResponse {
        $user = $this->ensureParticipant($request, $negotiation);

        abort_unless(
            in_array($negotiation->status, [
                Negotiation::STATUS_ACTIVE,
                Negotiation::STATUS_PROPOSAL_SUBMITTED,
                Negotiation::STATUS_WON,
            ], true),
            409,
            'Messages can only be sent while this negotiation is open.',
        );

        $message = $negotiation->messages()->create([
            'sender_user_id' => $user->id,
            'body' => $request->validated('body'),
        ]);

        $message->load('sender:id,public_id,name,last_name');

        broadcast(new NegotiationMessageSent(
            $negotiation->public_id,
            $message,
        ))->toOthers();

        return response()->json([
            'message' => 'Negotiation message sent successfully.',
            'data' => [
                'id' => $message->id,
                'body' => $message->body,
                'created_at' => $message->created_at,
                'sender' => $message->sender === null ? null : [
                    'public_id' => $message->sender->public_id,
                    'name' => $message->sender->name,
                    'last_name' => $message->sender->last_name,
                ],
            ],
        ], 201);
    }

    public function close(Request $request, Negotiation $negotiation): JsonResponse
    {
        $this->ensureParticipant($request, $negotiation);

        $negotiation = DB::transaction(function () use ($negotiation): Negotiation {
            $locked = Negotiation::query()
                ->whereKey($negotiation->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                in_array($locked->status, [
                    Negotiation::STATUS_ACTIVE,
                    Negotiation::STATUS_PROPOSAL_SUBMITTED,
                ], true),
                409,
                'This negotiation is already closed or finalized.',
            );

            abort_if(
                Engagement::query()->where('legal_request_id', $locked->legal_request_id)->exists(),
                409,
                'The legal request already has a selected lawyer.',
            );

            $locked->forceFill([
                'status' => Negotiation::STATUS_CLOSED,
                'closed_at' => now(),
            ])->save();

            $locked->proposals()
                ->whereIn('status', [
                    LawyerProposal::STATUS_DRAFT,
                    LawyerProposal::STATUS_SUBMITTED,
                    LawyerProposal::STATUS_SHORTLISTED,
                ])
                ->update(['status' => LawyerProposal::STATUS_CANCELLED]);

            if ($locked->distribution_id !== null) {
                $locked->distribution()->update([
                    'status' => 'closed',
                    'closed_at' => now(),
                ]);
            }

            return $locked;
        });

        return response()->json([
            'message' => 'Negotiation closed successfully.',
            'data' => NegotiationResource::make(
                $negotiation->load($this->relations())
            )->resolve(),
        ]);
    }

    public function storeFinalProposal(
        StoreFinalProposalRequest $request,
        Negotiation $negotiation,
    ): JsonResponse {
        $user = $this->ensureLawyer($request);

        abort_unless(
            $negotiation->lawyer_profile_id === $user->lawyerProfile->id,
            403,
            'Only the lawyer in this negotiation can create the proposal.',
        );

        $proposal = DB::transaction(function () use ($request, $negotiation): LawyerProposal {
            $locked = Negotiation::query()
                ->with(['legalRequest', 'distribution'])
                ->whereKey($negotiation->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $locked->status === Negotiation::STATUS_ACTIVE,
                409,
                'A new proposal can only be drafted while negotiation is active.',
            );

            abort_if(
                Engagement::query()
                    ->where('legal_request_id', $locked->legal_request_id)
                    ->exists(),
                409,
                'The agreement is already finalized.',
            );

            abort_unless(
                $locked->legalRequest?->status === 'submitted'
                    && $locked->legalRequest?->service_intent === 'lawyer_selection',
                409,
                'This legal request is not available for a proposal.',
            );

            $openProposal = $locked->proposals()
                ->whereIn('status', [
                    LawyerProposal::STATUS_DRAFT,
                    LawyerProposal::STATUS_SUBMITTED,
                    LawyerProposal::STATUS_SHORTLISTED,
                ])
                ->lockForUpdate()
                ->latest('created_at')
                ->first();

            if ($openProposal !== null) {
                abort_unless(
                    $openProposal->status === LawyerProposal::STATUS_DRAFT,
                    409,
                    'Wait for the client to decide on the current proposal.',
                );

                $openProposal->fill($request->validated());
                $openProposal->save();

                return $openProposal;
            }

            return LawyerProposal::query()->create([
                'legal_request_id' => $locked->legal_request_id,
                'negotiation_id' => $locked->id,
                'distribution_id' => $locked->distribution_id,
                'lawyer_profile_id' => $locked->lawyer_profile_id,
                'source' => $locked->source === Negotiation::SOURCE_LAWYER_INTEREST
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
            'message' => 'Proposal draft created successfully.',
            'proposal' => $proposal,
        ], 201);
    }

    private function ensureClientOwner(Request $request, LegalRequest $legalRequest): User
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $legalRequest->client_user_id === $user->id,
            403,
            'You are not allowed to view these negotiations.',
        );

        return $user;
    }

    private function ensureLawyer(Request $request): User
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $user->mayActAsRole('lawyer')
                && $user->lawyerProfile !== null
                && $user->lawyerProfile->verification_status === 'approved',
            403,
            'Only approved lawyers may use negotiations.',
        );

        return $user;
    }

    private function ensureParticipant(Request $request, Negotiation $negotiation): User
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->status === 'active', 403);

        $negotiation->loadMissing([
            'legalRequest:id,client_user_id',
            'lawyerProfile:id,user_id',
        ]);

        $isClient = $negotiation->legalRequest?->client_user_id === $user->id;
        $isLawyer = $negotiation->lawyerProfile?->user_id === $user->id
            && $user->mayActAsRole('lawyer');

        abort_unless(
            $isClient || $isLawyer,
            403,
            'You are not a participant in this negotiation.',
        );

        return $user;
    }

    private function relations(): array
    {
        return [
            'legalRequest:id,public_id,title,status,client_user_id',
            'lawyerProfile:id,public_id,user_id,full_name,verification_status',
            'distribution:id,legal_request_id,lawyer_profile_id,source,status',
            'proposal',
            'proposals:id,public_id,negotiation_id,status,summary,service_scope,proposed_fee_rial,estimated_days,submitted_at,expires_at,created_at',
            'engagement:id,public_id,legal_request_id,proposal_id,status,agreement_snapshot,contract_due_at',
            'engagement.proposal:id,public_id',
        ];
    }
}
