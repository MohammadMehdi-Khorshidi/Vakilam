<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\LawyerAvailability;
use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\Consultations\ConsultationDirectoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LawyerAvailabilityController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    private const DURATIONS = [15, 30, 45, 60];

    public function index(Request $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        $items = $profile->availabilities()
            ->where('status', '!=', 'cancelled')
            ->where('ends_at', '>', now())
            ->orderBy('starts_at')->get();
        return response()->json(['data' => $items->map(fn ($i) => $this->availabilityData($i))->values()]);
    }

    public function store(Request $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        $data = $this->validateWindow($request);
        $startsAt = Carbon::parse($data['starts_at'])->utc()->seconds(0);
        $endsAt = Carbon::parse($data['ends_at'])->utc()->seconds(0);
        abort_unless($startsAt->gt(now()), 422, 'زمان شروع باید در آینده باشد. حتی یک دقیقه آینده هم مجاز است.');

        $availability = DB::transaction(function () use ($profile, $data, $startsAt, $endsAt) {
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

        return response()->json(['message' => 'بازه آزاد ثبت شد.', 'data' => $this->availabilityData($availability)], 201);
    }

    public function update(Request $request, LawyerAvailability $availability): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        abort_unless($availability->lawyer_profile_id === $profile->id, 403, 'این بازه متعلق به شما نیست.');
        $data = $this->validateWindow($request);
        $startsAt = Carbon::parse($data['starts_at'])->utc()->seconds(0);
        $endsAt = Carbon::parse($data['ends_at'])->utc()->seconds(0);
        abort_unless($startsAt->gt(now()), 422, 'زمان شروع باید در آینده باشد.');

        DB::transaction(function () use ($profile, $availability, $data, $startsAt, $endsAt): void {
            LawyerProfile::query()->whereKey($profile->id)->lockForUpdate()->firstOrFail();
            $hasBooking = Consultation::query()
                ->where('lawyer_profile_id', $profile->id)
                ->where(function ($q): void {
                    $q->whereIn('status', ['reserved', 'confirmed', 'requested'])
                      ->orWhere(fn ($sq) => $sq->where('status', 'held')->where('hold_expires_at', '>', now()));
                })
                ->where('scheduled_start_at', '<', $availability->ends_at)
                ->where('scheduled_end_at', '>', $availability->starts_at)->exists();
            abort_if($hasBooking, 409, 'این بازه رزرو فعال دارد و قابل ویرایش نیست.');
            $this->ensureNoOverlap($profile->id, $startsAt, $endsAt, $availability->id);
            $availability->update([
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'allowed_durations' => $data['allowed_durations'],
                'note' => $data['note'] ?? null,
                'status' => 'open',
            ]);
        });
        return response()->json(['message' => 'بازه آزاد ویرایش شد.', 'data' => $this->availabilityData($availability->fresh())]);
    }

    public function destroy(Request $request, LawyerAvailability $availability): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        abort_unless($availability->lawyer_profile_id === $profile->id, 403, 'این بازه متعلق به شما نیست.');
        DB::transaction(function () use ($profile, $availability): void {
            LawyerProfile::query()->whereKey($profile->id)->lockForUpdate()->firstOrFail();
            $hasBooking = Consultation::query()
                ->where('lawyer_profile_id', $profile->id)
                ->where(function ($q): void {
                    $q->whereIn('status', ['reserved', 'confirmed', 'requested'])
                      ->orWhere(fn ($sq) => $sq->where('status', 'held')->where('hold_expires_at', '>', now()));
                })
                ->where('scheduled_start_at', '<', $availability->ends_at)
                ->where('scheduled_end_at', '>', $availability->starts_at)->exists();
            abort_if($hasBooking, 409, 'این بازه رزرو فعال دارد و قابل حذف نیست.');
            $availability->delete();
        });
        return response()->json(['message' => 'بازه آزاد حذف شد.']);
    }

    public function consultationSlots(
        Request $request,
        LegalRequest $legalRequest,
        string $publicId,
        ConsultationDirectoryService $directory,
    ): JsonResponse {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active' && $legalRequest->client_user_id === $user->id, 403, 'اجازه مشاهده زمان‌های این درخواست را ندارید.');
        $validated = $request->validate(['duration' => ['required', 'integer', 'in:15,30,45,60']], ['duration.in' => 'مدت مشاوره معتبر نیست.']);
        $duration = (int) $validated['duration'];
        $lawyer = $directory->lawyerForRequest($legalRequest, $publicId);
        $rate = $lawyer->consultationRates->firstWhere('duration_minutes', $duration);
        $cutoff = now()->addMinutes(ConsultationDirectoryService::BOOKING_NOTICE_MINUTES);

        $windows = $lawyer->availabilities()->where('status', 'open')->where('ends_at', '>', $cutoff)->where('starts_at', '<', now()->addDays(30))->orderBy('starts_at')->get();
        $bookings = Consultation::query()->where('lawyer_profile_id', $lawyer->id)
            ->where(function ($q): void {
                $q->whereIn('status', ['requested', 'reserved', 'confirmed'])
                  ->orWhere(fn ($sq) => $sq->where('status', 'held')->where('hold_expires_at', '>', now()));
            })
            ->where('scheduled_end_at', '>', $cutoff)->where('scheduled_start_at', '<', now()->addDays(31))->get();

        $slots = $rate ? $this->generateSlots($windows, $bookings, $duration, $cutoff) : [];
        return response()->json([
            'data' => $slots,
            'meta' => [
                'duration' => $duration,
                'price_rial' => $rate?->price_rial,
                'booking_notice_minutes' => ConsultationDirectoryService::BOOKING_NOTICE_MINUTES,
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
        ], [
            'starts_at.required' => 'تاریخ و ساعت شروع را وارد کنید.',
            'ends_at.required' => 'تاریخ و ساعت پایان را وارد کنید.',
            'ends_at.after' => 'ساعت پایان باید بعد از ساعت شروع باشد.',
            'allowed_durations.required' => 'حداقل یک مدت مشاوره انتخاب کنید.',
            'allowed_durations.*.in' => 'مدت مشاوره معتبر نیست.',
        ]);
        $minutes = Carbon::parse($data['starts_at'])->diffInMinutes(Carbon::parse($data['ends_at']));
        abort_if($minutes < 15, 422, 'بازه آزاد باید حداقل ۱۵ دقیقه باشد.');
        foreach ($data['allowed_durations'] as $duration) {
            abort_if((int) $duration > $minutes, 422, 'یکی از مدت‌های انتخاب‌شده از طول بازه آزاد بیشتر است.');
        }
        sort($data['allowed_durations']);
        return $data;
    }

    private function ensureNoOverlap(string $lawyerId, Carbon $start, Carbon $end, ?string $ignoreId = null): void
    {
        $q = LawyerAvailability::query()->where('lawyer_profile_id', $lawyerId)->where('status', '!=', 'cancelled')->where('starts_at', '<', $end)->where('ends_at', '>', $start);
        if ($ignoreId) $q->where('id', '!=', $ignoreId);
        abort_if($q->exists(), 422, 'این بازه با یکی از زمان‌های آزاد قبلی همپوشانی دارد.');
    }

    private function generateSlots(Collection $windows, Collection $bookings, int $duration, Carbon $cutoff): array
    {
        $slots = [];
        foreach ($windows as $window) {
            $durations = array_map('intval', $window->allowed_durations ?: self::DURATIONS);
            if (! in_array($duration, $durations, true)) continue;
            $cursor = $window->starts_at->copy()->seconds(0);
            $r = $cursor->minute % 15;
            if ($r !== 0) $cursor->addMinutes(15 - $r);
            while ($cursor->copy()->addMinutes($duration)->lte($window->ends_at)) {
                $end = $cursor->copy()->addMinutes($duration);
                if ($cursor->gte($cutoff)) {
                    $conflict = $bookings->contains(fn ($b) => $b->scheduled_start_at->lt($end) && $b->scheduled_end_at->gt($cursor));
                    if (! $conflict) $slots[] = ['starts_at' => $cursor->toISOString(), 'ends_at' => $end->toISOString(), 'duration_minutes' => $duration];
                }
                $cursor->addMinutes(15);
            }
        }
        usort($slots, fn ($a,$b) => strcmp($a['starts_at'],$b['starts_at']));
        return array_values($slots);
    }

    private function availabilityData(LawyerAvailability $item): array
    {
        return [
            'id' => $item->id,
            'starts_at' => $item->starts_at?->toISOString(),
            'ends_at' => $item->ends_at?->toISOString(),
            'allowed_durations' => array_values(array_map('intval', $item->allowed_durations ?: self::DURATIONS)),
            'status' => $item->status,
            'note' => $item->note,
        ];
    }
}
