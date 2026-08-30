<?php

namespace App\Services\Payments;

use App\Models\AuditLog;
use App\Models\Contract;
use App\Models\Engagement;
use App\Models\Invoice;
use App\Models\LegalMatter;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class CompletePaymentService
{
    public function succeeded(
        Payment $payment,
        string $gatewayReference,
    ): ?LegalMatter {
        return DB::transaction(function () use ($payment, $gatewayReference): ?LegalMatter {
            $lockedPayment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedPayment->status === 'succeeded') {
                return $this->matterFor($lockedPayment);
            }

            abort_unless(
                in_array($lockedPayment->status, ['created', 'pending'], true),
                409,
                'This payment cannot be completed.',
            );

            $invoice = $lockedPayment->invoice()
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $invoice->status === 'issued'
                    && $lockedPayment->amount_rial === $invoice->total_rial,
                409,
                'The invoice is not payable by this payment.',
            );

            $lockedPayment->forceFill([
                'status' => 'succeeded',
                'gateway_ref' => $gatewayReference,
                'paid_at' => now(),
            ])->save();
            $invoice->forceFill(['status' => 'paid'])->save();

            $matter = match ($invoice->purpose) {
                Invoice::PURPOSE_LAWYER_CONTRACT => $this->activateLawyerContract($invoice),
                default => null,
            };

            AuditLog::query()->create([
                'actor_user_id' => null,
                'action' => 'payment.succeeded',
                'target_type' => Payment::class,
                'target_id' => $lockedPayment->id,
                'metadata' => [
                    'invoice_id' => $invoice->id,
                    'purpose' => $invoice->purpose,
                    'legal_matter_id' => $matter?->id,
                ],
            ]);

            return $matter;
        });
    }

    public function failed(Payment $payment, ?string $gatewayReference = null): void
    {
        DB::transaction(function () use ($payment, $gatewayReference): void {
            $lockedPayment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (in_array($lockedPayment->status, ['created', 'pending'], true)) {
                $lockedPayment->forceFill([
                    'status' => 'failed',
                    'gateway_ref' => $gatewayReference,
                ])->save();
            }
        });
    }

    private function activateLawyerContract($invoice): LegalMatter
    {
        $contract = Contract::query()
            ->whereKey($invoice->payable_id ?? $invoice->contract_id)
            ->lockForUpdate()
            ->firstOrFail();
        $engagement = Engagement::query()
            ->whereKey($contract->engagement_id)
            ->lockForUpdate()
            ->firstOrFail();

        abort_unless($contract->status === 'approved', 409, 'The contract is not fully signed.');

        $contract->forceFill([
            'status' => 'active',
            'effective_at' => now(),
        ])->save();
        $engagement->forceFill([
            'status' => 'active',
            'started_at' => now(),
        ])->save();

        $legalRequest = $engagement->legalRequest()->firstOrFail();
        $originType = in_array(
            $legalRequest->service_intent,
            [LegalMatter::ORIGIN_LAWYER_SELECTION, LegalMatter::ORIGIN_AI_ASSISTANT],
            true,
        ) ? $legalRequest->service_intent : LegalMatter::ORIGIN_LAWYER_SELECTION;

        return LegalMatter::query()->firstOrCreate(
            ['source_legal_request_id' => $engagement->legal_request_id],
            [
                'origin_type' => $originType,
                'originable_type' => Engagement::class,
                'originable_id' => $engagement->id,
                'engagement_id' => $engagement->id,
                'client_user_id' => $engagement->client_user_id,
                'title' => $legalRequest->title ?: 'Legal matter',
                'status' => 'active',
                'opened_at' => now(),
            ],
        );
    }

    private function matterFor(Payment $payment): ?LegalMatter
    {
        $invoice = $payment->invoice()->firstOrFail();
        if ($invoice->purpose !== Invoice::PURPOSE_LAWYER_CONTRACT) {
            return null;
        }

        $contract = Contract::query()->find($invoice->payable_id ?? $invoice->contract_id);

        return $contract === null
            ? null
            : LegalMatter::query()
                ->where('engagement_id', $contract->engagement_id)
                ->first();
    }
}
