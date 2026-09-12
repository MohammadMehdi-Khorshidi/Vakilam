<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Models\Engagement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LawyerCasesController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    public function index(Request $request): JsonResponse
    {
        $lawyer = $this->authenticatedLawyerProfile($request);

        abort_unless(
            $lawyer->verification_status === 'approved',
            403,
            'Only approved lawyers may access cases.',
        );

        $items = Engagement::query()
            ->where('lawyer_profile_id', $lawyer->id)
            ->with([
                'legalRequest:id,public_id,title,status,urgency,submitted_at',
                'proposal:id,public_id,negotiation_id,status,summary,service_scope,proposed_fee_rial,estimated_days',
                'proposal.negotiation:id,public_id,status',
                'client:id,public_id,name,last_name',
                'contract:id,public_id,engagement_id,status,current_version,effective_at',
                'contract.invoices:id,public_id,contract_id,total_rial,status,issued_at,due_at',
                'legalMatter:id,public_id,engagement_id,status,opened_at,closed_at',
            ])
            ->latest('created_at')
            ->get()
            ->map(fn (Engagement $engagement): array => $this->serialize($engagement))
            ->values();

        $stats = [
            'total' => $items->count(),
            'pre_contract' => $items->where('stage', 'pre_contract')->count(),
            'signing' => $items->where('stage', 'signing')->count(),
            'payment' => $items->where('stage', 'payment')->count(),
            'active' => $items->where('stage', 'active')->count(),
        ];

        return response()->json([
            'data' => $items,
            'stats' => $stats,
        ]);
    }

    public function show(Request $request, Engagement $engagement): JsonResponse
    {
        $lawyer = $this->authenticatedLawyerProfile($request);

        abort_unless(
            $engagement->lawyer_profile_id === $lawyer->id,
            403,
            'You are not allowed to access this case.',
        );

        $engagement->load([
            'legalRequest:id,public_id,title,description,status,urgency,submitted_at',
            'proposal:id,public_id,negotiation_id,status,summary,service_scope,proposed_fee_rial,estimated_days',
            'proposal.negotiation:id,public_id,status',
            'client:id,public_id,name,last_name',
            'contract:id,public_id,engagement_id,status,current_version,effective_at',
            'contract.versions:id,contract_id,version_number,status,issued_at',
            'contract.invoices:id,public_id,contract_id,total_rial,status,issued_at,due_at',
            'contract.invoices.payments:id,public_id,invoice_id,status,amount_rial,paid_at',
            'legalMatter:id,public_id,engagement_id,status,opened_at,closed_at',
        ]);

        return response()->json([
            'data' => $this->serialize($engagement, true),
        ]);
    }

    private function serialize(Engagement $engagement, bool $detailed = false): array
    {
        $contract = $engagement->contract;
        $invoice = $contract?->invoices?->first();
        $matter = $engagement->legalMatter;
        $negotiation = $engagement->proposal?->negotiation;

        $stage = 'pre_contract';
        $stageLabel = 'در انتظار تنظیم قرارداد';

        if ($matter !== null || $engagement->status === 'active') {
            $stage = 'active';
            $stageLabel = 'پرونده فعال';
        } elseif ($invoice !== null) {
            $stage = 'payment';
            $stageLabel = $invoice->status === 'paid'
                ? 'پرداخت انجام شده'
                : 'در انتظار پرداخت موکل';
        } elseif ($contract !== null) {
            $stage = 'signing';
            $stageLabel = 'در انتظار تکمیل امضا';
        }

        $snapshot = (array) $engagement->agreement_snapshot;

        $result = [
            'public_id' => $engagement->public_id,
            'status' => $engagement->status,
            'stage' => $stage,
            'stage_label' => $stageLabel,
            'created_at' => $engagement->created_at,
            'contract_due_at' => $engagement->contract_due_at,
            'legal_request' => [
                'public_id' => $engagement->legalRequest?->public_id,
                'title' => $engagement->legalRequest?->title,
                'status' => $engagement->legalRequest?->status,
                'urgency' => $engagement->legalRequest?->urgency,
                'submitted_at' => $engagement->legalRequest?->submitted_at,
            ],
            'client' => [
                'public_id' => $engagement->client?->public_id,
                'full_name' => trim(
                    ($engagement->client?->name ?? '').' '.
                    ($engagement->client?->last_name ?? '')
                ),
            ],
            'agreement' => [
                'summary' => $snapshot['summary'] ?? $engagement->proposal?->summary,
                'service_scope' => $snapshot['service_scope'] ?? $engagement->proposal?->service_scope,
                'proposed_fee_rial' => (int) (
                    $snapshot['proposed_fee_rial']
                    ?? $engagement->proposal?->proposed_fee_rial
                    ?? 0
                ),
                'estimated_days' => (int) (
                    $snapshot['estimated_days']
                    ?? $engagement->proposal?->estimated_days
                    ?? 0
                ),
            ],
            'negotiation' => $negotiation === null ? null : [
                'public_id' => $negotiation->public_id,
                'status' => $negotiation->status,
            ],
            'contract' => $contract === null ? null : [
                'public_id' => $contract->public_id,
                'status' => $contract->status,
                'current_version' => $contract->current_version,
                'effective_at' => $contract->effective_at,
            ],
            'invoice' => $invoice === null ? null : [
                'public_id' => $invoice->public_id,
                'status' => $invoice->status,
                'total_rial' => (int) $invoice->total_rial,
                'due_at' => $invoice->due_at,
            ],
            'legal_matter' => $matter === null ? null : [
                'public_id' => $matter->public_id,
                'status' => $matter->status,
                'opened_at' => $matter->opened_at,
                'closed_at' => $matter->closed_at,
            ],
        ];

        if ($detailed) {
            $result['legal_request']['description'] = $engagement->legalRequest?->description;
            $result['execution_details'] = $engagement->execution_details;
            $result['prepared_at'] = $engagement->prepared_at;
            $result['contract_sent_at'] = $engagement->contract_sent_at;
            $result['payments'] = $invoice?->payments?->map(fn ($payment): array => [
                'public_id' => $payment->public_id,
                'status' => $payment->status,
                'amount_rial' => (int) $payment->amount_rial,
                'paid_at' => $payment->paid_at,
            ])->values() ?? [];
        }

        return $result;
    }
}
