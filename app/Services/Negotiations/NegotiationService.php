<?php

namespace App\Services\Negotiations;

use App\Models\Engagement;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Negotiation;
use Illuminate\Support\Facades\DB;

class NegotiationService
{
    public function openForDistribution(
        LegalRequestDistribution $distribution,
        string $source,
    ): Negotiation {
        return DB::transaction(function () use ($distribution, $source): Negotiation {
            $lockedDistribution = LegalRequestDistribution::query()
                ->whereKey($distribution->id)
                ->lockForUpdate()
                ->firstOrFail();

            $legalRequest = LegalRequest::query()
                ->whereKey($lockedDistribution->legal_request_id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $legalRequest->status === 'submitted'
                    && $legalRequest->service_intent === 'lawyer_selection',
                409,
                'This legal request is not available for negotiation.',
            );

            abort_if(
                Engagement::query()->where('legal_request_id', $legalRequest->id)->exists(),
                409,
                'A lawyer has already been selected for this legal request.',
            );

            $existing = Negotiation::query()
                ->where('legal_request_id', $legalRequest->id)
                ->where('lawyer_profile_id', $lockedDistribution->lawyer_profile_id)
                ->lockForUpdate()
                ->first();

            if ($existing !== null) {
                abort_if(
                    in_array($existing->status, [Negotiation::STATUS_CLOSED, Negotiation::STATUS_CANCELLED, Negotiation::STATUS_WON], true),
                    409,
                    'This negotiation is already closed.',
                );

                return $existing;
            }

            return Negotiation::query()->create([
                'legal_request_id' => $legalRequest->id,
                'lawyer_profile_id' => $lockedDistribution->lawyer_profile_id,
                'distribution_id' => $lockedDistribution->id,
                'source' => $source,
                'status' => Negotiation::STATUS_ACTIVE,
                'opened_at' => now(),
            ]);
        });
    }

    public function cancelCompetitors(string $legalRequestId, string $winnerNegotiationId): void
    {
        Negotiation::query()
            ->where('legal_request_id', $legalRequestId)
            ->whereKeyNot($winnerNegotiationId)
            ->whereIn('status', [
                Negotiation::STATUS_ACTIVE,
                Negotiation::STATUS_PROPOSAL_SUBMITTED,
            ])
            ->update([
                'status' => Negotiation::STATUS_CANCELLED,
                'closed_at' => now(),
            ]);
    }
}
