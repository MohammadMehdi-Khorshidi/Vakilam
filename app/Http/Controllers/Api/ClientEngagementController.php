<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Engagement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientEngagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->status === 'active', 403);

        $items = Engagement::query()
            ->where('client_user_id', $user->id)
            ->with([
                'legalRequest:id,public_id,title,status,updated_at',
                'proposal:id,public_id,negotiation_id,proposed_fee_rial,estimated_days',
                'proposal.negotiation:id,public_id,status',
                'lawyerProfile:id,public_id,full_name',
                'contract:id,public_id,engagement_id,status',
                'contract.invoices:id,public_id,contract_id,status,total_rial',
                'legalMatter:id,public_id,engagement_id,status',
                'documentRequests:id,engagement_id,status,is_required',
            ])
            ->latest('created_at')
            ->get()
            ->map(function (Engagement $engagement): array {
                $contract = $engagement->contract;
                $invoice = $contract?->invoices?->first();
                $stage = 'agreement';
                $label = 'توافق با وکیل';

                if ($engagement->legalMatter !== null || $engagement->status === 'active') {
                    $stage = 'active';
                    $label = 'پرونده فعال';
                } elseif ($invoice !== null) {
                    $stage = 'payment';
                    $label = $invoice->status === 'paid'
                        ? 'پرداخت انجام شده'
                        : 'در انتظار پرداخت';
                } elseif ($contract !== null) {
                    $stage = 'signing';
                    $label = 'قرارداد و امضا';
                } elseif ($engagement->prepared_at !== null) {
                    $stage = 'documents';
                    $label = 'تکمیل مدارک و قرارداد';
                }

                $required = $engagement->documentRequests
                    ->where('is_required', true);
                $accepted = $required->where('status', 'accepted')->count();

                return [
                    'public_id' => $engagement->public_id,
                    'status' => $engagement->status,
                    'stage' => $stage,
                    'stage_label' => $label,
                    'contract_due_at' => $engagement->contract_due_at,
                    'legal_request' => [
                        'public_id' => $engagement->legalRequest?->public_id,
                        'title' => $engagement->legalRequest?->title,
                        'status' => $engagement->legalRequest?->status,
                        'updated_at' => $engagement->legalRequest?->updated_at,
                    ],
                    'lawyer' => [
                        'public_id' => $engagement->lawyerProfile?->public_id,
                        'full_name' => $engagement->lawyerProfile?->full_name,
                    ],
                    'agreement' => [
                        'proposed_fee_rial' => (int) (
                            data_get($engagement->agreement_snapshot, 'proposed_fee_rial')
                            ?? $engagement->proposal?->proposed_fee_rial
                            ?? 0
                        ),
                        'estimated_days' => (int) (
                            data_get($engagement->agreement_snapshot, 'estimated_days')
                            ?? $engagement->proposal?->estimated_days
                            ?? 0
                        ),
                    ],
                    'negotiation' => $engagement->proposal?->negotiation === null ? null : [
                        'public_id' => $engagement->proposal->negotiation->public_id,
                        'status' => $engagement->proposal->negotiation->status,
                    ],
                    'documents' => [
                        'required' => $required->count(),
                        'accepted' => $accepted,
                        'pending' => max(0, $required->count() - $accepted),
                    ],
                    'contract' => $contract === null ? null : [
                        'public_id' => $contract->public_id,
                        'status' => $contract->status,
                    ],
                    'invoice' => $invoice === null ? null : [
                        'public_id' => $invoice->public_id,
                        'status' => $invoice->status,
                        'total_rial' => (int) $invoice->total_rial,
                    ],
                    'legal_matter' => $engagement->legalMatter === null ? null : [
                        'public_id' => $engagement->legalMatter->public_id,
                        'status' => $engagement->legalMatter->status,
                    ],
                ];
            })
            ->values();

        return response()->json(['data' => $items]);
    }
}
