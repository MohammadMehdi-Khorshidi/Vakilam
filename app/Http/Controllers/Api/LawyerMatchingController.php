<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LawyerMatching\ListLawyerMatchesRequest;
use App\Http\Requests\LawyerMatching\SendLawyerRequestsRequest;
use App\Http\Resources\LawyerMatchCandidateResource;
use App\Http\Resources\LawyerMatchRunResource;
use App\Http\Resources\LawyerPublicResource;
use App\Models\LawyerMatchRun;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\LawyerMatching\LawyerMatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class LawyerMatchingController extends Controller
{
    public function store(
        ListLawyerMatchesRequest $request,
        LegalRequest $legalRequest,
        LawyerMatchingService $matchingService,
    ): JsonResponse
    {
        $this->ensureOwner($request, $legalRequest);
        $result = $matchingService->run($legalRequest);
        $candidates = $matchingService->paginateCandidates($result['run']);

        return response()->json($this->matchingResponse(
            $legalRequest,
            $result['run'],
            $candidates,
            [
                'message' => $result['created']
                    ? 'Lawyer matching completed successfully.'
                    : 'The existing matching result was returned.',
            ],
        ), $result['created'] ? 201 : 200);
    }

    public function show(
        ListLawyerMatchesRequest $request,
        LegalRequest $legalRequest,
        LawyerMatchingService $matchingService,
    ): JsonResponse
    {
        $this->ensureOwner($request, $legalRequest);

        $run = $legalRequest->matchRuns()
            ->where('status', 'completed')
            ->latest('created_at')
            ->firstOrFail();

        return response()->json($this->matchingResponse(
            $legalRequest,
            $run,
            $matchingService->paginateCandidates($run),
        ));
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

    public function sendRequests(
        SendLawyerRequestsRequest $request,
        LegalRequest $legalRequest,
        LawyerMatchingService $matchingService,
    ): JsonResponse
    {
        $this->ensureOwner($request, $legalRequest);
        /** @var array<int, string> $lawyerPublicIds */
        $lawyerPublicIds = $request->validated('lawyer_public_ids');
        $distributions = $matchingService->sendRequests(
            $legalRequest,
            $lawyerPublicIds,
        );

        return response()->json([
            'message' => 'The legal request was sent to the selected lawyers.',
            'data' => $distributions->map(fn ($distribution): array => [
                'distribution_id' => $distribution->id,
                'status' => $distribution->status,
                'sent_at' => $distribution->sent_at?->toISOString(),
                'lawyer' => LawyerPublicResource::make(
                    $distribution->lawyerProfile,
                )->resolve(),
            ]),
            'meta' => [
                'selection_limit' => 5,
                'selected_count' => $distributions->count(),
                'remaining_count' => 5 - $distributions->count(),
            ],
        ]);
    }

    /**
     * @param  LengthAwarePaginator<int, \App\Models\LawyerMatchCandidate>  $candidates
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    private function matchingResponse(
        LegalRequest $legalRequest,
        LawyerMatchRun $run,
        LengthAwarePaginator $candidates,
        array $extra = [],
    ): array
    {
        $data = LawyerMatchRunResource::make($run)->resolve();
        $data['candidates'] = LawyerMatchCandidateResource::collection(
            $candidates->getCollection(),
        )->resolve();
        $selectedCount = $legalRequest->distributions()->count();

        return [
            ...$extra,
            'data' => $data,
            'meta' => [
                'pagination' => [
                    'current_page' => $candidates->currentPage(),
                    'last_page' => $candidates->lastPage(),
                    'per_page' => $candidates->perPage(),
                    'total' => $candidates->total(),
                    'from' => $candidates->firstItem(),
                    'to' => $candidates->lastItem(),
                    'next_page_url' => $candidates->nextPageUrl(),
                    'previous_page_url' => $candidates->previousPageUrl(),
                ],
                'selection' => [
                    'limit' => 5,
                    'selected_count' => $selectedCount,
                    'remaining_count' => 5 - $selectedCount,
                ],
            ],
        ];
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
