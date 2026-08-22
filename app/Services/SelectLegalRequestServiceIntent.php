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
                $lockedRequest->forceFill([
                    'service_intent' => $serviceIntent->value,
                ])->save();
            }

            return $lockedRequest;
        });
    }
}
