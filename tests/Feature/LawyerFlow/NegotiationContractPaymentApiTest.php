<?php

use App\Models\City;
use App\Models\Contract;
use App\Models\Invoice;
use App\Models\LawyerProfile;
use App\Models\LawyerProposal;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Negotiation;
use App\Models\Province;
use App\Models\Specialty;
use App\Models\User;
use Carbon\Carbon;
use Laravel\Sanctum\Sanctum;

function fullLawyerFlowFixture(): array
{
    $client = User::factory()->create();
    $category = LegalCategory::query()->create([
        'code' => 'full-flow-'.str()->random(8),
        'name' => 'Family',
        'status' => true,
    ]);
    $specialty = Specialty::query()->create([
        'code' => $category->code,
        'name' => 'Family',
        'status' => true,
    ]);
    $province = Province::query()->create(['name' => 'Tehran '.str()->random(4)]);
    $city = City::query()->create(['province_id' => $province->id, 'name' => 'Tehran']);
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Full flow request',
        'description' => 'Full lawyer flow.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
    $lawyerUser = User::factory()->create();
    $lawyer = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => 'Full Flow Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);
    $lawyer->lawyerSpecialties()->create([
        'specialty_id' => $specialty->id,
        'years_experience' => 8,
    ]);
    $lawyer->serviceAreas()->create([
        'province_id' => $province->id,
        'city_id' => $city->id,
    ]);

    return compact('client', 'legalRequest', 'lawyerUser', 'lawyer', 'specialty', 'province', 'city');
}

function createWinningFinalProposal(array $fixture): LawyerProposal
{
    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'source' => 'client_invite',
        'status' => 'negotiating',
        'sent_at' => now(),
        'responded_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);
    $negotiation = Negotiation::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'distribution_id' => $distribution->id,
        'source' => 'client_invite',
        'status' => Negotiation::STATUS_PROPOSAL_SUBMITTED,
        'opened_at' => now(),
    ]);

    return LawyerProposal::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'negotiation_id' => $negotiation->id,
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'source' => 'matched',
        'summary' => 'Final terms',
        'service_scope' => 'Full representation',
        'proposed_fee_rial' => 90_000_000,
        'estimated_days' => 40,
        'status' => 'submitted',
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);
}

test('eligible uninvited lawyer can express interest and client can open negotiation', function () {
    $fixture = fullLawyerFlowFixture();

    Sanctum::actingAs($fixture['lawyerUser']);
    $this->getJson('/api/lawyer/open-opportunities')
        ->assertOk()
        ->assertJsonPath('data.0.public_id', $fixture['legalRequest']->public_id);

    $this->postJson("/api/lawyer/legal-requests/{$fixture['legalRequest']->id}/interest")
        ->assertCreated()
        ->assertJsonPath('interest.source', 'lawyer_interest')
        ->assertJsonPath('interest.status', 'interest_pending');

    $interest = $fixture['legalRequest']->distributions()->where('lawyer_profile_id', $fixture['lawyer']->id)->firstOrFail();

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-interests/{$interest->id}/respond", [
        'action' => 'accept',
    ])
        ->assertCreated()
        ->assertJsonPath('interest.status', 'negotiating')
        ->assertJsonPath('negotiation.status', 'active');

    $this->assertDatabaseHas('negotiations', [
        'legal_request_id' => $fixture['legalRequest']->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'source' => 'lawyer_interest',
        'status' => 'active',
    ]);
    $this->assertDatabaseCount('engagements', 0);
});

test('negotiation messages are private to client and assigned lawyer', function () {
    $fixture = fullLawyerFlowFixture();
    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'source' => 'client_invite',
        'status' => 'negotiating',
        'sent_at' => now(),
    ]);
    $negotiation = Negotiation::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'distribution_id' => $distribution->id,
        'source' => 'client_invite',
        'status' => 'active',
        'opened_at' => now(),
    ]);

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/negotiations/{$negotiation->public_id}/messages", ['body' => 'Can we adjust the fee?'])
        ->assertCreated();

    Sanctum::actingAs($fixture['lawyerUser']);
    $this->getJson("/api/negotiations/{$negotiation->public_id}")
        ->assertOk()
        ->assertJsonPath('data.messages.0.body', 'Can we adjust the fee?');

    Sanctum::actingAs(User::factory()->create());
    $this->getJson("/api/negotiations/{$negotiation->public_id}")->assertForbidden();
});

