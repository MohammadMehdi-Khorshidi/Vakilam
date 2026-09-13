<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Models\LawyerConsultationRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LawyerConsultationRateController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    private const DURATIONS = [15, 30, 45, 60];

    public function index(Request $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        return response()->json(['data' => $this->serialize($profile->consultationRates()->get())]);
    }

    public function update(Request $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        $data = $request->validate([
            'rates' => ['required', 'array', 'size:4'],
            'rates.*.duration_minutes' => ['required', 'integer', 'distinct', 'in:15,30,45,60'],
            'rates.*.price_rial' => ['required', 'integer', 'min:10000', 'max:100000000000'],
        ], [
            'rates.required' => 'تعرفه‌های مشاوره را وارد کنید.',
            'rates.size' => 'تعرفه هر چهار مدت ۱۵، ۳۰، ۴۵ و ۶۰ دقیقه باید مشخص شود.',
            'rates.*.duration_minutes.in' => 'مدت مشاوره معتبر نیست.',
            'rates.*.price_rial.min' => 'مبلغ مشاوره باید حداقل ۱٬۰۰۰ تومان باشد.',
        ]);

        $durations = collect($data['rates'])->pluck('duration_minutes')->map(fn ($v) => (int) $v)->sort()->values()->all();
        abort_unless($durations === self::DURATIONS, 422, 'تعرفه هر چهار مدت مشاوره باید مشخص شود.');

        DB::transaction(function () use ($profile, $data): void {
            foreach ($data['rates'] as $rate) {
                LawyerConsultationRate::query()->updateOrCreate(
                    ['lawyer_profile_id' => $profile->id, 'duration_minutes' => (int) $rate['duration_minutes']],
                    ['price_rial' => (int) $rate['price_rial']],
                );
            }
        });

        return response()->json([
            'message' => 'تعرفه‌های مشاوره ذخیره شد.',
            'data' => $this->serialize($profile->consultationRates()->get()),
        ]);
    }

    private function serialize($rates): array
    {
        return $rates->sortBy('duration_minutes')->map(fn ($rate): array => [
            'duration_minutes' => (int) $rate->duration_minutes,
            'price_rial' => (int) $rate->price_rial,
        ])->values()->all();
    }
}
