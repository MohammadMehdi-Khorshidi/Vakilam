<?php

namespace App\Services\Consultations;

use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;

class ConsultationDirectoryService
{
    public const BOOKING_NOTICE_MINUTES = 60;

    /** @return Collection<int, array<string, mixed>> */
    public function ranked(LegalRequest $legalRequest, array $filters = []): Collection
    {
        $legalRequest->loadMissing('legalCategory:id,code,status');

        abort_unless(
            $legalRequest->status === 'submitted'
                && $legalRequest->service_intent === 'consultation',
            409,
            'این درخواست برای رزرو مشاوره آماده نیست.',
        );

        $query = LawyerProfile::query()
            ->where('verification_status', 'approved')
            ->where('is_available', true)
            ->whereHas('user', fn ($q) => $q->where('status', 'active'))
            ->with([
                'lawyerSpecialties.specialty:id,code,name,status',
                'serviceAreas.province:id,name',
                'serviceAreas.city:id,province_id,name',
                'consultationRates',
                'availabilities' => fn ($q) => $q
                    ->where('status', 'open')
                    ->where('ends_at', '>', now()->addMinutes(self::BOOKING_NOTICE_MINUTES))
                    ->orderBy('starts_at'),
            ]);

        $search = trim((string) ($filters['q'] ?? ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhereHas('lawyerSpecialties.specialty', fn ($sq) => $sq
                        ->where('specialties.name', 'like', "%{$search}%"));
            });
        }

        $lawyers = $query->get();
        $categoryCode = $legalRequest->legalCategory?->code;
        $provinceId = (int) ($legalRequest->province_id ?? 0);
        $cityId = (int) ($legalRequest->city_id ?? 0);
        $cutoff = now()->addMinutes(self::BOOKING_NOTICE_MINUTES);

        $items = $lawyers->map(function (LawyerProfile $lawyer) use ($categoryCode, $provinceId, $cityId, $cutoff): array {
            $matchingSpecialties = $lawyer->lawyerSpecialties->filter(
                fn ($item) => $item->specialty?->status && $item->specialty?->code === $categoryCode,
            );
            $topic = $matchingSpecialties->isNotEmpty() ? 40 : 0;
            $years = (int) ($matchingSpecialties->max('years_experience') ?? $lawyer->lawyerSpecialties->max('years_experience') ?? 0);
            $experience = min($years, 20);

            $exactCity = $lawyer->serviceAreas->contains(
                fn ($area) => (int) $area->province_id === $provinceId && (int) $area->city_id === $cityId,
            );
            $sameProvince = $lawyer->serviceAreas->contains(
                fn ($area) => (int) $area->province_id === $provinceId,
            );
            $location = $exactCity ? 25 : ($sameProvince ? 20 : 0);
            $rating = min(max((float) ($lawyer->average_rating ?? 0), 0), 5) / 5 * 15;

            $nearest = null;
            foreach ($lawyer->availabilities as $availability) {
                $candidate = $availability->starts_at->copy()->max($cutoff);
                $remainder = $candidate->minute % 15;
                if ($remainder !== 0) $candidate->addMinutes(15 - $remainder);
                $candidate->seconds(0);
                if ($candidate->lt($availability->ends_at)) {
                    $nearest = $candidate;
                    break;
                }
            }

            $rates = $lawyer->consultationRates
                ->mapWithKeys(fn ($rate) => [(string) $rate->duration_minutes => (int) $rate->price_rial])
                ->all();

            return [
                'lawyer' => $lawyer,
                'score' => round($topic + $location + $experience + $rating, 2),
                'years_experience' => $years,
                'topic_match' => $topic > 0,
                'location_level' => $exactCity ? 2 : ($sameProvince ? 1 : 0),
                'nearest_available_at' => $nearest?->toISOString(),
                'has_availability' => $nearest !== null,
                'rates' => $rates,
                'min_price_rial' => count($rates) ? min($rates) : null,
            ];
        });

        if (! empty($filters['has_availability'])) {
            $items = $items->filter(fn (array $item) => $item['has_availability']);
        }

        if (($filters['min_rating'] ?? null) !== null) {
            $min = (float) $filters['min_rating'];
            $items = $items->filter(fn (array $item) => (float) ($item['lawyer']->average_rating ?? 0) >= $min);
        }

        $sort = $filters['sort'] ?? 'match';
        $items = $items->sort(function (array $a, array $b) use ($sort): int {
            if ($sort === 'rating') {
                return ((float) ($b['lawyer']->average_rating ?? 0)) <=> ((float) ($a['lawyer']->average_rating ?? 0));
            }
            if ($sort === 'experience') {
                return $b['years_experience'] <=> $a['years_experience'];
            }
            if ($sort === 'soonest') {
                $aa = $a['nearest_available_at'] ?? '9999-12-31T23:59:59Z';
                $bb = $b['nearest_available_at'] ?? '9999-12-31T23:59:59Z';
                return strcmp($aa, $bb);
            }
            return $b['score'] <=> $a['score']
                ?: $b['years_experience'] <=> $a['years_experience']
                ?: ((float) ($b['lawyer']->average_rating ?? 0)) <=> ((float) ($a['lawyer']->average_rating ?? 0))
                ?: strcmp((string) $a['lawyer']->full_name, (string) $b['lawyer']->full_name);
        })->values();

        return $items;
    }

    public function lawyerForRequest(LegalRequest $legalRequest, string $publicId): LawyerProfile
    {
        $result = $this->ranked($legalRequest)->first(
            fn (array $item) => $item['lawyer']->public_id === $publicId,
        );
        abort_if($result === null, 404, 'وکیل موردنظر برای رزرو مشاوره در دسترس نیست.');
        return $result['lawyer'];
    }
}
