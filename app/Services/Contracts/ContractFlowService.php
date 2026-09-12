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

    public function issueFromEngagement(Engagement $engagement, User $lawyer): Contract
    {
        return DB::transaction(function () use ($engagement, $lawyer): Contract {
            $locked = Engagement::query()
                ->with(['proposal', 'lawyerProfile.user'])
                ->whereKey($engagement->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $locked->lawyerProfile?->user_id === $lawyer->id
                    && $lawyer->mayActAsRole('lawyer'),
                403,
                'Only the selected lawyer may prepare this contract.',
            );

            $this->ensureWithinContractWindow($locked);

            abort_unless(
                $locked->status === 'pending_contract',
                409,
                'This engagement is not awaiting a contract.',
            );

            $details = (array) $locked->execution_details;

            abort_unless(
                trim((string) ($details['start_plan'] ?? '')) !== ''
                    && trim((string) ($details['client_requirements'] ?? '')) !== '',
                422,
                'Complete the engagement execution details before sending the contract.',
            );

            if ($locked->prepared_at === null) {
                $locked->forceFill(['prepared_at' => now()])->save();
            }

            $contract = $this->ensureContract($locked, $lawyer);

            if ($locked->contract_sent_at === null) {
                $locked->forceFill(['contract_sent_at' => now()])->save();
            }

            return $contract->fresh([
                'engagement',
                'versions.signatures',
                'invoices.payments',
            ]);
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

        $termsText = $this->termsFromEngagement($engagement);

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
        $snapshot = (array) $engagement->agreement_snapshot;
        $fee = $snapshot['proposed_fee_rial']
            ?? $engagement->proposal?->proposed_fee_rial;

        abort_unless(
            $fee !== null && (int) $fee > 0,
            409,
            'Accepted agreement fee is not available.',
        );

        return Invoice::query()->firstOrCreate(
            ['contract_id' => $contract->id],
            [
                'client_user_id' => $engagement->client_user_id,
                'subtotal_rial' => (int) $fee,
                'discount_rial' => 0,
                'tax_rial' => 0,
                'total_rial' => (int) $fee,
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

    private function termsFromEngagement(Engagement $engagement): string
    {
        $snapshot = (array) $engagement->agreement_snapshot;
        $details = (array) $engagement->execution_details;
        $proposal = $engagement->proposal;

        $scope = trim((string) ($snapshot['service_scope'] ?? $proposal?->service_scope ?? ''));
        $summary = trim((string) ($snapshot['summary'] ?? $proposal?->summary ?? ''));
        $fee = (int) ($snapshot['proposed_fee_rial'] ?? $proposal?->proposed_fee_rial ?? 0);
        $days = (int) ($snapshot['estimated_days'] ?? $proposal?->estimated_days ?? 0);

        return implode("\n\n", array_filter([
            'قرارداد خدمات حقوقی وکیلم',
            "شرح توافق: {$summary}",
            "دامنه خدمات توافق‌شده: {$scope}",
            'حق‌الزحمه توافق‌شده: '.number_format($fee).' ریال',
            "مدت برآوردشده اجرای خدمات: {$days} روز",
            'برنامه شروع و اجرای کار: '.trim((string) ($details['start_plan'] ?? '')),
            'اقدامات و مدارک موردنیاز از موکل: '.trim((string) ($details['client_requirements'] ?? '')),
            trim((string) ($details['deliverables'] ?? '')) !== ''
                ? 'خروجی‌ها و تحویل‌دادنی‌ها: '.trim((string) $details['deliverables'])
                : null,
            trim((string) ($details['execution_notes'] ?? '')) !== ''
                ? 'توضیحات اجرایی تکمیلی: '.trim((string) $details['execution_notes'])
                : null,
            'مبلغ، دامنه خدمات و مدت فوق مستقیماً از توافق پذیرفته‌شده استخراج شده‌اند و در این مرحله قابل تغییر نیستند.',
        ]));
    }
}
