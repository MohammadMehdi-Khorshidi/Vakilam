<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Engagement;
use App\Models\User;
use App\Services\Contracts\ContractFlowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function show(Request $request, Contract $contract): JsonResponse
    {
        $this->ensureParticipant($request, $contract);
        $contract->load(['engagement', 'versions.signatures', 'invoices.payments']);

        return response()->json(['data' => $this->serialize($contract)]);
    }

    public function sign(
        Request $request,
        Contract $contract,
        ContractFlowService $contractFlowService,
    ): JsonResponse {
        $this->ensureParticipant($request, $contract);
        $contract = $contractFlowService->signContract($contract, $request->user());

        return response()->json([
            'message' => $contract->status === 'approved'
                ? 'Contract fully signed and invoice issued.'
                : 'Contract signed successfully.',
            'data' => $this->serialize($contract),
        ]);
    }

    private function ensureParticipant(Request $request, Contract $contract): void
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active', 403);

        $contract->loadMissing('engagement.lawyerProfile');
        $engagement = $contract->engagement;

        abort_unless($engagement instanceof Engagement, 409, 'Contract engagement is not available.');

        $isClient = $engagement->client_user_id === $user->id;
        $isLawyer = $engagement->lawyerProfile?->user_id === $user->id
            && $user->mayActAsRole('lawyer');

        abort_unless($isClient || $isLawyer, 403, 'You are not allowed to access this contract.');
    }

    private function serialize(Contract $contract): array
    {
        $contract->loadMissing(['engagement', 'versions.signatures', 'invoices.payments']);

        return [
            'public_id' => $contract->public_id,
            'status' => $contract->status,
            'current_version' => $contract->current_version,
            'effective_at' => $contract->effective_at,
            'engagement' => $contract->engagement === null ? null : [
                'public_id' => $contract->engagement->public_id,
                'status' => $contract->engagement->status,
                'contract_due_at' => $contract->engagement->contract_due_at,
            ],
            'versions' => $contract->versions->map(fn ($version): array => [
                'version_number' => $version->version_number,
                'status' => $version->status,
                'terms_text' => $version->terms_text,
                'terms_hash' => $version->terms_hash,
                'issued_at' => $version->issued_at,
                'signatures' => $version->signatures->map(fn ($signature): array => [
                    'signer_user_id' => $signature->signer_user_id,
                    'status' => $signature->status,
                    'signed_at' => $signature->signed_at,
                ])->values(),
            ])->values(),
            'invoice' => $contract->invoices->first() === null ? null : [
                'public_id' => $contract->invoices->first()->public_id,
                'total_rial' => $contract->invoices->first()->total_rial,
                'status' => $contract->invoices->first()->status,
                'issued_at' => $contract->invoices->first()->issued_at,
                'due_at' => $contract->invoices->first()->due_at,
                'payments' => $contract->invoices->first()->payments->map(fn ($payment): array => [
                    'public_id' => $payment->public_id,
                    'status' => $payment->status,
                    'amount_rial' => $payment->amount_rial,
                    'paid_at' => $payment->paid_at,
                ])->values(),
            ],
        ];
    }
}
