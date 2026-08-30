<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Negotiations\RespondLawyerInterestRequest;
use App\Models\Engagement;
use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Negotiation;
use App\Models\User;
use App\Services\Negotiations\NegotiationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LawyerInterestController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    private const INTEREST_EXPIRY_HOURS = 72;

    public function openOpportunities(Request $request): JsonResponse
    {
        $lawyer = $this->approvedLawyer($request);
        $categoryCodes = $lawyer->lawyerSpecialties()
            ->whereHas('specialty', fn ($query) => $query->where('status', true))
            ->with('specialty:id,code')
            ->get()
            ->pluck('specialty.code')
            ->filter()
            ->values();

        $areas = $lawyer->serviceAreas()->get(['province_id', 'city_id']);
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 50);

        $query = LegalRequest::query()
            ->where('status', 'submitted')
            ->where('service_intent', 'lawyer_selection')
            ->where('client_user_id', '!=', $lawyer->user_id)
            ->whereHas('legalCategory', fn ($q) => $q->whereIn('code', $categoryCodes)->where('status', true))
            ->where(function ($q) use ($areas): void {
                foreach ($areas as $area) {
                    $q->orWhere(function ($locationQuery) use ($area): void {
                        $locationQuery->where('province_id', $area->province_id)
                            ->when(
                                $area->city_id !== null,
                                fn ($cityQuery) => $cityQuery->where('city_id', $area->city_id),
                            );
                    });
                }
            })
            ->whereDoesntHave('engagement')
            ->whereDoesntHave('distributions', fn ($q) => $q->where('lawyer_profile_id', $lawyer->id))
            ->with(['legalCategory:id,code,name', 'province:id,name', 'city:id,province_id,name'])
            ->latest('submitted_at');

        if ($areas->isEmpty() || $categoryCodes->isEmpty()) {
            $query->whereRaw('1 = 0');
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => collect($paginator->items())->map(fn (LegalRequest $legalRequest): array => [
                'public_id' => $legalRequest->public_id,
                'title' => $legalRequest->title,
                'urgency' => $legalRequest->urgency,
                'submitted_at' => $legalRequest->submitted_at,
                'category' => $legalRequest->legalCategory === null ? null : [
                    'code' => $legalRequest->legalCategory->code,
                    'name' => $legalRequest->legalCategory->name,
                ],
                'province' => $legalRequest->province?->name,
                'city' => $legalRequest->city?->name,
            ])->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(Request $request, LegalRequest $legalRequest): JsonResponse
    {
        $lawyer = $this->approvedLawyer($request);
        $this->ensureEligible($lawyer, $legalRequest);

        $distribution = DB::transaction(function () use ($lawyer, $legalRequest): LegalRequestDistribution {
            $lockedRequest = LegalRequest::query()->whereKey($legalRequest->id)->lockForUpdate()->firstOrFail();

            abort_unless(
                $lockedRequest->status === 'submitted'
                    && $lockedRequest->service_intent === 'lawyer_selection',
                409,
                'This legal request is not open for lawyer interest.',
            );

            abort_if(
                Engagement::query()->where('legal_request_id', $lockedRequest->id)->exists(),
                409,
                'A lawyer has already been selected for this legal request.',
            );

            $existing = LegalRequestDistribution::query()
                ->where('legal_request_id', $lockedRequest->id)
                ->where('lawyer_profile_id', $lawyer->id)
                ->lockForUpdate()
                ->first();

            if ($existing !== null) {
                abort_unless(
                    $existing->source === Negotiation::SOURCE_LAWYER_INTEREST
                        && in_array($existing->status, ['interest_pending', 'negotiating'], true),
                    409,
                    'This lawyer already has another relationship with the legal request.',
                );

                return $existing;
            }

            return LegalRequestDistribution::query()->create([
                'legal_request_id' => $lockedRequest->id,
                'lawyer_profile_id' => $lawyer->id,
                'match_candidate_id' => null,
                'source' => Negotiation::SOURCE_LAWYER_INTEREST,
                'status' => 'interest_pending',
                'sent_at' => now(),
                'expires_at' => now()->addHours(self::INTEREST_EXPIRY_HOURS),
            ]);
        });

        return response()->json([
            'message' => 'Lawyer interest submitted successfully.',
            'interest' => $distribution,
        ], 201);
    }

    public function indexForClient(Request $request, LegalRequest $legalRequest): JsonResponse
    {
        $this->ensureClientOwner($request, $legalRequest);

        $interests = $legalRequest->distributions()
            ->where('source', Negotiation::SOURCE_LAWYER_INTEREST)
            ->with('lawyerProfile:id,public_id,full_name,verification_status,average_rating,rating_count')
            ->latest('sent_at')
            ->get();

        return response()->json([
            'data' => $interests->map(fn (LegalRequestDistribution $interest): array => [
                'id' => $interest->id,
                'status' => $interest->status,
                'sent_at' => $interest->sent_at,
                'expires_at' => $interest->expires_at,
                'lawyer' => $interest->lawyerProfile === null ? null : [
                    'public_id' => $interest->lawyerProfile->public_id,
                    'full_name' => $interest->lawyerProfile->full_name,
                    'verification_status' => $interest->lawyerProfile->verification_status,
                    'average_rating' => $interest->lawyerProfile->average_rating,
                    'rating_count' => $interest->lawyerProfile->rating_count,
                ],
            ])->values(),
        ]);
    }

    public function respond(
        RespondLawyerInterestRequest $request,
        LegalRequest $legalRequest,
        LegalRequestDistribution $distribution,
        NegotiationService $negotiationService,
    ): JsonResponse {
        $this->ensureClientOwner($request, $legalRequest);

        $result = DB::transaction(function () use (
            $request,
            $legalRequest,
            $distribution,
            $negotiationService,
        ): array {
            $locked = LegalRequestDistribution::query()
                ->whereKey($distribution->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $locked->legal_request_id === $legalRequest->id
                    && $locked->source === Negotiation::SOURCE_LAWYER_INTEREST
                    && $locked->status === 'interest_pending',
                409,
                'This lawyer interest is not pending.',
            );

            if ($locked->expires_at !== null && ! $locked->expires_at->isFuture()) {
                $locked->forceFill(['status' => 'expired', 'responded_at' => now()])->save();

                return ['accepted' => false, 'expired' => true, 'distribution' => $locked, 'negotiation' => null];
            }

            if ($request->validated('action') === 'reject') {
                $locked->forceFill(['status' => 'rejected', 'responded_at' => now()])->save();

                return ['accepted' => false, 'expired' => false, 'distribution' => $locked, 'negotiation' => null];
            }

            $locked->forceFill(['status' => 'negotiating', 'responded_at' => now()])->save();
            $negotiation = $negotiationService->openForDistribution(
                $locked,
                Negotiation::SOURCE_LAWYER_INTEREST,
            );

            return ['accepted' => true, 'expired' => false, 'distribution' => $locked, 'negotiation' => $negotiation];
        });

        if ($result['expired']) {
            return response()->json([
                'message' => 'This lawyer interest has expired.',
                'interest' => $result['distribution'],
            ], 409);
        }

        return response()->json([
            'message' => $result['accepted']
                ? 'Lawyer interest accepted and negotiation opened.'
                : 'Lawyer interest rejected.',
            'interest' => $result['distribution'],
            'negotiation' => $result['negotiation'] === null ? null : [
                'public_id' => $result['negotiation']->public_id,
                'status' => $result['negotiation']->status,
            ],
        ], $result['accepted'] ? 201 : 200);
    }

    private function approvedLawyer(Request $request): LawyerProfile
    {
        $lawyer = $this->authenticatedLawyerProfile($request);

        abort_unless(
            $lawyer->verification_status === 'approved' && $lawyer->is_available,
            403,
            'Only approved and available lawyers may express interest.',
        );

        return $lawyer;
    }

    private function ensureEligible(LawyerProfile $lawyer, LegalRequest $legalRequest): void
    {
        $legalRequest->loadMissing('legalCategory:id,code,status');

        $hasSpecialty = $lawyer->lawyerSpecialties()
            ->whereHas('specialty', fn ($query) => $query
                ->where('code', $legalRequest->legalCategory?->code)
                ->where('status', true))
            ->exists();

        $hasArea = $lawyer->serviceAreas()
            ->where('province_id', $legalRequest->province_id)
            ->where(fn ($query) => $query->whereNull('city_id')->orWhere('city_id', $legalRequest->city_id))
            ->exists();

        abort_unless($hasSpecialty && $hasArea, 403, 'This legal request is outside the lawyer eligibility scope.');
    }

    private function ensureClientOwner(Request $request, LegalRequest $legalRequest): User
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $legalRequest->client_user_id === $user->id,
            403,
            'You are not allowed to manage lawyer interests for this legal request.',
        );

        return $user;
    }
}
