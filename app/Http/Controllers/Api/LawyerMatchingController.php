<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LawyerMatchRunResource;
use App\Http\Resources\LawyerPublicResource;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\LawyerMatching\LawyerMatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LawyerMatchingController extends Controller
{
    public function store(
        Request $request,
        LegalRequest $legalRequest,
        LawyerMatchingService $matchingService,
    ): JsonResponse
    {
        $this->ensureOwner($request, $legalRequest);
        $result = $matchingService->run($legalRequest);

        return response()->json([
            'message' => $result['created']
                ? 'Lawyer matching completed successfully.'
                : 'The existing matching result was returned.',
            'data' => LawyerMatchRunResource::make($result['run'])->resolve(),
        ], $result['created'] ? 201 : 200);
    }

    public function show(
        Request $request,
        LegalRequest $legalRequest,
        LawyerMatchingService $matchingService,
    ): JsonResponse
    {
        $this->ensureOwner($request, $legalRequest);

        $run = $legalRequest->matchRuns()
            ->where('status', 'completed')
            ->latest('created_at')
            ->firstOrFail();

        return response()->json([
            'data' => LawyerMatchRunResource::make(
                $matchingService->loadRun($run),
            )->resolve(),
        ]);
    }

    public function consultationLawyers(
        Request $request,
        LegalRequest $legalRequest,
        LawyerMatchingService $matchingService,
    ): JsonResponse
    {
        $this->ensureOwner($request, $legalRequest);
        $recommendations = $matchingService->consultationRecommendations($legalRequest);

        return response()->json([
            'data' => $recommendations
                ->values()
                ->map(fn (array $result, int $index): array => [
                    'rank' => $index + 1,
                    'score' => $result['score'],
                    'explanation' => $result['explanation'],
                    'lawyer' => LawyerPublicResource::make($result['lawyer'])->resolve(),
                ]),
            'meta' => [
                'count' => $recommendations->count(),
            ],
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
            'You are not allowed to match this legal request.',
        );
    }
}
