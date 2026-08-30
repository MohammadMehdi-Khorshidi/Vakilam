<?php

namespace App\Http\Controllers\Api;

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
        $negotiation->load([...$this->relations(), 'messages.sender:id,public_id,name,last_name']);

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
            $negotiation->status === Negotiation::STATUS_ACTIVE,
            409,
            'Messages can only be sent while the negotiation is active.',
        );

        $message = $negotiation->messages()->create([
            'sender_user_id' => $user->id,
            'body' => $request->validated('body'),
        ]);

        return response()->json([
            'message' => 'Negotiation message sent successfully.',
            'data' => [
                'id' => $message->id,
                'body' => $message->body,
                'created_at' => $message->created_at,
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
                'This negotiation is already closed.',
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

            $proposal = $locked->proposal()->first();
            if ($proposal !== null && in_array($proposal->status, [
                LawyerProposal::STATUS_DRAFT,
                LawyerProposal::STATUS_SUBMITTED,
                LawyerProposal::STATUS_SHORTLISTED,
            ], true)) {
                $proposal->forceFill(['status' => LawyerProposal::STATUS_CANCELLED])->save();
            }

            if ($locked->distribution_id !== null) {
                $locked->distribution()->update(['status' => 'closed']);
            }

            return $locked;
        });

        return response()->json([
            'message' => 'Negotiation closed successfully.',
            'data' => NegotiationResource::make($negotiation->load($this->relations()))->resolve(),
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
            'Only the lawyer in this negotiation can create the final proposal.',
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
                'A final proposal can only be drafted from an active negotiation.',
            );

            abort_unless(
                $locked->legalRequest?->status === 'submitted'
                    && $locked->legalRequest?->service_intent === 'lawyer_selection',
                409,
                'This legal request is not available for a final proposal.',
            );

            $existing = LawyerProposal::query()
                ->where('legal_request_id', $locked->legal_request_id)
                ->where('lawyer_profile_id', $locked->lawyer_profile_id)
                ->lockForUpdate()
                ->first();

            if ($existing !== null) {
                abort_unless(
                    $existing->negotiation_id === $locked->id
                        && $existing->status === LawyerProposal::STATUS_DRAFT,
                    409,
                    'This negotiation already has a finalized proposal.',
                );

                $existing->fill($request->validated());
                $existing->save();

                return $existing;
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
            'message' => 'Final proposal draft created successfully.',
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

        $negotiation->loadMissing(['legalRequest:id,client_user_id', 'lawyerProfile:id,user_id']);

        $isClient = $negotiation->legalRequest?->client_user_id === $user->id;
        $isLawyer = $negotiation->lawyerProfile?->user_id === $user->id
            && $user->mayActAsRole('lawyer');

        abort_unless($isClient || $isLawyer, 403, 'You are not a participant in this negotiation.');

        return $user;
    }

    /** @return array<int, string> */
    private function relations(): array
    {
        return [
            'legalRequest:id,public_id,title,status,client_user_id',
            'lawyerProfile:id,public_id,user_id,full_name,verification_status',
            'distribution:id,legal_request_id,lawyer_profile_id,source,status',
            'proposal:id,public_id,negotiation_id,status,summary,service_scope,proposed_fee_rial,estimated_days,submitted_at,expires_at',
        ];
    }
}
