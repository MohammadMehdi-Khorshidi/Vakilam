<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Contract;
use App\Models\ContractSignature;
use App\Models\ContractVersion;
use App\Models\Engagement;
use App\Models\Invoice;
use App\Models\LawyerProposal;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractWorkflowController extends Controller
{
    /** The selected lawyer issues a contract from the immutable accepted proposal. */
    public function store(Request $request, Engagement $engagement): JsonResponse
    {
        $user = $this->ensureParticipant($request, $engagement);
        $engagement->loadMissing('lawyerProfile.user');

        abort_unless(
            $engagement->lawyerProfile?->user_id === $user->id,
            403,
            'Only the selected lawyer can issue the contract.',
        );

        $result = DB::transaction(function () use ($request, $user, $engagement): array {
            $lockedEngagement = Engagement::query()
                ->whereKey($engagement->id)
                ->lockForUpdate()
                ->firstOrFail();

            $existing = Contract::query()
                ->where('engagement_id', $lockedEngagement->id)
                ->first();

            if ($existing !== null) {
                return ['contract' => $existing, 'created' => false];
            }

            abort_unless(
                $lockedEngagement->status === 'pending_contract'
                    && $lockedEngagement->proposal_id !== null,
                409,
                'This engagement is not ready for a contract.',
            );

            $proposal = LawyerProposal::query()
                ->whereKey($lockedEngagement->proposal_id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $proposal->status === LawyerProposal::STATUS_ACCEPTED,
                409,
                'The engagement does not have an accepted proposal.',
            );

            $contract = Contract::query()->create([
                'engagement_id' => $lockedEngagement->id,
                'status' => 'signing',
                'current_version' => 1,
            ]);

            $termsText = json_encode([
                'accepted_proposal_public_id' => $proposal->public_id,
                'accepted_proposal_version' => $proposal->version_number,
                'accepted_proposal_hash' => $proposal->terms_hash,
                'terms' => $proposal->canonicalTerms(),
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);

            $version = ContractVersion::query()->create([
                'contract_id' => $contract->id,
                'version_number' => 1,
                'terms_text' => $termsText,
                'terms_hash' => hash('sha256', $termsText),
                'created_by' => $user->id,
                'status' => 'issued',
                'issued_at' => now(),
            ]);

            $lawyerUserId = $lockedEngagement->lawyerProfile()
                ->value('user_id');

            foreach ([$lockedEngagement->client_user_id, $lawyerUserId] as $signerId) {
                ContractSignature::query()->create([
                    'contract_version_id' => $version->id,
                    'signer_user_id' => $signerId,
                    'signature_method' => 'in_app',
                    'status' => 'pending',
                ]);
            }

            AuditLog::query()->create([
                'actor_user_id' => $user->id,
                'action' => 'contract.issued',
                'target_type' => Contract::class,
                'target_id' => $contract->id,
                'ip_address' => $request->ip(),
                'metadata' => [
                    'engagement_id' => $lockedEngagement->id,
                    'contract_version_id' => $version->id,
                ],
            ]);

            return ['contract' => $contract, 'created' => true];
        });

        return response()->json([
            'message' => $result['created']
                ? 'Contract issued for both parties to sign.'
                : 'The existing contract was returned.',
            'data' => $this->contractData($result['contract']),
        ], $result['created'] ? 201 : 200);
    }

    public function show(Request $request, Engagement $engagement): JsonResponse
    {
        $this->ensureParticipant($request, $engagement);
        $contract = $engagement->contract()->firstOrFail();

        return response()->json([
            'data' => $this->contractData($contract),
        ]);
    }

    public function sign(Request $request, Contract $contract): JsonResponse
    {
        $engagement = $contract->engagement()->firstOrFail();
        $user = $this->ensureParticipant($request, $engagement);

        $result = DB::transaction(function () use ($request, $user, $contract): array {
            $lockedContract = Contract::query()
                ->whereKey($contract->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                in_array($lockedContract->status, ['signing', 'approved'], true),
                409,
                'This contract is not open for signing.',
            );

            $version = ContractVersion::query()
                ->where('contract_id', $lockedContract->id)
                ->where('version_number', $lockedContract->current_version)
                ->firstOrFail();
            $signature = ContractSignature::query()
                ->where('contract_version_id', $version->id)
                ->where('signer_user_id', $user->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($signature->status !== 'signed') {
                $signature->forceFill([
                    'status' => 'signed',
                    'signed_at' => now(),
                    'evidence' => [
                        'ip_address' => $request->ip(),
                        'user_agent_hash' => hash('sha256', (string) $request->userAgent()),
                    ],
                ])->save();
            }

            $allSigned = ! ContractSignature::query()
                ->where('contract_version_id', $version->id)
                ->where('status', '!=', 'signed')
                ->exists();

            $invoice = null;
            if ($allSigned) {
                $version->forceFill(['status' => 'executed'])->save();
                $lockedContract->forceFill(['status' => 'approved'])->save();

                $proposal = $lockedContract->engagement()
                    ->with('proposal')
                    ->firstOrFail()
                    ->proposal;
                $amount = $proposal->advance_payment_rial > 0
                    ? $proposal->advance_payment_rial
                    : $proposal->proposed_fee_rial;

                $invoice = Invoice::query()->firstOrCreate(
                    [
                        'contract_id' => $lockedContract->id,
                        'purpose' => Invoice::PURPOSE_LAWYER_CONTRACT,
                    ],
                    [
                        'payable_type' => Contract::class,
                        'payable_id' => $lockedContract->id,
                        'client_user_id' => $lockedContract->engagement()->value('client_user_id'),
                        'subtotal_rial' => $amount,
                        'discount_rial' => 0,
                        'tax_rial' => 0,
                        'total_rial' => $amount,
                        'status' => 'issued',
                        'issued_at' => now(),
                        'due_at' => now()->addHours(48),
                    ],
                );
            }

            AuditLog::query()->create([
                'actor_user_id' => $user->id,
                'action' => 'contract.signed',
                'target_type' => Contract::class,
                'target_id' => $lockedContract->id,
                'ip_address' => $request->ip(),
                'metadata' => [
                    'contract_version_id' => $version->id,
                    'all_parties_signed' => $allSigned,
                    'invoice_id' => $invoice?->id,
                ],
            ]);

            return [
                'contract' => $lockedContract,
                'invoice' => $invoice,
                'all_signed' => $allSigned,
            ];
        });

        return response()->json([
            'message' => $result['all_signed']
                ? 'Contract fully signed and invoice issued.'
                : 'Contract signature recorded.',
            'data' => $this->contractData($result['contract']),
            'invoice' => $result['invoice'],
            'next_action' => $result['all_signed'] ? 'pay_invoice' : 'await_other_signature',
        ]);
    }

    private function ensureParticipant(Request $request, Engagement $engagement): User
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active', 403);
        $engagement->loadMissing('lawyerProfile');

        abort_unless(
            $engagement->client_user_id === $user->id
                || $engagement->lawyerProfile?->user_id === $user->id,
            403,
            'Only the engagement parties can access its contract.',
        );

        return $user;
    }

    /** @return array<string, mixed> */
    private function contractData(Contract $contract): array
    {
        $contract->load([
            'versions' => fn ($query) => $query->orderBy('version_number'),
            'versions.signatures',
            'invoices.payments',
        ]);

        return [
            'public_id' => $contract->public_id,
            'status' => $contract->status,
            'current_version' => $contract->current_version,
            'effective_at' => $contract->effective_at?->toISOString(),
            'versions' => $contract->versions,
            'invoices' => $contract->invoices,
        ];
    }
}
