<?php

namespace App\Services\LawyerMatching;

use App\Models\LawyerMatchRun;
use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LawyerMatchingService
{
    public const ALGORITHM_VERSION = 'v1';

    private const MAX_CANDIDATES = 50;

    private const DISTRIBUTION_LIMIT = 5;

    private const DISTRIBUTION_EXPIRY_HOURS = 72;

    /**
     * Run and persist lawyer selection matching. Repeated calls return the
     * latest completed v1 run so an accidental retry does not duplicate work.
     *
     * @return array{run: LawyerMatchRun, created: bool}
     */
    public function run(LegalRequest $legalRequest): array
    {
        return DB::transaction(function () use ($legalRequest): array {
            $lockedRequest = LegalRequest::query()
                ->whereKey($legalRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedRequest->status === 'submitted'
                    && $lockedRequest->service_intent === 'lawyer_selection',
                409,
                'Matching is only available for submitted lawyer-selection requests.',
            );

            $existingRun = $lockedRequest->matchRuns()
                ->where('algorithm_version', self::ALGORITHM_VERSION)
                ->where('status', 'completed')
                ->latest('created_at')
                ->first();

            if ($existingRun !== null) {
                return [
                    'run' => $this->loadRun($existingRun),
                    'created' => false,
                ];
            }

            $rankedLawyers = $this->rankedLawyers($lockedRequest);
            $run = $lockedRequest->matchRuns()->create([
                'algorithm_version' => self::ALGORITHM_VERSION,
                'status' => 'running',
                'candidates_count' => 0,
            ]);

            foreach ($rankedLawyers as $index => $result) {
                $candidate = $run->candidates()->create([
                    'lawyer_profile_id' => $result['lawyer']->id,
                    'score' => $result['score'],
                    'rank_position' => $index + 1,
                    'explanation' => $result['explanation'],
                ]);

                if ($index < self::DISTRIBUTION_LIMIT) {
                    $lockedRequest->distributions()->firstOrCreate(
                        ['lawyer_profile_id' => $result['lawyer']->id],
                        [
                            'match_candidate_id' => $candidate->id,
                            'status' => 'sent',
                            'sent_at' => now(),
                            'expires_at' => now()->addHours(self::DISTRIBUTION_EXPIRY_HOURS),
                        ],
                    );
                }
            }

            $run->forceFill([
                'status' => 'completed',
                'candidates_count' => $rankedLawyers->count(),
                'completed_at' => now(),
            ])->save();

            return [
                'run' => $this->loadRun($run),
                'created' => true,
            ];
        });
    }

    /**
     * Return ranked consultation lawyers without creating matching records.
     *
     * @return Collection<int, array{
     *     lawyer: LawyerProfile,
     *     score: float,
     *     explanation: array<string, int|float|string>
     * }>
     */
    public function consultationRecommendations(LegalRequest $legalRequest): Collection
    {
        abort_unless(
            $legalRequest->status === 'submitted'
                && $legalRequest->service_intent === 'consultation',
            409,
            'Recommendations are only available for submitted consultation requests.',
        );

        return $this->rankedLawyers($legalRequest, requireOpenConsultationSlot: true);
    }

    public function loadRun(LawyerMatchRun $run): LawyerMatchRun
    {
        return $run->load([
            'candidates' => fn ($query) => $query
                ->with([
                    'lawyerProfile.lawyerSpecialties.specialty:id,code,name,status',
                    'lawyerProfile.serviceAreas.province:id,name',
                    'lawyerProfile.serviceAreas.city:id,province_id,name',
                ])
                ->orderBy('rank_position'),
        ]);
    }

    /**
     * @return Collection<int, array{
     *     lawyer: LawyerProfile,
     *     score: float,
     *     explanation: array<string, int|float|string>
     * }>
     */
    private function rankedLawyers(
        LegalRequest $legalRequest,
        bool $requireOpenConsultationSlot = false,
    ): Collection
    {
        $legalRequest->loadMissing('legalCategory:id,code,status');

        abort_unless(
            $legalRequest->legalCategory !== null
                && $legalRequest->legalCategory->status
                && $legalRequest->province_id !== null
                && $legalRequest->city_id !== null,
            409,
            'The legal request does not contain enough information for matching.',
        );

        $categoryCode = $legalRequest->legalCategory->code;

        $lawyers = LawyerProfile::query()
            ->where('verification_status', 'approved')
            ->where('is_available', true)
            ->whereHas('user', fn ($query) => $query->where('status', 'active'))
            ->whereHas(
                'lawyerSpecialties.specialty',
                fn ($query) => $query
                    ->where('specialties.code', $categoryCode)
                    ->where('specialties.status', true),
            )
            ->whereHas(
                'serviceAreas',
                fn ($query) => $query
                    ->where('province_id', $legalRequest->province_id)
                    ->where(fn ($query) => $query
                        ->whereNull('city_id')
                        ->orWhere('city_id', $legalRequest->city_id)),
            )
            ->when(
                $requireOpenConsultationSlot,
                fn ($query) => $query->whereExists(fn ($query) => $query
                    ->selectRaw('1')
                    ->from('lawyer_availabilities')
                    ->whereColumn('lawyer_availabilities.lawyer_profile_id', 'lawyer_profiles.id')
                    ->where('lawyer_availabilities.status', 'open')
                    ->where('lawyer_availabilities.starts_at', '>', now())),
            )
            ->with([
                'lawyerSpecialties.specialty:id,code,name,status',
                'serviceAreas.province:id,name',
                'serviceAreas.city:id,province_id,name',
            ])
            ->get();

        return $lawyers
            ->map(fn (LawyerProfile $lawyer): array => $this->scoreLawyer(
                $lawyer,
                $categoryCode,
                (int) $legalRequest->province_id,
                (int) $legalRequest->city_id,
            ))
            ->sort(function (array $first, array $second): int {
                return $second['score'] <=> $first['score']
                    ?: $second['explanation']['years_experience'] <=> $first['explanation']['years_experience']
                    ?: ($second['lawyer']->average_rating ?? 0) <=> ($first['lawyer']->average_rating ?? 0)
                    ?: $first['lawyer']->full_name <=> $second['lawyer']->full_name
                    ?: $first['lawyer']->id <=> $second['lawyer']->id;
            })
            ->take(self::MAX_CANDIDATES)
            ->values();
    }

    /**
     * @return array{
     *     lawyer: LawyerProfile,
     *     score: float,
     *     explanation: array<string, int|float|string>
     * }
     */
    private function scoreLawyer(
        LawyerProfile $lawyer,
        string $categoryCode,
        int $provinceId,
        int $cityId,
    ): array
    {
        $matchingSpecialty = $lawyer->lawyerSpecialties
            ->filter(fn ($assignment) => $assignment->specialty?->status
                && $assignment->specialty->code === $categoryCode)
            ->sortByDesc('years_experience')
            ->first();

        $yearsExperience = (int) ($matchingSpecialty?->years_experience ?? 0);
        $hasExactCity = $lawyer->serviceAreas->contains(
            fn ($area) => (int) $area->province_id === $provinceId
                && (int) $area->city_id === $cityId,
        );
        $locationScore = $hasExactCity ? 25 : 20;
        $experienceScore = min($yearsExperience, 20);
        $ratingScore = $lawyer->rating_count > 0 && $lawyer->average_rating !== null
            ? round(min((float) $lawyer->average_rating, 5) * 3, 3)
            : 7.5;
        $score = round(40 + $locationScore + $experienceScore + $ratingScore, 3);

        return [
            'lawyer' => $lawyer,
            'score' => $score,
            'explanation' => [
                'specialty_code' => $categoryCode,
                'specialty_score' => 40,
                'location_match' => $hasExactCity ? 'city' : 'province',
                'location_score' => $locationScore,
                'years_experience' => $yearsExperience,
                'experience_score' => $experienceScore,
                'rating_score' => $ratingScore,
            ],
        ];
    }
}
