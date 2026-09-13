<?php

namespace App\Http\Controllers\Api;

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
use Illuminate\Support\Facades\DB;

class ConsultationBookingController extends Controller
{
    private const HOLD_MINUTES = 10;

    public function hold(Request $request, LegalRequest $legalRequest, ConsultationDirectoryService $directory): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active' && $legalRequest->client_user_id === $user->id, 403, 'اجازه رزرو برای این درخواست را ندارید.');
        $data = $request->validate([
            'lawyer_public_id' => ['required', 'string'],
            'starts_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'in:15,30,45,60'],
        ], [
            'lawyer_public_id.required' => 'وکیل را انتخاب کنید.',
            'starts_at.required' => 'زمان مشاوره را انتخاب کنید.',
            'duration_minutes.in' => 'مدت مشاوره معتبر نیست.',
        ]);

        $startsAt = Carbon::parse($data['starts_at'])->utc()->seconds(0);
        $duration = (int) $data['duration_minutes'];
        $endsAt = $startsAt->copy()->addMinutes($duration);
        abort_if($startsAt->lt(now()->addMinutes(ConsultationDirectoryService::BOOKING_NOTICE_MINUTES)), 422, 'رزرو باید حداقل ۶۰ دقیقه قبل از شروع جلسه انجام شود.');
        abort_if($startsAt->minute % 15 !== 0, 422, 'زمان شروع رزرو باید روی بازه‌های ۱۵ دقیقه‌ای باشد.');
        $lawyer = $directory->lawyerForRequest($legalRequest, $data['lawyer_public_id']);

        $consultation = DB::transaction(function () use ($legalRequest, $user, $lawyer, $startsAt, $endsAt, $duration): Consultation {
            LawyerProfile::query()->whereKey($lawyer->id)->lockForUpdate()->firstOrFail();

            Consultation::query()->where('status', 'held')->whereNotNull('hold_expires_at')->where('hold_expires_at', '<=', now())->update(['status' => 'expired']);

            $existingConfirmed = Consultation::query()->where('legal_request_id', $legalRequest->id)->whereIn('status', ['reserved','confirmed','requested'])->lockForUpdate()->first();
            abort_if($existingConfirmed !== null, 409, 'برای این درخواست قبلاً یک مشاوره رزرو شده است.');

            $rate = $lawyer->consultationRates()->where('duration_minutes', $duration)->first();
            abort_if($rate === null, 409, 'وکیل برای این مدت هنوز تعرفه مشاوره ثبت نکرده است.');

            $window = LawyerAvailability::query()
                ->where('lawyer_profile_id', $lawyer->id)->where('status', 'open')
                ->where('starts_at', '<=', $startsAt)->where('ends_at', '>=', $endsAt)
                ->lockForUpdate()->get()->first(function ($item) use ($duration) {
                    return in_array($duration, array_map('intval', $item->allowed_durations ?: [15,30,45,60]), true);
                });
            abort_if($window === null, 409, 'این زمان دیگر در برنامه آزاد وکیل موجود نیست.');

            $conflict = Consultation::query()->where('lawyer_profile_id', $lawyer->id)
                ->where(function ($q): void {
                    $q->whereIn('status', ['requested','reserved','confirmed'])
                      ->orWhere(fn ($sq) => $sq->where('status', 'held')->where('hold_expires_at', '>', now()));
                })
                ->where('scheduled_start_at', '<', $endsAt)->where('scheduled_end_at', '>', $startsAt)->lockForUpdate()->exists();
            abort_if($conflict, 409, 'این زمان همین حالا توسط شخص دیگری انتخاب شده است. زمان دیگری را انتخاب کنید.');

            Consultation::query()->where('legal_request_id', $legalRequest->id)->where('client_user_id', $user->id)->where('status','held')->update(['status'=>'cancelled']);

            return Consultation::query()->create([
                'legal_request_id' => $legalRequest->id,
                'client_user_id' => $user->id,
                'lawyer_profile_id' => $lawyer->id,
                'status' => 'held',
                'scheduled_start_at' => $startsAt,
                'scheduled_end_at' => $endsAt,
                'duration_minutes' => $duration,
                'price_rial' => (int) $rate->price_rial,
                'hold_expires_at' => now()->addMinutes(self::HOLD_MINUTES),
            ]);
        });

