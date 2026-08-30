<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EngagementResource;
use App\Models\Engagement;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\Contracts\ContractFlowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EngagementController extends Controller
{
    public function show(Request $request, Engagement $engagement): JsonResponse
    {
        $this->ensureParticipant($request, $engagement);
        $this->loadForResponse($engagement);

        return response()->json([
            'data' => EngagementResource::make($engagement)->resolve(),
        ]);
    }

    public function showForLegalRequest(Request $request, LegalRequest $legalRequest): JsonResponse
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403, 'You are not allowed to view this engagement.');

        $engagement = Engagement::query()
            ->where('legal_request_id', $legalRequest->id)
            ->latest('created_at')
            ->first();

        if ($engagement === null) {
            abort_unless(
                $legalRequest->client_user_id === $user->id,
                403,
                'You are not allowed to view this engagement.',
            );

            return response()->json(['data' => null]);
        }

        $this->ensureParticipant($request, $engagement);
        $this->loadForResponse($engagement);

        return response()->json([
            'data' => EngagementResource::make($engagement)->resolve(),
        ]);
    }


    public function confirm(
        Request $request,
        Engagement $engagement,
        ContractFlowService $contractFlowService,
    ): JsonResponse {
        $this->ensureParticipant($request, $engagement);

        /** @var User $user */
        $user = $request->user();
        $result = $contractFlowService->confirmEngagement($engagement, $user);

        $this->loadForResponse($engagement);

        return response()->json([
            'message' => $result['contract'] === null
                ? 'Engagement confirmation recorded.'
                : 'Both parties confirmed. Contract is ready for signing.',
            'confirmation' => $result['confirmation'],
            'contract' => $result['contract'],
            'data' => EngagementResource::make($engagement)->resolve(),
        ], $result['confirmation']->wasRecentlyCreated ? 201 : 200);
    }

    private function ensureParticipant(Request $request, Engagement $engagement): void
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403, 'You are not allowed to view this engagement.');

        $isClient = $engagement->client_user_id === $user->id;
        $isLawyer = $user->lawyerProfile !== null
            && $engagement->lawyer_profile_id === $user->lawyerProfile->id
            && $user->mayActAsRole('lawyer');

        abort_unless(
            $isClient || $isLawyer,
            403,
            'You are not allowed to view this engagement.',
        );
    }

    private function loadForResponse(Engagement $engagement): void
    {
        $engagement->load([
            'legalRequest:id,public_id,title,status',
            'proposal:id,public_id,negotiation_id,status,summary,service_scope,proposed_fee_rial,estimated_days',
            'proposal.negotiation:id,public_id,status',
            'lawyerProfile:id,public_id,full_name,verification_status',
            'client:id,public_id,name,last_name',
            'contract:id,public_id,engagement_id,status,current_version,effective_at',
            'confirmations:id,engagement_id,user_id,role,confirmed_at',
        ]);
    }
}
