<?php

namespace App\Services\Contracts;

use App\Models\Contract;
use App\Models\ContractSignature;
use App\Models\ContractVersion;
use App\Models\Engagement;
use App\Models\EngagementConfirmation;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ContractFlowService
{
    /** @return array{confirmation: EngagementConfirmation, contract: Contract|null} */
    public function confirmEngagement(Engagement $engagement, User $user): array
    {
        return DB::transaction(function () use ($engagement, $user): array {
            $locked = Engagement::query()
                ->with(['proposal', 'lawyerProfile.user'])
                ->whereKey($engagement->id)
                ->lockForUpdate()
                ->firstOrFail();

            $role = $this->participantRole($locked, $user);
            $this->ensureWithinContractWindow($locked);

            abort_unless(
                $locked->status === 'pending_contract',
                409,
                'This engagement is not awaiting contract confirmation.',
            );

            $confirmation = EngagementConfirmation::query()->firstOrCreate(
                [
                    'engagement_id' => $locked->id,
                    'user_id' => $user->id,
                ],
                [
                    'role' => $role,
                    'confirmed_at' => now(),
                ],
            );

            $confirmedRoles = EngagementConfirmation::query()
                ->where('engagement_id', $locked->id)
                ->pluck('role')
                ->unique();

            $contract = null;

            if ($confirmedRoles->contains('client') && $confirmedRoles->contains('lawyer')) {
                $contract = $this->ensureContract($locked, $user);
            }

            return [
                'confirmation' => $confirmation,
                'contract' => $contract,
            ];
        });
    }

    public function signContract(Contract $contract, User $user): Contract
    {
        return DB::transaction(function () use ($contract, $user): Contract {
            $locked = Contract::query()
                ->with(['engagement.proposal', 'engagement.lawyerProfile.user'])
                ->whereKey($contract->id)
                ->lockForUpdate()
                ->firstOrFail();

            $engagement = $locked->engagement;
            abort_unless($engagement !== null, 409, 'Contract engagement is not available.');

            $this->participantRole($engagement, $user);
            $this->ensureWithinContractWindow($engagement);

            abort_unless(
                in_array($locked->status, ['signing', 'approved'], true),
                409,
                'This contract is not available for signing.',
            );

            $version = ContractVersion::query()
                ->where('contract_id', $locked->id)
                ->where('version_number', $locked->current_version)
                ->lockForUpdate()
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
                ])->save();
            }

            $allSigned = ContractSignature::query()
                ->where('contract_version_id', $version->id)
                ->where('status', '!=', 'signed')
                ->doesntExist();

            if ($allSigned) {
                $version->forceFill(['status' => 'executed'])->save();
                $locked->forceFill(['status' => 'approved'])->save();
                $this->ensureInvoice($locked, $engagement);
            }

            return $locked->fresh([
                'engagement:id,public_id,status,contract_due_at,proposal_id,client_user_id,lawyer_profile_id',
                'versions.signatures',
                'invoices.payments',
            ]);
        });
    }

    public function ensureContract(Engagement $engagement, User $creator): Contract
    {
        $existing = Contract::query()->where('engagement_id', $engagement->id)->first();

        if ($existing !== null) {
            return $existing->load(['versions.signatures', 'invoices.payments']);
        }

        abort_unless($engagement->proposal !== null, 409, 'Engagement final proposal is not available.');
        abort_unless($engagement->lawyerProfile?->user !== null, 409, 'Engagement lawyer account is not available.');

        $contract = Contract::query()->create([
            'engagement_id' => $engagement->id,
            'status' => 'signing',
            'current_version' => 1,
        ]);

        $termsText = $this->termsFromProposal($engagement);
        $version = ContractVersion::query()->create([
            'contract_id' => $contract->id,
            'version_number' => 1,
            'terms_text' => $termsText,
            'terms_hash' => hash('sha256', $termsText),
            'created_by' => $creator->id,
            'status' => 'issued',
            'issued_at' => now(),
        ]);

        foreach ([$engagement->client_user_id, $engagement->lawyerProfile->user->id] as $signerUserId) {
            ContractSignature::query()->create([
                'contract_version_id' => $version->id,
                'signer_user_id' => $signerUserId,
                'signature_method' => 'in_app',
                'status' => 'pending',
            ]);
        }

        return $contract->load(['versions.signatures', 'invoices.payments']);
    }

    private function ensureInvoice(Contract $contract, Engagement $engagement): Invoice
    {
        $proposal = $engagement->proposal;
        abort_unless($proposal !== null && $proposal->proposed_fee_rial !== null, 409, 'Proposal fee is not available.');

        return Invoice::query()->firstOrCreate(
            ['contract_id' => $contract->id],
            [
                'client_user_id' => $engagement->client_user_id,
                'subtotal_rial' => $proposal->proposed_fee_rial,
                'discount_rial' => 0,
                'tax_rial' => 0,
                'total_rial' => $proposal->proposed_fee_rial,
                'status' => 'issued',
                'issued_at' => now(),
                'due_at' => $engagement->contract_due_at,
            ],
        );
    }

    private function participantRole(Engagement $engagement, User $user): string
    {
        if ($engagement->client_user_id === $user->id) {
            return 'client';
        }

        if ($engagement->lawyerProfile?->user_id === $user->id && $user->mayActAsRole('lawyer')) {
            return 'lawyer';
        }

        abort(403, 'You are not a participant in this engagement.');
    }

    private function ensureWithinContractWindow(Engagement $engagement): void
    {
        abort_unless(
            $engagement->contract_due_at !== null && $engagement->contract_due_at->isFuture(),
            409,
            'The 48-hour contract and payment window has expired.',
        );
    }

    private function termsFromProposal(Engagement $engagement): string
    {
        $proposal = $engagement->proposal;

        return implode("\n", [
            'Vakilam pre-contract terms',
            'Proposal: '.$proposal->public_id,
            'Service scope: '.trim((string) $proposal->service_scope),
            'Summary: '.trim((string) $proposal->summary),
            'Fee (Rial): '.(string) $proposal->proposed_fee_rial,
            'Estimated days: '.(string) $proposal->estimated_days,
        ]);
    }
}
