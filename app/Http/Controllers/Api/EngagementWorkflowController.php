<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Engagement;
use App\Models\EngagementDocumentRequest;
use App\Models\User;
use App\Services\Contracts\ContractFlowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EngagementWorkflowController extends Controller
{
    public function show(Request $request, Engagement $engagement): JsonResponse
    {
        $role = $this->participantRole($request, $engagement);

        return response()->json([
            'data' => $this->serialize($engagement, $role),
        ]);
    }

    public function update(Request $request, Engagement $engagement): JsonResponse
    {
        $role = $this->participantRole($request, $engagement);
        abort_unless($role === 'lawyer', 403, 'Only the selected lawyer may complete engagement details.');

        abort_unless(
            $engagement->status === 'pending_contract',
            409,
            'This engagement can no longer be edited.',
        );

        $validated = $request->validate([
            'start_plan' => ['required', 'string', 'min:10', 'max:2000'],
            'client_requirements' => ['required', 'string', 'min:10', 'max:3000'],
            'deliverables' => ['nullable', 'string', 'max:2000'],
            'execution_notes' => ['nullable', 'string', 'max:2500'],
        ]);

        $engagement->forceFill([
            'execution_details' => [
                'start_plan' => trim($validated['start_plan']),
                'client_requirements' => trim($validated['client_requirements']),
                'deliverables' => trim((string) ($validated['deliverables'] ?? '')),
                'execution_notes' => trim((string) ($validated['execution_notes'] ?? '')),
            ],
            'prepared_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Engagement execution details saved.',
            'data' => $this->serialize($engagement->fresh(), $role),
        ]);
    }

    public function sendContract(
        Request $request,
        Engagement $engagement,
        ContractFlowService $contractFlowService,
    ): JsonResponse {
        $role = $this->participantRole($request, $engagement);
        abort_unless($role === 'lawyer', 403, 'Only the selected lawyer may send the contract.');

        /** @var User $user */
        $user = $request->user();

        $incompleteRequiredDocuments = $engagement->documentRequests()
            ->where('is_required', true)
            ->where('status', '!=', 'accepted')
            ->exists();

        abort_if(
            $incompleteRequiredDocuments,
            409,
            'Required client documents must be reviewed and accepted before the contract is sent.',
        );

        $contractFlowService->issueFromEngagement($engagement, $user);

        return response()->json([
            'message' => 'Contract sent for signing.',
            'data' => $this->serialize($engagement->fresh(), $role),
        ]);
    }

    private function participantRole(Request $request, Engagement $engagement): string
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->status === 'active',
            403,
        );

        $engagement->loadMissing('lawyerProfile.user');

        if ($engagement->client_user_id === $user->id) {
            return 'client';
        }

        if (
            $engagement->lawyerProfile?->user_id === $user->id
            && $user->mayActAsRole('lawyer')
        ) {
            return 'lawyer';
        }

        abort(403, 'You are not a participant in this engagement.');
    }

    private function serialize(Engagement $engagement, string $role): array
    {
        $engagement->load([
            'legalRequest:id,public_id,title,status',
            'proposal:id,public_id,negotiation_id,status,summary,service_scope,proposed_fee_rial,estimated_days',
            'proposal.negotiation:id,public_id,status',
            'lawyerProfile:id,public_id,user_id,full_name',
            'lawyerProfile.user:id,public_id,name,last_name',
            'client:id,public_id,name,last_name',
            'contract.versions.signatures',
            'contract.invoices.payments',
            'documentRequests.document.currentFile',
        ]);

        $snapshot = (array) $engagement->agreement_snapshot;
        $proposal = $engagement->proposal;
        $contract = $engagement->contract;
        $version = $contract?->versions
            ?->firstWhere('version_number', $contract->current_version);
        $invoice = $contract?->invoices?->first();

        $clientId = $engagement->client_user_id;
        $lawyerUserId = $engagement->lawyerProfile?->user_id;

        return [
            'public_id' => $engagement->public_id,
            'role' => $role,
            'status' => $engagement->status,
            'contract_due_at' => $engagement->contract_due_at,
            'prepared_at' => $engagement->prepared_at,
            'contract_sent_at' => $engagement->contract_sent_at,
            'legal_request' => [
                'public_id' => $engagement->legalRequest?->public_id,
                'title' => $engagement->legalRequest?->title,
                'status' => $engagement->legalRequest?->status,
            ],
            'client' => [
                'public_id' => $engagement->client?->public_id,
                'full_name' => trim(
                    ($engagement->client?->name ?? '').' '.
                    ($engagement->client?->last_name ?? '')
                ),
            ],
            'lawyer' => [
                'public_id' => $engagement->lawyerProfile?->public_id,
                'full_name' => $engagement->lawyerProfile?->full_name,
            ],
            'negotiation' => $proposal?->negotiation === null ? null : [
                'public_id' => $proposal->negotiation->public_id,
                'status' => $proposal->negotiation->status,
            ],
            'agreement' => [
                'proposal_public_id' => $snapshot['proposal_public_id'] ?? $proposal?->public_id,
                'summary' => $snapshot['summary'] ?? $proposal?->summary,
                'service_scope' => $snapshot['service_scope'] ?? $proposal?->service_scope,
                'proposed_fee_rial' => (int) (
                    $snapshot['proposed_fee_rial']
                    ?? $proposal?->proposed_fee_rial
                    ?? 0
                ),
                'estimated_days' => (int) (
                    $snapshot['estimated_days']
                    ?? $proposal?->estimated_days
                    ?? 0
                ),
                'accepted_at' => $snapshot['accepted_at'] ?? null,
            ],
            'execution_details' => $engagement->execution_details ?? [
                'start_plan' => '',
                'client_requirements' => '',
                'deliverables' => '',
                'execution_notes' => '',
            ],
            'document_requests' => $engagement->documentRequests
                ->map(fn (EngagementDocumentRequest $item): array => $this->serializeDocumentRequest($item))
                ->values(),
            'contract' => $contract === null ? null : [
                'public_id' => $contract->public_id,
                'status' => $contract->status,
                'current_version' => $contract->current_version,
                'effective_at' => $contract->effective_at,
                'terms_text' => $version?->terms_text,
                'issued_at' => $version?->issued_at,
                'signatures' => $version?->signatures?->map(
                    function ($signature) use ($clientId, $lawyerUserId): array {
                        $signatureRole = $signature->signer_user_id === $clientId
                            ? 'client'
                            : ($signature->signer_user_id === $lawyerUserId ? 'lawyer' : 'unknown');

                        return [
                            'role' => $signatureRole,
                            'status' => $signature->status,
                            'signed_at' => $signature->signed_at,
                        ];
                    }
                )->values() ?? [],
                'invoice' => $invoice === null ? null : [
                    'public_id' => $invoice->public_id,
                    'total_rial' => (int) $invoice->total_rial,
                    'status' => $invoice->status,
                    'issued_at' => $invoice->issued_at,
                    'due_at' => $invoice->due_at,
                    'payments' => $invoice->payments->map(fn ($payment): array => [
                        'public_id' => $payment->public_id,
                        'status' => $payment->status,
                        'amount_rial' => (int) $payment->amount_rial,
                        'paid_at' => $payment->paid_at,
                    ])->values(),
                ],
            ],
        ];
    }

    private function serializeDocumentRequest(EngagementDocumentRequest $item): array
    {
        $file = $item->document?->currentFile;

        return [
            'public_id' => $item->public_id,
            'title' => $item->title,
            'instructions' => $item->instructions,
            'is_required' => $item->is_required,
            'status' => $item->status,
            'review_note' => $item->review_note,
            'uploaded_at' => $item->uploaded_at,
            'reviewed_at' => $item->reviewed_at,
            'document' => $item->document === null ? null : [
                'public_id' => $item->document->public_id,
                'title' => $item->document->title,
                'file_name' => $file?->original_name,
                'mime_type' => $file?->mime_type,
                'size_bytes' => $file?->size_bytes,
            ],
        ];
    }
}
