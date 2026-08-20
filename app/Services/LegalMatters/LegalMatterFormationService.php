<?php

namespace App\Services\LegalMatters;

use App\Models\LegalMatter;
use App\Models\LegalRequest;
use Illuminate\Support\Facades\DB;

class LegalMatterFormationService
{
    public function createFromLegalRequest(LegalRequest $legalRequest): LegalMatter
    {
        return DB::transaction(function () use ($legalRequest): LegalMatter {
            $existingMatter = LegalMatter::query()
                ->where('source_legal_request_id', $legalRequest->id)
                ->first();

            if ($existingMatter !== null) {
                return $existingMatter;
            }

            return LegalMatter::query()->create([
                'source_legal_request_id' => $legalRequest->id,
                'client_user_id' => $legalRequest->client_user_id,
                'title' => $legalRequest->title,
                'status' => 'onboarding',
                'opened_at' => now(),
            ]);
        });
    }
}