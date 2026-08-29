<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Services\Payments\PaymentFlowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(
        Request $request,
        Invoice $invoice,
        PaymentFlowService $paymentFlowService,
    ): JsonResponse {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active', 403);

        $idempotencyKey = trim((string) $request->header('Idempotency-Key'));
        abort_unless(
            strlen($idempotencyKey) >= 16 && strlen($idempotencyKey) <= 64,
            422,
            'A 16-64 character Idempotency-Key header is required.',
        );

        $payment = $paymentFlowService->initiate($invoice, $user, $idempotencyKey);

        return response()->json([
            'message' => 'Payment attempt created successfully.',
            'data' => $this->serialize($payment),
        ], 201);
    }

    public function show(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $payment->payer_user_id === $user->id,
            403,
            'You are not allowed to view this payment.',
        );

        return response()->json(['data' => $this->serialize($payment)]);
    }

    public function webhook(
        Request $request,
        Payment $payment,
        PaymentFlowService $paymentFlowService,
    ): JsonResponse {
        $configuredSecret = (string) config('services.payment.webhook_secret');
        abort_if($configuredSecret === '', 503, 'Payment webhook secret is not configured.');

        $providedSecret = (string) $request->header('X-Payment-Webhook-Secret');
        abort_unless(
            $providedSecret !== '' && hash_equals($configuredSecret, $providedSecret),
            403,
            'Invalid payment webhook secret.',
        );

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:succeeded,failed'],
            'gateway_ref' => ['nullable', 'string', 'max:100'],
        ]);

        $payment = $paymentFlowService->applyGatewayResult(
            $payment,
            $validated['status'],
            $validated['gateway_ref'] ?? null,
        );

        return response()->json([
            'message' => 'Payment result processed successfully.',
            'data' => $this->serialize($payment),
        ]);
    }

    private function serialize(Payment $payment): array
    {
        $payment->loadMissing('invoice.contract.engagement.legalMatter');

        $legalMatter = $payment
            ->invoice
            ?->contract
            ?->engagement
            ?->legalMatter;

        return [
            'public_id' => $payment->public_id,
            'status' => $payment->status,
            'amount_rial' => $payment->amount_rial,
            'gateway' => $payment->gateway,
            'gateway_ref' => $payment->gateway_ref,
            'paid_at' => $payment->paid_at,
            'invoice' => $payment->invoice === null ? null : [
                'public_id' => $payment->invoice->public_id,
                'status' => $payment->invoice->status,
                'total_rial' => $payment->invoice->total_rial,
            ],
            'legal_matter' => $payment->invoice?->contract?->engagement?->legalMatter === null ? null : [
                'public_id' => $payment->invoice->contract->engagement->legalMatter->public_id,
                'status' => $payment->invoice->contract->engagement->legalMatter->status,
            ],
        ];
    }
}
