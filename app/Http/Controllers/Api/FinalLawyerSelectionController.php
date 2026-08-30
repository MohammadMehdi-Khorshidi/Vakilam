<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LawyerSelection\SelectFinalLawyerRequest;
use App\Http\Resources\FinalLawyerSelectionResource;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\LawyerSelection\FinalLawyerSelectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinalLawyerSelectionController extends Controller
{
    public function store(
        SelectFinalLawyerRequest $request,
        LegalRequest $legalRequest,
        FinalLawyerSelectionService $selectionService,
    ): JsonResponse
    {
        /** @var User $client */
        $client = $request->user();

        $result = $selectionService->select(
            $legalRequest,
            (string) $request->validated('proposal_public_id'),
            $client,
            $request->ip(),
        );

        return response()->json([
            'message' => $result['created']
                ? 'Final lawyer proposal selected successfully.'
                : 'Final lawyer proposal was already selected.',
            'proposal' => $result['proposal'],
            'engagement' => $result['engagement'],
            'data' => FinalLawyerSelectionResource::make($result['proposal'])->resolve(),
            'deprecated' => true,
        ], $result['created'] ? 201 : 200);
    }

    public function show(
        Request $request,
        LegalRequest $legalRequest,
        FinalLawyerSelectionService $selectionService,
    ): JsonResponse
    {
        $this->ensureOwner($request, $legalRequest);
        $proposal = $selectionService->current($legalRequest);

        return response()->json([
            'data' => $proposal === null
                ? null
                : FinalLawyerSelectionResource::make($proposal)->resolve(),
        ]);
    }

    private function ensureOwner(Request $request, LegalRequest $legalRequest): void
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $legalRequest->client_user_id === $user->id,
            403,
            'You are not allowed to view this lawyer selection.',
        );
    }
}
