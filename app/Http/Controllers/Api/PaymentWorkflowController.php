<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Services\Payments\CompletePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PaymentWorkflowController extends Controller
{
    public function store(Request $request, Invoice $invoice): JsonResponse
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $invoice->client_user_id === $user->id,
            403,
            'Only the invoiced client can initiate this payment.',
        );

        $data = $request->validate([
            'idempotency_key' => ['required', 'string', 'max:64'],
            'gateway' => ['nullable', 'string', 'max:40'],
        ]);

        $result = DB::transaction(function () use ($invoice, $user, $data): array {
            $lockedInvoice = Invoice::query()
                ->whereKey($invoice->id)
                ->lockForUpdate()
                ->firstOrFail();

            $existing = Payment::query()
                ->where('idempotency_key', $data['idempotency_key'])
                ->first();

            if ($existing !== null) {
                if (
                    $existing->invoice_id !== $lockedInvoice->id
                    || $existing->payer_user_id !== $user->id
                ) {
                    throw ValidationException::withMessages([
                        'idempotency_key' => ['This idempotency key belongs to another payment.'],
                    ]);
                }

                return ['payment' => $existing, 'created' => false];
            }

            abort_unless(
                $lockedInvoice->status === 'issued'
                    && ($lockedInvoice->due_at === null || $lockedInvoice->due_at->isFuture()),
                409,
                'This invoice is not payable.',
            );

            $payment = Payment::query()->create([
                'invoice_id' => $lockedInvoice->id,
                'payer_user_id' => $user->id,
                'amount_rial' => $lockedInvoice->total_rial,
                'status' => 'pending',
                'gateway' => $data['gateway'] ?? 'unconfigured',
                'idempotency_key' => $data['idempotency_key'],
            ]);

            return ['payment' => $payment, 'created' => true];
        });

        return response()->json([
            'message' => $result['created']
                ? 'Payment initiated; awaiting the payment gateway callback.'
                : 'The existing payment attempt was returned.',
            'data' => $result['payment'],
        ], $result['created'] ? 201 : 200);
    }

    /** Generic signed callback boundary for a future concrete gateway adapter. */
    public function webhook(
        Request $request,
        CompletePaymentService $payments,
    ): JsonResponse {
        $secret = (string) config('payment.webhook_secret');
        abort_if($secret === '', 503, 'Payment webhook is not configured.');

        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        $provided = (string) $request->header('X-Vakilam-Webhook-Signature');
        abort_unless(
            $provided !== '' && hash_equals($expected, $provided),
            401,
            'Invalid payment webhook signature.',
        );

        $data = $request->validate([
            'payment_public_id' => [
                'required',
                'uuid',
                Rule::exists('payments', 'public_id'),
            ],
            'status' => ['required', Rule::in(['succeeded', 'failed'])],
            'gateway_ref' => ['required_if:status,succeeded', 'nullable', 'string', 'max:100'],
        ]);
        $payment = Payment::query()
            ->where('public_id', $data['payment_public_id'])
            ->firstOrFail();

        $matter = null;
        if ($data['status'] === 'succeeded') {
            $matter = $payments->succeeded(
                $payment,
                (string) ($data['gateway_ref'] ?? ''),
            );
        } else {
            $payments->failed($payment, $data['gateway_ref'] ?? null);
        }

        return response()->json([
            'message' => 'Payment callback processed.',
            'payment_status' => $payment->fresh()->status,
            'legal_matter_public_id' => $matter?->public_id,
        ]);
    }
}
