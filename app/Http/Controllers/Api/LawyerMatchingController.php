<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LawyerMatching\ListLawyerMatchesRequest;
use App\Http\Requests\LawyerMatching\SendLawyerRequestsRequest;
use App\Http\Resources\LawyerMatchCandidateResource;
use App\Http\Resources\LawyerMatchRunResource;
use App\Http\Resources\LawyerPublicResource;
use App\Models\LawyerMatchCandidate;
use App\Models\LawyerMatchRun;
use App\Models\LawyerProfile;
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
            $matchingService,
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
        $this->ensureLawyerSelectionReady($legalRequest);

        $run = $legalRequest->matchRuns()
            ->where('algorithm_version', LawyerMatchingService::ALGORITHM_VERSION)
            ->where('status', 'completed')
            ->latest('created_at')
            ->first();

        if ($run === null) {
            return response()->json($this->emptyMatchingResponse(
                $legalRequest,
                $matchingService,
            ));
        }

        return response()->json($this->matchingResponse(
            $legalRequest,
            $run,
            $matchingService->paginateCandidates($run),
            $matchingService,
        ));
    }

    /**
     * List all approved/available lawyers that the client may invite.
     * Matching is optional here: when no matching run exists yet the endpoint
     * still returns a normal directory (with null match score/rank).
     */
    public function lawyers(
        Request $request,
        LegalRequest $legalRequest,
        LawyerMatchingService $matchingService,
    ): JsonResponse
    {
        $this->ensureOwner($request, $legalRequest);
        $this->ensureLawyerSelectionReady($legalRequest);

        $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $run = $legalRequest->matchRuns()
            ->where('algorithm_version', LawyerMatchingService::ALGORITHM_VERSION)
            ->where('status', 'completed')
            ->latest('created_at')
            ->first();
        $search = trim((string) $request->query('q', ''));
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 50);

        $lawyersQuery = LawyerProfile::query()
            ->where('verification_status', 'approved')
            ->where('is_available', true)
            ->whereHas('user', fn ($query) => $query->where('status', 'active'))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('full_name', 'like', "%{$search}%")
                        ->orWhereHas('specialties', fn ($specialtyQuery) => $specialtyQuery
                            ->where('specialties.status', true)
                            ->where(function ($specialtyQuery) use ($search): void {
                                $specialtyQuery->where('specialties.name', 'like', "%{$search}%")
                                    ->orWhere('specialties.code', 'like', "%{$search}%");
                            }));
                });
            })
            ->with([
                'lawyerSpecialties.specialty:id,code,name,status',
                'serviceAreas.province:id,name',
                'serviceAreas.city:id,province_id,name',
            ]);

        if ($run !== null) {
            $scoreSubquery = LawyerMatchCandidate::query()
                ->select('score')
                ->whereColumn('lawyer_profile_id', 'lawyer_profiles.id')
                ->where('match_run_id', $run->id)
                ->limit(1);
            $rankSubquery = LawyerMatchCandidate::query()
                ->select('rank_position')
                ->whereColumn('lawyer_profile_id', 'lawyer_profiles.id')
                ->where('match_run_id', $run->id)
                ->limit(1);

            $lawyersQuery
                ->addSelect([
                    'match_score' => $scoreSubquery,
                    'match_rank' => $rankSubquery,
                ])
                ->orderByDesc('match_score');
        }

        $lawyers = $lawyersQuery
            ->orderByDesc('average_rating')
            ->orderBy('full_name')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'data' => collect($lawyers->items())->map(fn (LawyerProfile $lawyer): array => [
                'match_score' => $lawyer->getAttribute('match_score') !== null
                    ? (float) $lawyer->getAttribute('match_score')
                    : null,
                'match_rank' => $lawyer->getAttribute('match_rank') !== null
                    ? (int) $lawyer->getAttribute('match_rank')
                    : null,
                'is_matching_candidate' => $lawyer->getAttribute('match_score') !== null,
                'lawyer' => LawyerPublicResource::make($lawyer)->resolve(),
            ])->values(),
            'meta' => [
                'matching_run_id' => $run?->id,
                'matching_status' => $run === null ? 'not_started' : 'completed',
                'selection' => $matchingService->selectionMeta($legalRequest),
                'pagination' => [
                    'current_page' => $lawyers->currentPage(),
                    'last_page' => $lawyers->lastPage(),
                    'per_page' => $lawyers->perPage(),
                    'total' => $lawyers->total(),
                    'from' => $lawyers->firstItem(),
                    'to' => $lawyers->lastItem(),
                ],
            ],
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
                'selection' => $matchingService->selectionMeta($legalRequest),
                // Compatibility with the old response shape.
                'selection_limit' => LawyerMatchingService::SELECTION_LIMIT,
                'selected_count' => $distributions->count(),
                'remaining_count' => max(
                    0,
                    LawyerMatchingService::SELECTION_LIMIT - $distributions->count(),
                ),
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
        LawyerMatchingService $matchingService,
        array $extra = [],
    ): array
    {
        $data = LawyerMatchRunResource::make($run)->resolve();
        $data['candidates'] = LawyerMatchCandidateResource::collection(
            $candidates->getCollection(),
        )->resolve();

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
                'selection' => $matchingService->selectionMeta($legalRequest),
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function emptyMatchingResponse(
        LegalRequest $legalRequest,
        LawyerMatchingService $matchingService,
    ): array {
        return [
            'data' => [
                'id' => null,
                'algorithm_version' => LawyerMatchingService::ALGORITHM_VERSION,
                'status' => 'not_started',
                'candidates_count' => 0,
                'completed_at' => null,
                'candidates' => [],
            ],
            'meta' => [
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                    'from' => null,
                    'to' => null,
                    'next_page_url' => null,
                    'previous_page_url' => null,
                ],
                'selection' => $matchingService->selectionMeta($legalRequest),
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

    private function ensureLawyerSelectionReady(LegalRequest $legalRequest): void
    {
        abort_unless(
            $legalRequest->status === 'submitted'
                && $legalRequest->service_intent === 'lawyer_selection',
            409,
            'Lawyer selection is only available for submitted lawyer-selection requests.',
        );
    }
}
