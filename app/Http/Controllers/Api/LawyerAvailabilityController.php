<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lawyers\StoreLawyerAvailabilityRequest;
use App\Http\Resources\ConsultationAvailabilityResource;
use App\Models\LawyerAvailability;
use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\LawyerMatching\LawyerMatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class LawyerAvailabilityController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    /**
     * Publish a new consultation availability slot for the authenticated lawyer.
     */
    public function store(StoreLawyerAvailabilityRequest $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        $data = $request->validated();

        $startsAt = Carbon::parse($data['starts_at'])->utc();
        $endsAt = Carbon::parse($data['ends_at'])->utc();

        $availability = DB::transaction(function () use (
            $profile,
            $data,
            $startsAt,
            $endsAt
        ) {
            LawyerProfile::query()
                ->whereKey($profile->id)
                ->lockForUpdate()
                ->firstOrFail();

            $hasOverlap = LawyerAvailability::query()
                ->where('lawyer_profile_id', $profile->id)
                ->where('status', '!=', 'cancelled')
                ->where('starts_at', '<', $endsAt)
                ->where('ends_at', '>', $startsAt)
                ->exists();

            abort_if(
                $hasOverlap,
                422,
                'This availability overlaps with an existing slot.',
            );

            return $profile->availabilities()->create([
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'status' => 'open',
                'note' => $data['note'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Availability slot created successfully.',
            'availability' => $availability,
        ], 201);
    }

    /**
     * List open consultation slots for an eligible consultation lawyer.
     */
    public function consultationSlots(
        Request $request,
        LegalRequest $legalRequest,
        string $publicId,
        LawyerMatchingService $matchingService,
    ): JsonResponse {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $legalRequest->client_user_id === $user->id,
            403,
            'You are not allowed to view consultation slots for this legal request.',
        );

        $recommendations = $matchingService
            ->consultationRecommendations($legalRequest);

        $result = $recommendations->first(
            fn (array $result): bool =>
                $result['lawyer']->public_id === $publicId,
        );

        abort_if(
            $result === null,
            404,
            'Consultation lawyer not found for this legal request.',
        );

        $slots = $result['lawyer']
            ->availabilities()
            ->where('status', 'open')
            ->where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->get();

        return response()->json([
            'data' => ConsultationAvailabilityResource::collection($slots)->resolve(),
            'meta' => [
                'count' => $slots->count(),
            ],
        ]);
    }
    
}