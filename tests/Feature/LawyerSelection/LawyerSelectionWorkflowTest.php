<?php

use App\Models\Contract;
use App\Models\Engagement;
use App\Models\Invoice;
use App\Models\LawyerProfile;
use App\Models\LawyerProposal;
use App\Models\LegalMatter;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\NegotiationThread;
use App\Models\Payment;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/** @return array{0: User, 1: LawyerProfile} */
function workflowLawyer(string $name): array
{
    $user = User::factory()->create(['name' => $name]);
    $profile = LawyerProfile::query()->create([
        'user_id' => $user->id,
        'full_name' => $name.' Lawyer',
        'license_number' => fake()->unique()->numerify('LIC-######'),
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    return [$user, $profile];
}

/** @return array<string, mixed> */
function workflowProposalPayload(int $fee): array
{
    return [
        'summary' => 'Complete legal representation under the negotiated terms.',
        'proposed_fee_rial' => $fee,
        'advance_payment_rial' => intdiv($fee, 2),
        'estimated_days' => 60,
        'service_scope' => ['Prepare the claim', 'Attend hearings'],
        'excluded_services' => ['Appeal proceedings'],
        'payment_terms' => ['Half in advance', 'Half after filing'],
        'other_terms' => 'Court fees are paid separately by the client.',
    ];
}

test('the invited lawyer workflow forms a matter only after successful payment', function () {
    config()->set('payment.webhook_secret', 'workflow-test-secret');

    $client = User::factory()->create();
    [$firstLawyerUser, $firstLawyer] = workflowLawyer('First');
    [$secondLawyerUser, $secondLawyer] = workflowLawyer('Second');

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Payment claim',
        'description' => 'A submitted request for lawyer selection.',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $firstDistribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $firstLawyer->id,
        'status' => LegalRequestDistribution::STATUS_SENT,
        'sent_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);
    $secondDistribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $secondLawyer->id,
        'status' => LegalRequestDistribution::STATUS_SENT,
        'sent_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    Sanctum::actingAs($firstLawyerUser);
    $this->postJson("/api/lawyer/distributions/{$firstDistribution->id}/respond", [
        'action' => 'accept',
    ])->assertCreated();

    Sanctum::actingAs($secondLawyerUser);
    $this->postJson("/api/lawyer/distributions/{$secondDistribution->id}/respond", [
        'action' => 'accept',
    ])->assertCreated();

    $firstNegotiation = $firstDistribution->negotiationThread()->firstOrFail();
    $secondNegotiation = $secondDistribution->negotiationThread()->firstOrFail();

    $this->assertDatabaseCount('engagements', 0);

    Sanctum::actingAs($firstLawyerUser);
    $this->postJson("/api/negotiations/{$firstNegotiation->id}/messages", [
        'body' => 'We can discuss the fee and exact scope here.',
    ])->assertCreated();
    $this->postJson("/api/negotiations/{$firstNegotiation->id}/messages", [
        'body' => 'Call me on 09121234567.',
    ])->assertUnprocessable();

    $this->postJson(
        "/api/negotiations/{$firstNegotiation->id}/proposals",
        workflowProposalPayload(500_000_000),
    )->assertCreated();
    $firstVersion = $firstNegotiation->proposals()->firstOrFail();

    Sanctum::actingAs($client);
    $this->postJson(
        "/api/negotiations/{$firstNegotiation->id}/proposals/{$firstVersion->id}/reject",
    )->assertOk();
    expect($firstVersion->fresh()->status)->toBe(LawyerProposal::STATUS_REJECTED)
        ->and($firstNegotiation->fresh()->status)->toBe(NegotiationThread::STATUS_OPEN);

    Sanctum::actingAs($firstLawyerUser);
    $this->postJson(
        "/api/negotiations/{$firstNegotiation->id}/proposals",
        workflowProposalPayload(450_000_000),
    )->assertCreated();
    $acceptedProposal = $firstNegotiation->proposals()
        ->where('version_number', 2)
        ->firstOrFail();

    Sanctum::actingAs($secondLawyerUser);
    $this->postJson(
        "/api/negotiations/{$secondNegotiation->id}/proposals",
        workflowProposalPayload(470_000_000),
    )->assertCreated();

    Sanctum::actingAs($client);
    $this->postJson(
        "/api/negotiations/{$firstNegotiation->id}/proposals/{$acceptedProposal->id}/accept",
    )->assertCreated()
        ->assertJsonPath('next_action', 'create_contract');

    $engagement = Engagement::query()->where('legal_request_id', $legalRequest->id)->firstOrFail();
    expect($engagement->proposal_id)->toBe($acceptedProposal->id)
        ->and($engagement->status)->toBe('pending_contract')
        ->and($legalRequest->fresh()->status)->toBe('matched')
        ->and($secondNegotiation->fresh()->status)->toBe(NegotiationThread::STATUS_CLOSED)
        ->and($secondDistribution->fresh()->status)->toBe(LegalRequestDistribution::STATUS_CLOSED);

    $this->assertDatabaseCount('engagements', 1);
    $this->assertDatabaseCount('legal_matters', 0);

    Sanctum::actingAs($firstLawyerUser);
    $this->postJson("/api/engagements/{$engagement->id}/contract")
        ->assertCreated();
    $contract = Contract::query()->where('engagement_id', $engagement->id)->firstOrFail();

    Sanctum::actingAs($client);
    $this->postJson("/api/contracts/{$contract->id}/sign")
        ->assertOk()
        ->assertJsonPath('next_action', 'await_other_signature');

    Sanctum::actingAs($firstLawyerUser);
    $this->postJson("/api/contracts/{$contract->id}/sign")
        ->assertOk()
        ->assertJsonPath('next_action', 'pay_invoice');

    $invoice = Invoice::query()->where('contract_id', $contract->id)->firstOrFail();
    expect($invoice->purpose)->toBe('lawyer_contract')
        ->and($invoice->payable_type)->toBe(Contract::class)
        ->and($invoice->due_at->isFuture())->toBeTrue();

    Sanctum::actingAs($client);
    $this->postJson("/api/invoices/{$invoice->id}/payments", [
        'idempotency_key' => 'workflow-payment-attempt-1',
        'gateway' => 'test',
    ])->assertCreated();

    $payment = Payment::query()->where('invoice_id', $invoice->id)->firstOrFail();
    $payload = json_encode([
        'payment_public_id' => $payment->public_id,
        'status' => 'succeeded',
        'gateway_ref' => 'gateway-reference-1',
    ], JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha256', $payload, 'workflow-test-secret');

    $this->call(
        'POST',
        '/api/payments/webhook',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_VAKILAM_WEBHOOK_SIGNATURE' => $signature,
        ],
        $payload,
    )->assertOk();

    $matter = LegalMatter::query()
        ->where('source_legal_request_id', $legalRequest->id)
        ->firstOrFail();

    expect($payment->fresh()->status)->toBe('succeeded')
        ->and($invoice->fresh()->status)->toBe('paid')
        ->and($contract->fresh()->status)->toBe('active')
        ->and($engagement->fresh()->status)->toBe('active')
        ->and($matter->status)->toBe('active')
        ->and($matter->origin_type)->toBe('lawyer_selection')
        ->and($matter->originable_type)->toBe(Engagement::class)
        ->and($matter->originable_id)->toBe($engagement->id);
});

test('a lawyer rejection closes only that invitation without opening negotiation', function () {
    $client = User::factory()->create();
    [$lawyerUser, $lawyer] = workflowLawyer('Rejecting');
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Rejected invitation',
        'description' => 'A submitted request.',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyer->id,
        'status' => LegalRequestDistribution::STATUS_SENT,
        'sent_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    Sanctum::actingAs($lawyerUser);
    $this->postJson("/api/lawyer/distributions/{$distribution->id}/respond", [
        'action' => 'reject',
    ])->assertOk();

    expect($distribution->fresh()->status)->toBe(LegalRequestDistribution::STATUS_REJECTED)
        ->and($distribution->fresh()->responded_at)->not->toBeNull();
    $this->assertDatabaseCount('negotiation_threads', 0);
    $this->assertDatabaseCount('engagements', 0);
});
