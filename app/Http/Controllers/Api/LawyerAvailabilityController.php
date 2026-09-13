<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\LawyerAvailability;
use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\LawyerMatching\LawyerMatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LawyerAvailabilityController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    private const DURATIONS = [15, 30, 45, 60];
    private const BOOKING_NOTICE_MINUTES = 60;

    public function index(Request $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);

        $items = $profile->availabilities()
            ->where('status', '!=', 'cancelled')
            ->where('ends_at', '>', now())
            ->orderBy('starts_at')
            ->get();

        return response()->json([
            'data' => $items->map(fn (LawyerAvailability $item): array => $this->availabilityData($item))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        $data = $this->validateWindow($request);
        $startsAt = Carbon::parse($data['starts_at'])->utc();
        $endsAt = Carbon::parse($data['ends_at'])->utc();

        abort_unless($startsAt->isFuture(), 422, 'زمان شروع باید در آینده باشد.');

        $availability = DB::transaction(function () use ($profile, $data, $startsAt, $endsAt): LawyerAvailability {
            LawyerProfile::query()->whereKey($profile->id)->lockForUpdate()->firstOrFail();

            $this->ensureNoOverlap($profile->id, $startsAt, $endsAt);

            return $profile->availabilities()->create([
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'allowed_durations' => $data['allowed_durations'],
                'status' => 'open',
                'note' => $data['note'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'بازه آزاد با موفقیت ثبت شد.',
            'data' => $this->availabilityData($availability),
        ], 201);
    }

    public function update(
        Request $request,
        LawyerAvailability $availability,
    ): JsonResponse {
        $profile = $this->authenticatedLawyerProfile($request);

        abort_unless($availability->lawyer_profile_id === $profile->id, 403);

        $data = $this->validateWindow($request);
        $startsAt = Carbon::parse($data['starts_at'])->utc();
        $endsAt = Carbon::parse($data['ends_at'])->utc();

        abort_unless($startsAt->isFuture(), 422, 'زمان شروع باید در آینده باشد.');

        DB::transaction(function () use ($profile, $availability, $data, $startsAt, $endsAt): void {
            LawyerProfile::query()->whereKey($profile->id)->lockForUpdate()->firstOrFail();

            $hasBooking = Consultation::query()
                ->where('lawyer_profile_id', $profile->id)
                ->whereIn('status', ['requested', 'reserved', 'confirmed'])
                ->where('scheduled_start_at', '<', $availability->ends_at)
                ->where('scheduled_end_at', '>', $availability->starts_at)
                ->exists();

            abort_if(
                $hasBooking,
                409,
                'این بازه رزرو فعال دارد و تا زمان لغو یا پایان رزرو قابل ویرایش نیست.',
            );

            $this->ensureNoOverlap(
                $profile->id,
                $startsAt,
                $endsAt,
                $availability->id,
            );

            $availability->update([
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'allowed_durations' => $data['allowed_durations'],
                'note' => $data['note'] ?? null,
                'status' => 'open',
            ]);
        });

        return response()->json([
            'message' => 'بازه آزاد ویرایش شد.',
            'data' => $this->availabilityData($availability->fresh()),
        ]);
    }

    public function destroy(
        Request $request,
        LawyerAvailability $availability,
    ): JsonResponse {
        $profile = $this->authenticatedLawyerProfile($request);
        abort_unless($availability->lawyer_profile_id === $profile->id, 403);

        DB::transaction(function () use ($profile, $availability): void {
            LawyerProfile::query()->whereKey($profile->id)->lockForUpdate()->firstOrFail();

            $hasBooking = Consultation::query()
                ->where('lawyer_profile_id', $profile->id)
                ->whereIn('status', ['requested', 'reserved', 'confirmed'])
                ->where('scheduled_start_at', '<', $availability->ends_at)
                ->where('scheduled_end_at', '>', $availability->starts_at)
                ->exists();

            abort_if(
                $hasBooking,
                409,
                'این بازه رزرو فعال دارد و قابل حذف نیست.',
            );

            $availability->delete();
        });

        return response()->json(['message' => 'بازه آزاد حذف شد.']);
    }

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
        );

        abort_unless(
            $legalRequest->status === 'submitted'
                && $legalRequest->service_intent === 'consultation',
            409,
            'این درخواست برای رزرو مشاوره آماده نیست.',
        );

        $validated = $request->validate([
            'duration' => ['required', 'integer', 'in:15,30,45,60'],
        ]);
        $duration = (int) $validated['duration'];

        $recommendations = $matchingService->consultationRecommendations($legalRequest);
        $result = $recommendations->first(
            fn (array $result): bool => $result['lawyer']->public_id === $publicId,
        );

        abort_if($result === null, 404, 'وکیل برای این درخواست قابل رزرو نیست.');

        /** @var LawyerProfile $lawyer */
        $lawyer = $result['lawyer'];
        $cutoff = now()->addMinutes(self::BOOKING_NOTICE_MINUTES);

        $windows = $lawyer->availabilities()
            ->where('status', 'open')
            ->where('ends_at', '>', $cutoff)
            ->where('starts_at', '<', now()->addDays(30))
            ->orderBy('starts_at')
            ->get();

        $bookings = Consultation::query()
            ->where('lawyer_profile_id', $lawyer->id)
            ->whereIn('status', ['requested', 'reserved', 'confirmed'])
            ->where('scheduled_end_at', '>', $cutoff)
            ->where('scheduled_start_at', '<', now()->addDays(31))
            ->get(['scheduled_start_at', 'scheduled_end_at']);

        $slots = $this->generateSlots($windows, $bookings, $duration, $cutoff);

        return response()->json([
            'data' => $slots,
            'meta' => [
                'duration' => $duration,
                'booking_notice_minutes' => self::BOOKING_NOTICE_MINUTES,
                'count' => count($slots),
            ],
        ]);
    }

    private function validateWindow(Request $request): array
    {
        $data = $request->validate([
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'allowed_durations' => ['required', 'array', 'min:1'],
            'allowed_durations.*' => ['integer', 'distinct', 'in:15,30,45,60'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $minutes = Carbon::parse($data['starts_at'])->diffInMinutes(
            Carbon::parse($data['ends_at']),
        );

        abort_if($minutes < 15, 422, 'بازه آزاد باید حداقل ۱۵ دقیقه باشد.');

        foreach ($data['allowed_durations'] as $duration) {
            abort_if(
                (int) $duration > $minutes,
                422,
                'مدت انتخاب‌شده از طول بازه آزاد بیشتر است.',
            );
        }

        sort($data['allowed_durations']);

        return $data;
    }

    private function ensureNoOverlap(
        string $lawyerProfileId,
        Carbon $startsAt,
        Carbon $endsAt,
        ?string $ignoreId = null,
    ): void {
        $query = LawyerAvailability::query()
            ->where('lawyer_profile_id', $lawyerProfileId)
            ->where('status', '!=', 'cancelled')
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt);

        if ($ignoreId !== null) {
            $query->whereKeyNot($ignoreId);
        }

        abort_if(
            $query->exists(),
            422,
            'این بازه با یکی از زمان‌های آزاد قبلی همپوشانی دارد.',
        );
    }

    private function generateSlots(
        Collection $windows,
        Collection $bookings,
        int $duration,
        Carbon $cutoff,
    ): array {
        $slots = [];

        foreach ($windows as $window) {
            $durations = $window->allowed_durations ?: self::DURATIONS;

            if (! in_array($duration, array_map('intval', $durations), true)) {
                continue;
            }

            $cursor = $window->starts_at->copy()->seconds(0);
            $minuteRemainder = $cursor->minute % 15;
            if ($minuteRemainder !== 0) {
                $cursor->addMinutes(15 - $minuteRemainder);
            }

            while ($cursor->copy()->addMinutes($duration)->lte($window->ends_at)) {
                $end = $cursor->copy()->addMinutes($duration);

                if ($cursor->gte($cutoff)) {
                    $conflict = $bookings->contains(
                        fn (Consultation $booking): bool =>
                            $booking->scheduled_start_at->lt($end)
                            && $booking->scheduled_end_at->gt($cursor),
                    );

                    if (! $conflict) {
                        $slots[] = [
                            'starts_at' => $cursor->toISOString(),
                            'ends_at' => $end->toISOString(),
                            'duration_minutes' => $duration,
                        ];
                    }
                }

                $cursor->addMinutes(15);
            }
        }

        usort($slots, fn (array $a, array $b): int =>
            strcmp($a['starts_at'], $b['starts_at'])
        );

        return array_values($slots);
    }

    private function availabilityData(LawyerAvailability $item): array
    {
        return [
            'id' => $item->id,
            'starts_at' => $item->starts_at?->toISOString(),
            'ends_at' => $item->ends_at?->toISOString(),
            'allowed_durations' => array_values(
                array_map('intval', $item->allowed_durations ?: self::DURATIONS),
            ),
            'status' => $item->status,
            'note' => $item->note,
        ];
    }
}