test('contract payment success is the only event that forms and activates legal matter', function () {
    Carbon::setTestNow('2026-08-29 13:00:00');
    config(['services.payment.webhook_secret' => 'test-payment-secret']);

    $fixture = fullLawyerFlowFixture();
    $proposal = createWinningFinalProposal($fixture);

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/proposals/{$proposal->public_id}/select")
        ->assertCreated();

    $engagement = $fixture['legalRequest']->engagement()->firstOrFail();
    $this->assertDatabaseCount('legal_matters', 0);

    $this->postJson("/api/engagements/{$engagement->public_id}/confirm")
        ->assertCreated();

    Sanctum::actingAs($fixture['lawyerUser']);
    $this->postJson("/api/engagements/{$engagement->public_id}/confirm")
        ->assertCreated();

    $contract = Contract::query()->where('engagement_id', $engagement->id)->firstOrFail();
    expect($contract->status)->toBe('signing');
    $this->assertDatabaseCount('legal_matters', 0);

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/contracts/{$contract->public_id}/sign")->assertOk();

    Sanctum::actingAs($fixture['lawyerUser']);
    $this->postJson("/api/contracts/{$contract->public_id}/sign")
        ->assertOk()
        ->assertJsonPath('data.status', 'approved');

    $invoice = Invoice::query()->where('contract_id', $contract->id)->firstOrFail();
    expect($invoice->total_rial)->toBe(90_000_000);
    $this->assertDatabaseCount('legal_matters', 0);

    Sanctum::actingAs($fixture['client']);
    $this->withHeader('Idempotency-Key', 'payment-idempotency-000001')
        ->postJson("/api/invoices/{$invoice->public_id}/payments")
        ->assertCreated()
        ->assertJsonPath('data.status', 'pending');

    $payment = $invoice->payments()->firstOrFail();
    $this->assertDatabaseCount('legal_matters', 0);

    $this->withHeader('X-Payment-Webhook-Secret', 'test-payment-secret')
        ->postJson("/api/payments/{$payment->public_id}/webhook", [
            'status' => 'succeeded',
            'gateway_ref' => 'gateway-123',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'succeeded')
        ->assertJsonPath('data.legal_matter.status', 'active');

    $this->assertDatabaseHas('legal_matters', [
        'source_legal_request_id' => $fixture['legalRequest']->id,
        'engagement_id' => $engagement->id,
        'client_user_id' => $fixture['client']->id,
        'origin_type' => 'lawyer_selection',
        'status' => 'active',
    ]);
    expect($engagement->fresh()->status)->toBe('active');
    expect($contract->fresh()->status)->toBe('active');
    expect($fixture['legalRequest']->fresh()->status)->toBe('in_progress');

    // Webhook retry is idempotent and cannot create a duplicate matter.
    $this->withHeader('X-Payment-Webhook-Secret', 'test-payment-secret')
        ->postJson("/api/payments/{$payment->public_id}/webhook", [
            'status' => 'succeeded',
            'gateway_ref' => 'gateway-123',
        ])->assertOk();

    $this->assertDatabaseCount('legal_matters', 1);
});

test('failed payment does not create legal matter', function () {
    config(['services.payment.webhook_secret' => 'test-payment-secret']);
    $fixture = fullLawyerFlowFixture();
    $proposal = createWinningFinalProposal($fixture);

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/proposals/{$proposal->public_id}/select")->assertCreated();
    $engagement = $fixture['legalRequest']->engagement()->firstOrFail();
    $this->postJson("/api/engagements/{$engagement->public_id}/confirm")->assertCreated();

    Sanctum::actingAs($fixture['lawyerUser']);
    $this->postJson("/api/engagements/{$engagement->public_id}/confirm")->assertCreated();
    $contract = Contract::query()->where('engagement_id', $engagement->id)->firstOrFail();

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/contracts/{$contract->public_id}/sign")->assertOk();
    Sanctum::actingAs($fixture['lawyerUser']);
    $this->postJson("/api/contracts/{$contract->public_id}/sign")->assertOk();

    $invoice = Invoice::query()->where('contract_id', $contract->id)->firstOrFail();
    Sanctum::actingAs($fixture['client']);
    $this->withHeader('Idempotency-Key', 'payment-idempotency-failed01')
        ->postJson("/api/invoices/{$invoice->public_id}/payments")->assertCreated();
    $payment = $invoice->payments()->firstOrFail();

    $this->withHeader('X-Payment-Webhook-Secret', 'test-payment-secret')
        ->postJson("/api/payments/{$payment->public_id}/webhook", ['status' => 'failed'])
        ->assertOk();

    $this->assertDatabaseCount('legal_matters', 0);
    expect($engagement->fresh()->status)->toBe('pending_contract');
});
