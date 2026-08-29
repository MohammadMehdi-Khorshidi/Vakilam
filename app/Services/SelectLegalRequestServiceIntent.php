<?php

namespace App\Services;

use App\Enums\LegalRequestServiceIntent;
use App\Models\LegalRequest;
use Illuminate\Support\Facades\DB;

class SelectLegalRequestServiceIntent
{
    public function handle(
        LegalRequest $legalRequest,
        LegalRequestServiceIntent $serviceIntent,
    ): LegalRequest {
        return DB::transaction(function () use ($legalRequest, $serviceIntent): LegalRequest {
            $lockedRequest = LegalRequest::query()
                ->whereKey($legalRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedRequest->status === 'submitted',
                409,
                'A service can only be selected for a submitted legal request.',
            );

            if ($lockedRequest->service_intent !== $serviceIntent->value) {
                $flowAlreadyStarted = $lockedRequest->matchRuns()->exists()
                    || $lockedRequest->distributions()->exists()
                    || $lockedRequest->consultations()->exists()
                    || $lockedRequest->negotiations()->exists()
                    || $lockedRequest->proposals()->exists()
                    || $lockedRequest->engagements()->exists()
                    || $lockedRequest->legalMatters()->exists();

                abort_if(
                    $flowAlreadyStarted,
                    409,
                    'Service intent cannot be changed after a service flow has started.',
                );

                $lockedRequest->forceFill([
                    'service_intent' => $serviceIntent->value,
                ])->save();
            }

            return $lockedRequest;
        });
    }
}
