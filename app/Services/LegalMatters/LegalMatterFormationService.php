<?php

namespace App\Services\LegalMatters;

use App\Models\LegalMatter;
use App\Models\MatterMember;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LegalMatterFormationService
{
    /**
     * Form the LegalMatter only from a successful contract payment.
     * This is the only supported formation entry point for lawyer-selection matters.
     */
    public function createFromSuccessfulPayment(Payment $payment): LegalMatter
    {
        return DB::transaction(function () use ($payment): LegalMatter {
            $lockedPayment = Payment::query()
                ->with([
                    'invoice.contract.engagement.legalRequest',
                    'invoice.contract.engagement.lawyerProfile.user',
                ])
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedPayment->status !== 'succeeded') {
                throw ValidationException::withMessages([
                    'payment' => ['LegalMatter can only be formed after a successful payment.'],
                ]);
            }

            $engagement = $lockedPayment->invoice?->contract?->engagement;
            $legalRequest = $engagement?->legalRequest;

            abort_unless(
                $engagement !== null
                    && $legalRequest !== null
                    && $engagement->status === 'active',
                409,
                'The paid engagement is not active.',
            );

            $existingMatter = LegalMatter::query()
                ->where('source_legal_request_id', $legalRequest->id)
                ->lockForUpdate()
                ->first();

            if ($existingMatter !== null) {
                return $existingMatter;
            }

            $matter = LegalMatter::query()->create([
                'source_legal_request_id' => $legalRequest->id,
                'engagement_id' => $engagement->id,
                'client_user_id' => $legalRequest->client_user_id,
                'origin_type' => 'lawyer_selection',
                'title' => $legalRequest->title ?: 'Legal matter '.$legalRequest->public_id,
                'status' => 'active',
                'opened_at' => now(),
            ]);

            MatterMember::query()->create([
                'legal_matter_id' => $matter->id,
                'user_id' => $legalRequest->client_user_id,
                'member_role' => 'client',
                'joined_at' => now(),
            ]);

            if ($engagement->lawyerProfile?->user_id !== null) {
                MatterMember::query()->create([
                    'legal_matter_id' => $matter->id,
                    'user_id' => $engagement->lawyerProfile->user_id,
                    'member_role' => 'lawyer',
                    'joined_at' => now(),
                ]);
            }

            $legalRequest->forceFill(['status' => 'in_progress'])->save();

            return $matter;
        });
    }
}
