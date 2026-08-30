<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Services\LegalMatters\LegalMatterFormationService;
use Illuminate\Support\Facades\DB;

class PaymentFlowService
{
    public function __construct(
        private readonly LegalMatterFormationService $matterFormationService,
    ) {
    }

    public function initiate(Invoice $invoice, User $client, string $idempotencyKey): Payment
    {
        return DB::transaction(function () use ($invoice, $client, $idempotencyKey): Payment {
            $lockedInvoice = Invoice::query()
                ->with('contract.engagement')
                ->whereKey($invoice->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedInvoice->client_user_id === $client->id,
                403,
                'You are not allowed to pay this invoice.',
            );

            abort_unless(
                $lockedInvoice->status === 'issued'
                    && $lockedInvoice->contract?->status === 'approved',
                409,
                'This invoice is not ready for payment.',
            );

            $engagement = $lockedInvoice->contract?->engagement;
            abort_unless(
                $engagement?->contract_due_at !== null
                    && $engagement->contract_due_at->isFuture(),
                409,
                'The 48-hour contract and payment window has expired.',
            );

            $existing = Payment::query()
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($existing !== null) {
                abort_unless(
                    $existing->invoice_id === $lockedInvoice->id
                        && $existing->payer_user_id === $client->id,
                    409,
                    'This idempotency key is already used for another payment.',
                );

                return $existing;
            }

            return Payment::query()->create([
                'invoice_id' => $lockedInvoice->id,
                'payer_user_id' => $client->id,
                'amount_rial' => $lockedInvoice->total_rial,
                'status' => 'pending',
                'gateway' => 'external',
                'idempotency_key' => $idempotencyKey,
            ]);
        });
    }

    public function applyGatewayResult(Payment $payment, string $status, ?string $gatewayRef): Payment
    {
        return DB::transaction(function () use ($payment, $status, $gatewayRef): Payment {
            $locked = Payment::query()
                ->with('invoice.contract.engagement')
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status === 'succeeded') {
                $engagement = $locked->invoice?->contract?->engagement;

                if ($engagement?->status === 'active') {
                    $this->matterFormationService->createFromSuccessfulPayment($locked);
                }

                return $locked;
            }

            abort_unless(
                in_array($locked->status, ['created', 'pending'], true),
                409,
                'This payment can no longer be updated.',
            );

            abort_unless(in_array($status, ['succeeded', 'failed'], true), 422, 'Unsupported payment status.');

            $engagement = $locked->invoice?->contract?->engagement;

            if ($status === 'succeeded') {
                abort_unless(
                    $engagement?->contract_due_at !== null
                        && $engagement->contract_due_at->isFuture(),
                    409,
                    'The 48-hour contract and payment window has expired.',
                );

                $invoiceForGuard = Invoice::query()
                    ->whereKey($locked->invoice_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                abort_if(
                    $invoiceForGuard->status === 'paid'
                        || Payment::query()
                            ->where('invoice_id', $locked->invoice_id)
                            ->whereKeyNot($locked->id)
                            ->where('status', 'succeeded')
                            ->exists(),
                    409,
                    'This invoice has already been paid.',
                );
            }

            $locked->forceFill([
                'status' => $status,
                'gateway_ref' => $gatewayRef,
                'paid_at' => $status === 'succeeded' ? now() : null,
            ])->save();

            if ($status === 'failed') {
                return $locked;
            }

            $invoice = Invoice::query()->whereKey($locked->invoice_id)->lockForUpdate()->firstOrFail();
            $invoice->forceFill(['status' => 'paid'])->save();

            Payment::query()
                ->where('invoice_id', $invoice->id)
                ->whereKeyNot($locked->id)
                ->whereIn('status', ['created', 'pending'])
                ->update(['status' => 'cancelled']);

            $contract = $invoice->contract()->lockForUpdate()->firstOrFail();
            $contract->forceFill([
                'status' => 'active',
                'effective_at' => now(),
            ])->save();

            $engagement = $contract->engagement()->lockForUpdate()->firstOrFail();
            $engagement->forceFill([
                'status' => 'active',
                'started_at' => $engagement->started_at ?? now(),
            ])->save();

            $this->matterFormationService->createFromSuccessfulPayment($locked->fresh());

            return $locked->fresh(['invoice.contract.engagement']);
        });
    }
}
