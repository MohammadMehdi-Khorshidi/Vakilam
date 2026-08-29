<?php

use App\Models\LawyerProfile;
use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Negotiation;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function legacyFinalSelectionFixture(): array
{
    $client = User::factory()->create();
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Legacy selection compatibility',
        'description' => 'Submitted request',
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
    $lawyerUser = User::factory()->create();
    $lawyer = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => 'Final Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);
    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyer->id,
        'source' => 'client_invite',
        'status' => 'negotiating',
        'sent_at' => now(),
    ]);
    $negotiation = Negotiation::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyer->id,
        'distribution_id' => $distribution->id,
        'source' => 'client_invite',
        'status' => Negotiation::STATUS_PROPOSAL_SUBMITTED,
        'opened_at' => now(),
    ]);
    $proposal = LawyerProposal::query()->create([
        'legal_request_id' => $legalRequest->id,
        'negotiation_id' => $negotiation->id,
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyer->id,
        'service_scope' => 'Final scope',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
        'source' => 'matched',
        'status' => 'submitted',
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    return compact('client', 'legalRequest', 'lawyer', 'proposal');
}

test('legacy final selection endpoint delegates to canonical final proposal selection', function () {
    $fixture = legacyFinalSelectionFixture();
    Sanctum::actingAs($fixture['client']);

    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection", [
        'proposal_public_id' => $fixture['proposal']->public_id,
    ])
        ->assertCreated()
        ->assertJsonPath('proposal.status', 'selected')
        ->assertJsonPath('engagement.status', 'pending_contract')
        ->assertJsonPath('deprecated', true);

    $this->assertDatabaseCount('engagements', 1);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('legacy final selection endpoint is idempotent for the same winner', function () {
    $fixture = legacyFinalSelectionFixture();
    Sanctum::actingAs($fixture['client']);

    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection", [
        'proposal_public_id' => $fixture['proposal']->public_id,
    ])->assertCreated();

    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection", [
        'proposal_public_id' => $fixture['proposal']->public_id,
    ])
        ->assertOk()
        ->assertJsonPath('proposal.status', 'selected')
        ->assertJsonPath('engagement.status', 'pending_contract');

    $this->assertDatabaseCount('engagements', 1);
});

test('only the legal request owner can use legacy final selection', function () {
    $fixture = legacyFinalSelectionFixture();
    Sanctum::actingAs(User::factory()->create());

    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection", [
        'proposal_public_id' => $fixture['proposal']->public_id,
    ])->assertForbidden();

    $this->assertDatabaseCount('engagements', 0);
});
