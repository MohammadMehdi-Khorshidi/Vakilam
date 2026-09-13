<?php

namespace App\Http\Controllers\Api;

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
use Illuminate\Support\Facades\DB;

class ConsultationBookingController extends Controller
{
    private const DURATIONS = [15, 30, 45, 60];
    private const BOOKING_NOTICE_MINUTES = 60;

    public function store(
        Request $request,
        LegalRequest $legalRequest,
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

        $data = $request->validate([
            'lawyer_public_id' => ['required', 'string'],
            'starts_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'in:15,30,45,60'],
        ]);

        $startsAt = Carbon::parse($data['starts_at'])->utc()->seconds(0);
        $duration = (int) $data['duration_minutes'];
        $endsAt = $startsAt->copy()->addMinutes($duration);

        abort_if(
            $startsAt->lt(now()->addMinutes(self::BOOKING_NOTICE_MINUTES)),
            422,
            'رزرو باید حداقل ۶۰ دقیقه قبل از شروع جلسه انجام شود.',
        );

        abort_if(
            $startsAt->minute % 15 !== 0,
            422,
            'زمان شروع باید روی بازه‌های ۱۵ دقیقه‌ای باشد.',
        );

        $recommendations = $matchingService->consultationRecommendations($legalRequest);
        $match = $recommendations->first(
            fn (array $item): bool =>
                $item['lawyer']->public_id === $data['lawyer_public_id'],
        );

        abort_if($match === null, 404, 'وکیل برای این درخواست قابل رزرو نیست.');

        /** @var LawyerProfile $lawyer */
        $lawyer = $match['lawyer'];

        $consultation = DB::transaction(function () use (
            $legalRequest,
            $user,
            $lawyer,
            $startsAt,
            $endsAt,
            $duration,
        ): Consultation {
            LawyerProfile::query()
                ->whereKey($lawyer->id)
                ->lockForUpdate()
                ->firstOrFail();

            $existing = Consultation::query()
                ->where('legal_request_id', $legalRequest->id)
                ->whereIn('status', ['requested', 'reserved', 'confirmed'])
                ->lockForUpdate()
                ->first();

            abort_if(
                $existing !== null,
                409,
                'برای این درخواست قبلاً یک مشاوره رزرو شده است.',
            );

            $windows = LawyerAvailability::query()
                ->where('lawyer_profile_id', $lawyer->id)
                ->where('status', 'open')
                ->where('starts_at', '<=', $startsAt)
                ->where('ends_at', '>=', $endsAt)
                ->lockForUpdate()
                ->get();

            $window = $windows->first(function (LawyerAvailability $item) use ($duration): bool {
                $durations = array_map(
                    'intval',
                    $item->allowed_durations ?: self::DURATIONS,
                );

                return in_array($duration, $durations, true);
            });

            abort_if(
                $window === null,
                409,
                'این زمان دیگر در برنامه آزاد وکیل موجود نیست.',
            );

            $conflict = Consultation::query()
                ->where('lawyer_profile_id', $lawyer->id)
                ->whereIn('status', ['requested', 'reserved', 'confirmed'])
                ->where('scheduled_start_at', '<', $endsAt)
                ->where('scheduled_end_at', '>', $startsAt)
                ->lockForUpdate()
                ->exists();

            abort_if(
                $conflict,
                409,
                'این زمان همین حالا توسط شخص دیگری رزرو شده است.',
            );

            return Consultation::query()->create([
                'legal_request_id' => $legalRequest->id,
                'client_user_id' => $user->id,
                'lawyer_profile_id' => $lawyer->id,
                'status' => 'reserved',
                'scheduled_start_at' => $startsAt,
                'scheduled_end_at' => $endsAt,
                'duration_minutes' => $duration,
            ]);
        });

        return response()->json([
            'message' => 'زمان مشاوره با موفقیت رزرو شد.',
            'data' => $this->consultationData(
                $consultation->load(['legalRequest:id,public_id,title', 'lawyerProfile:id,public_id,full_name']),
            ),
        ], 201);
    }

    public function clientIndex(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active', 403);

        $items = Consultation::query()
            ->where('client_user_id', $user->id)
            ->with([
                'legalRequest:id,public_id,title',
                'lawyerProfile:id,public_id,full_name',
            ])
            ->orderByDesc('scheduled_start_at')
            ->get();

        return response()->json([
            'data' => $items->map(fn (Consultation $item): array =>
                $this->consultationData($item)
            )->values(),
        ]);
    }

    public function lawyerIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $user->lawyerProfile !== null
                && $user->lawyerProfile->verification_status === 'approved',
            403,
        );

        $items = Consultation::query()
            ->where('lawyer_profile_id', $user->lawyerProfile->id)
            ->with([
                'legalRequest:id,public_id,title',
                'client:id,public_id,name,last_name',
            ])
            ->orderByDesc('scheduled_start_at')
            ->get();

        return response()->json([
            'data' => $items->map(fn (Consultation $item): array =>
                $this->consultationData($item)
            )->values(),
        ]);
    }

    private function consultationData(Consultation $item): array
    {
        return [
            'public_id' => $item->public_id,
            'status' => $item->status,
            'scheduled_start_at' => $item->scheduled_start_at?->toISOString(),
            'scheduled_end_at' => $item->scheduled_end_at?->toISOString(),
            'duration_minutes' => $item->duration_minutes
                ?: $item->scheduled_start_at?->diffInMinutes($item->scheduled_end_at),
            'legal_request' => $item->legalRequest === null ? null : [
                'public_id' => $item->legalRequest->public_id,
                'title' => $item->legalRequest->title,
            ],
            'lawyer' => $item->lawyerProfile === null ? null : [
                'public_id' => $item->lawyerProfile->public_id,
                'full_name' => $item->lawyerProfile->full_name,
            ],
            'client' => $item->client === null ? null : [
                'public_id' => $item->client->public_id,
                'name' => trim(
                    ($item->client->name ?? '').' '.($item->client->last_name ?? '')
                ),
            ],
        ];
    }
}
