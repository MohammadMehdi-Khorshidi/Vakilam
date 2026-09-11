<?php

namespace App\Http\Controllers\Api;

use App\Events\NegotiationStateChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Proposals\SelectLawyerProposalRequest;
use App\Http\Requests\Proposals\StoreLawyerProposalRequest;
use App\Http\Requests\Proposals\SubmitLawyerProposalRequest;
use App\Http\Requests\Proposals\UpdateLawyerProposalRequest;
use App\Http\Requests\Proposals\WithdrawLawyerProposalRequest;
use App\Models\Engagement;
use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Negotiation;
use App\Models\User;
use App\Services\LawyerSelection\ProposalSelectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LawyerProposalController extends Controller
{
    public function store(
        StoreLawyerProposalRequest $request,
        LegalRequestDistribution $distribution,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $proposal = DB::transaction(function () use ($request, $distribution, $user): LawyerProposal {
            $lockedDistribution = LegalRequestDistribution::query()
                ->with(['legalRequest', 'negotiation'])
                ->whereKey($distribution->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedDistribution->legalRequest !== null
                    && $lockedDistribution->legalRequest->status === 'submitted',
                409,
                'Proposal can only be created for a submitted legal request.',
            );

            $negotiation = $lockedDistribution->negotiation;

            abort_unless(
                $lockedDistribution->status === 'negotiating'
                    && $negotiation !== null
                    && $negotiation->status === Negotiation::STATUS_ACTIVE,
                409,
                'A proposal can only be created from an active negotiation.',
            );

            abort_if(
                Engagement::query()
                    ->where('legal_request_id', $lockedDistribution->legal_request_id)
                    ->exists(),
                409,
                'The agreement is already finalized.',
            );

            abort_if(
                $negotiation->proposals()
                    ->whereIn('status', [
                        LawyerProposal::STATUS_DRAFT,
                        LawyerProposal::STATUS_SUBMITTED,
                        LawyerProposal::STATUS_SHORTLISTED,
                    ])
                    ->exists(),
                409,
                'This negotiation already has a proposal awaiting a decision.',
            );

            return LawyerProposal::query()->create([
                'legal_request_id' => $lockedDistribution->legal_request_id,
                'negotiation_id' => $negotiation->id,
                'distribution_id' => $lockedDistribution->id,
                'lawyer_profile_id' => $user->lawyerProfile->id,
                'source' => $negotiation->source === Negotiation::SOURCE_LAWYER_INTEREST
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

    public function update(
        UpdateLawyerProposalRequest $request,
        LawyerProposal $proposal,
    ): JsonResponse {
        $proposal = DB::transaction(function () use ($request, $proposal): LawyerProposal {
            $lockedProposal = LawyerProposal::query()
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedProposal->status === LawyerProposal::STATUS_DRAFT,
                409,
                'Only draft proposals can be updated.',
            );

            $lockedProposal->loadMissing('negotiation');

            abort_unless(
                $lockedProposal->negotiation?->status === Negotiation::STATUS_ACTIVE,
                409,
                'Proposal drafts can only be edited while negotiation is active.',
            );

            $lockedProposal->fill($request->validated());
            $lockedProposal->save();

            return $lockedProposal;
        });

        return response()->json([
            'message' => 'Proposal draft updated successfully.',
            'proposal' => $proposal,
        ]);
    }

    public function submit(
        SubmitLawyerProposalRequest $request,
        LawyerProposal $proposal,
    ): JsonResponse {
        $proposal = DB::transaction(function () use ($proposal): LawyerProposal {
            $lockedProposal = LawyerProposal::query()
                ->with(['legalRequest', 'negotiation'])
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedProposal->status === LawyerProposal::STATUS_DRAFT,
                409,
                'Only draft proposals can be submitted.',
            );

            abort_unless(
                $lockedProposal->legalRequest?->status === 'submitted'
                    && $lockedProposal->legalRequest?->service_intent === 'lawyer_selection',
                409,
                'Proposal cannot be submitted for this legal request.',
            );

            abort_unless(
                $lockedProposal->negotiation !== null
                    && $lockedProposal->negotiation->status === Negotiation::STATUS_ACTIVE,
                409,
                'Proposal submission requires an active negotiation.',
            );

            abort_if(
                $lockedProposal->negotiation->proposals()
                    ->whereKeyNot($lockedProposal->id)
                    ->whereIn('status', [
                        LawyerProposal::STATUS_SUBMITTED,
                        LawyerProposal::STATUS_SHORTLISTED,
                    ])
                    ->exists(),
                409,
                'Another proposal is already awaiting the client decision.',
            );

            $submittedAt = now();

            $lockedProposal->forceFill([
                'status' => LawyerProposal::STATUS_SUBMITTED,
                'submitted_at' => $submittedAt,
                'expires_at' => $submittedAt->copy()->addHours(72),
            ])->save();

            $lockedProposal->negotiation->forceFill([
                'status' => Negotiation::STATUS_PROPOSAL_SUBMITTED,
                'closed_at' => null,
            ])->save();

            return $lockedProposal;
        });

        $proposal->loadMissing('negotiation:id,public_id');

        if ($proposal->negotiation?->public_id) {
            broadcast(new NegotiationStateChanged(
                $proposal->negotiation->public_id,
                'proposal.submitted',
            ));
        }

        return response()->json([
            'message' => 'Proposal submitted successfully.',
            'proposal' => $proposal,
        ]);
    }

    public function reject(Request $request, LawyerProposal $proposal): JsonResponse
    {
        /** @var User|null $client */
        $client = $request->user();

        abort_unless($client instanceof User && $client->status === 'active', 403);

        $proposal = DB::transaction(function () use ($proposal, $client): LawyerProposal {
            $lockedProposal = LawyerProposal::query()
                ->with(['legalRequest', 'negotiation'])
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedProposal->legalRequest?->client_user_id === $client->id,
                403,
                'You are not allowed to reject this proposal.',
            );

            abort_unless(
                $lockedProposal->status === LawyerProposal::STATUS_SUBMITTED,
                409,
                'Only a submitted proposal can be rejected.',
            );

            abort_if(
                Engagement::query()
                    ->where('legal_request_id', $lockedProposal->legal_request_id)
                    ->exists(),
                409,
                'The agreement is already finalized.',
            );

            $lockedProposal->forceFill([
                'status' => LawyerProposal::STATUS_REJECTED,
            ])->save();

            if (
                $lockedProposal->negotiation !== null
                && $lockedProposal->negotiation->status === Negotiation::STATUS_PROPOSAL_SUBMITTED
            ) {
                $lockedProposal->negotiation->forceFill([
                    'status' => Negotiation::STATUS_ACTIVE,
                    'closed_at' => null,
                ])->save();
            }

            return $lockedProposal;
        });

        $proposal->loadMissing('negotiation:id,public_id');

        if ($proposal->negotiation?->public_id) {
            broadcast(new NegotiationStateChanged(
                $proposal->negotiation->public_id,
                'proposal.rejected',
            ));
        }

        return response()->json([
            'message' => 'Proposal rejected. The negotiation remains open.',
            'proposal' => $proposal,
        ]);
    }

    public function withdraw(
        WithdrawLawyerProposalRequest $request,
        LawyerProposal $proposal,
    ): JsonResponse {
        $proposal = DB::transaction(function () use ($proposal): LawyerProposal {
            $lockedProposal = LawyerProposal::query()
                ->with('negotiation')
                ->whereKey($proposal->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedProposal->status === LawyerProposal::STATUS_SUBMITTED,
                409,
                'Only submitted proposals can be withdrawn.',
            );

            abort_if(
                Engagement::query()
                    ->where('legal_request_id', $lockedProposal->legal_request_id)
                    ->exists(),
                409,
                'The agreement is already finalized.',
            );

            $lockedProposal->forceFill([
                'status' => LawyerProposal::STATUS_WITHDRAWN,
            ])->save();

            if (
                $lockedProposal->negotiation !== null
                && $lockedProposal->negotiation->status === Negotiation::STATUS_PROPOSAL_SUBMITTED
            ) {
                $lockedProposal->negotiation->forceFill([
                    'status' => Negotiation::STATUS_ACTIVE,
                    'closed_at' => null,
                ])->save();
            }

            return $lockedProposal;
        });

        $proposal->loadMissing('negotiation:id,public_id');

        if ($proposal->negotiation?->public_id) {
            broadcast(new NegotiationStateChanged(
                $proposal->negotiation->public_id,
                'proposal.withdrawn',
            ));
        }

        return response()->json([
            'message' => 'Proposal withdrawn. The negotiation remains open.',
            'proposal' => $proposal,
        ]);
    }

    public function select(
        SelectLawyerProposalRequest $request,
        LawyerProposal $proposal,
        ProposalSelectionService $selectionService,
    ): JsonResponse {
        /** @var User $client */
        $client = $request->user();

        $result = $selectionService->select(
            $proposal,
            $client,
            $request->ip(),
        );

        $negotiationPublicId = $result['proposal']->negotiation?->public_id;

        if ($negotiationPublicId) {
            broadcast(new NegotiationStateChanged(
                $negotiationPublicId,
                'proposal.selected',
            ));
        }

        return response()->json([
            'message' => $result['created']
                ? 'Lawyer proposal selected successfully.'
                : 'Lawyer proposal was already selected.',
            'proposal' => $result['proposal'],
            'engagement' => $result['engagement'],
        ], $result['created'] ? 201 : 200);
    }

    public function selectForLegalRequest(
        SelectLawyerProposalRequest $request,
        LegalRequest $legalRequest,
        LawyerProposal $proposal,
        ProposalSelectionService $selectionService,
    ): JsonResponse {
        abort_unless(
            $proposal->legal_request_id === $legalRequest->id,
            404,
            'Proposal does not belong to this legal request.',
        );

        /** @var User $client */
        $client = $request->user();

        $result = $selectionService->select(
            $proposal,
            $client,
            $request->ip(),
        );

        $negotiationPublicId = $result['proposal']->negotiation?->public_id;

        if ($negotiationPublicId) {
            broadcast(new NegotiationStateChanged(
                $negotiationPublicId,
                'proposal.selected',
            ));
        }

        return response()->json([
            'message' => $result['created']
                ? 'Final lawyer proposal selected successfully.'
                : 'Final lawyer proposal was already selected.',
            'proposal' => $result['proposal'],
            'engagement' => $result['engagement'],
        ], $result['created'] ? 201 : 200);
    }
}