        return response()->json([
            'message' => 'این زمان برای ۱۰ دقیقه برای شما نگه داشته شد.',
            'data' => $this->serialize($consultation->load(['legalRequest.legalCategory','lawyerProfile.lawyerSpecialties.specialty'])),
        ], 201);
    }

    public function show(Request $request, Consultation $consultation): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $consultation->client_user_id === $user->id, 403, 'اجازه مشاهده این مشاوره را ندارید.');
        $this->expireIfNeeded($consultation);
        return response()->json(['data' => $this->serialize($consultation->fresh()->load(['legalRequest.legalCategory','lawyerProfile.lawyerSpecialties.specialty']))]);
    }

    public function cancelHold(Request $request, Consultation $consultation): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $consultation->client_user_id === $user->id, 403, 'اجازه لغو این رزرو را ندارید.');
        abort_unless($consultation->status === 'held', 409, 'این زمان دیگر در حالت نگه‌داری موقت نیست.');
        $consultation->update(['status' => 'cancelled']);
        return response()->json(['message' => 'زمان آزاد شد.']);
    }

    public function paymentStep(Request $request, Consultation $consultation): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $consultation->client_user_id === $user->id, 403, 'اجازه پرداخت این مشاوره را ندارید.');
        $this->expireIfNeeded($consultation);
        abort_unless($consultation->fresh()->status === 'held', 409, 'مهلت نگه‌داری این زمان تمام شده است. دوباره زمان را انتخاب کنید.');

        return response()->json([
            'message' => 'اطلاعات پرداخت آماده است.',
            'data' => [
                'consultation' => $this->serialize($consultation->fresh()->load(['legalRequest.legalCategory','lawyerProfile.lawyerSpecialties.specialty'])),
                'gateway_available' => false,
                'gateway_message' => 'درگاه پرداخت مشاوره هنوز به پروژه متصل نشده است. تا اتصال درگاه، رزرو قطعی نمی‌شود.',
            ],
        ]);
    }

    public function clientIndex(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active', 403, 'دسترسی مجاز نیست.');
        Consultation::query()->where('client_user_id',$user->id)->where('status','held')->where('hold_expires_at','<=',now())->update(['status'=>'expired']);
        $requests = $user->legalRequests()->where('service_intent','consultation')->whereIn('status',['submitted','matched'])->with(['legalCategory:id,code,name'])->latest('updated_at')->get();
        $consultations = Consultation::query()->where('client_user_id',$user->id)->with(['legalRequest:id,public_id,title,service_intent','lawyerProfile:id,public_id,full_name'])->orderByDesc('created_at')->get();
        return response()->json(['data' => [
            'requests' => $requests->map(fn ($r) => [
                'public_id'=>$r->public_id,'title'=>$r->title,'description'=>$r->description,'status'=>$r->status,'service_intent'=>$r->service_intent,
                'legal_category'=>$r->legalCategory ? ['name'=>$r->legalCategory->name] : null,'updated_at'=>$r->updated_at?->toISOString(),
            ])->values(),
            'consultations' => $consultations->map(fn ($c) => $this->serialize($c))->values(),
        ]]);
    }

    public function lawyerIndex(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active' && $user->lawyerProfile !== null && $user->lawyerProfile->verification_status === 'approved', 403, 'دسترسی وکیل تأییدشده لازم است.');
        $items = Consultation::query()->where('lawyer_profile_id',$user->lawyerProfile->id)
            ->where(function ($q): void { $q->where('status','!=','held')->orWhere('hold_expires_at','>',now()); })
            ->with(['legalRequest:id,public_id,title','client:id,public_id,name,last_name'])->orderByDesc('scheduled_start_at')->get();
        return response()->json(['data'=>$items->map(fn ($c)=>$this->serialize($c))->values()]);
    }

    private function expireIfNeeded(Consultation $consultation): void
    {
        if ($consultation->status === 'held' && $consultation->hold_expires_at?->isPast()) {
            $consultation->update(['status' => 'expired']);
        }
    }

    private function serialize(Consultation $item): array
    {
        return [
            'public_id'=>$item->public_id,'status'=>$item->status,
            'scheduled_start_at'=>$item->scheduled_start_at?->toISOString(),'scheduled_end_at'=>$item->scheduled_end_at?->toISOString(),
            'duration_minutes'=>$item->duration_minutes ?: $item->scheduled_start_at?->diffInMinutes($item->scheduled_end_at),
            'price_rial'=>$item->price_rial,'hold_expires_at'=>$item->hold_expires_at?->toISOString(),
            'legal_request'=>$item->legalRequest ? [
                'public_id'=>$item->legalRequest->public_id,'title'=>$item->legalRequest->title,
                'description'=>$item->legalRequest->description ?? null,
                'legal_category'=>$item->legalRequest->legalCategory ? ['name'=>$item->legalRequest->legalCategory->name] : null,
            ] : null,
            'lawyer'=>$item->lawyerProfile ? [
                'public_id'=>$item->lawyerProfile->public_id,'full_name'=>$item->lawyerProfile->full_name,
                'specialties'=>$item->lawyerProfile->relationLoaded('lawyerSpecialties') ? $item->lawyerProfile->lawyerSpecialties->map(fn ($s)=>['name'=>$s->specialty?->name])->filter(fn ($s)=>$s['name'])->values() : [],
            ] : null,
            'client'=>$item->client ? ['public_id'=>$item->client->public_id,'name'=>trim(($item->client->name??'').' '.($item->client->last_name??''))] : null,
        ];
    }
}
