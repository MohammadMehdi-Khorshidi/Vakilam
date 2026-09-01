<?php

use App\Models\City;
use App\Models\LawyerProfile;
use App\Models\LawyerProposal;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Negotiation;
use App\Models\Province;
use App\Models\User;
use Carbon\Carbon;
use Laravel\Sanctum\Sanctum;

function finalProposalFixture(string $source = Negotiation::SOURCE_CLIENT_INVITE): array
{
    $client = User::factory()->create();
    $category = LegalCategory::query()->create([
        'code' => 'proposal-flow-'.str()->random(8),
        'name' => 'Family',
        'status' => true,
    ]);
    $province = Province::query()->create(['name' => 'Tehran '.str()->random(4)]);
    $city = City::query()->create(['province_id' => $province->id, 'name' => 'Tehran']);
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Submitted lawyer request',
        'description' => 'Negotiation proposal flow.',
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
        'full_name' => 'Negotiating Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyer->id,
        'source' => $source,
        'status' => 'negotiating',
        'sent_at' => now(),
        'responded_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    $negotiation = Negotiation::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyer->id,
        'distribution_id' => $distribution->id,
        'source' => $source,
        'status' => Negotiation::STATUS_ACTIVE,
        'opened_at' => now(),
    ]);

    return compact('client', 'legalRequest', 'lawyerUser', 'lawyer', 'distribution', 'negotiation');
}

function createSubmittedFinalProposal(array $fixture): LawyerProposal
{
    $proposal = LawyerProposal::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'negotiation_id' => $fixture['negotiation']->id,
        'distribution_id' => $fixture['distribution']->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'source' => $fixture['negotiation']->source === Negotiation::SOURCE_LAWYER_INTEREST ? 'open' : 'matched',
        'summary' => 'Final negotiated terms.',
        'service_scope' => 'Representation through the agreed phase.',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
        'status' => LawyerProposal::STATUS_SUBMITTED,
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    $fixture['negotiation']->forceFill(['status' => Negotiation::STATUS_PROPOSAL_SUBMITTED])->save();

    return $proposal;
}

test('lawyer creates a final proposal draft only from an active negotiation', function () {
    $fixture = finalProposalFixture();
    Sanctum::actingAs($fixture['lawyerUser']);

    $this->postJson("/api/negotiations/{$fixture['negotiation']->public_id}/proposal", [
        'summary' => 'Final offer',
        'service_scope' => 'Court representation',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
    ])
        ->assertCreated()
        ->assertJsonPath('proposal.status', 'draft')
        ->assertJsonPath('proposal.negotiation_id', $fixture['negotiation']->id)
        ->assertJsonPath('proposal.legal_request_id', $fixture['legalRequest']->id);

    $this->assertDatabaseCount('engagements', 0);
});

test('legacy distribution proposal endpoint also requires an active negotiation', function () {
    $fixture = finalProposalFixture();
    $fixture['negotiation']->delete();
    Sanctum::actingAs($fixture['lawyerUser']);

    $this->postJson("/api/lawyer/distributions/{$fixture['distribution']->id}/proposal", [
        'service_scope' => 'Representation',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
    ])->assertStatus(409);

    $this->assertDatabaseCount('lawyer_proposals', 0);
});

test('final proposal submission requires scope fee duration and starts independent 72 hour validity', function () {
    Carbon::setTestNow('2026-08-29 11:00:00');
    $fixture = finalProposalFixture();
    $proposal = LawyerProposal::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'negotiation_id' => $fixture['negotiation']->id,
        'distribution_id' => $fixture['distribution']->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'status' => 'draft',
        'source' => 'matched',
    ]);

    Sanctum::actingAs($fixture['lawyerUser']);
    $this->postJson("/api/lawyer/proposals/{$proposal->public_id}/submit")
        ->assertStatus(422);

    $proposal->forceFill([
        'summary' => 'Final explanation',
        'service_scope' => 'Representation',
        'proposed_fee_rial' => 80_000_000,
        'estimated_days' => 45,
    ])->save();

    $this->postJson("/api/lawyer/proposals/{$proposal->public_id}/submit")
        ->assertOk()
        ->assertJsonPath('proposal.status', 'submitted');

    $proposal->refresh();
    expect($proposal->submitted_at->equalTo(now()))->toBeTrue();
    expect($proposal->expires_at->equalTo(now()->addHours(72)))->toBeTrue();
    expect($fixture['negotiation']->fresh()->status)->toBe(Negotiation::STATUS_PROPOSAL_SUBMITTED);
});

test('client sees submitted final proposals but not drafts', function () {
    $fixture = finalProposalFixture();
    $submitted = createSubmittedFinalProposal($fixture);

    $second = finalProposalFixture();
    // Move a draft from another lawyer onto the same legal request for visibility testing.
    $second['distribution']->forceFill(['legal_request_id' => $fixture['legalRequest']->id])->save();
    $second['negotiation']->forceFill(['legal_request_id' => $fixture['legalRequest']->id])->save();
    LawyerProposal::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'negotiation_id' => $second['negotiation']->id,
        'distribution_id' => $second['distribution']->id,
        'lawyer_profile_id' => $second['lawyer']->id,
        'status' => 'draft',
        'source' => 'matched',
    ]);

    Sanctum::actingAs($fixture['client']);
    $this->getJson("/api/legal-requests/{$fixture['legalRequest']->id}/proposals")
        ->assertOk()
        ->assertJsonCount(1, 'proposals')
        ->assertJsonPath('proposals.0.public_id', $submitted->public_id);
});

test('client selection of final proposal creates one engagement and cancels competitors', function () {
    Carbon::setTestNow('2026-08-29 12:00:00');
    $fixture = finalProposalFixture();
    $winner = createSubmittedFinalProposal($fixture);

    $otherUser = User::factory()->create();
    $otherLawyer = LawyerProfile::query()->create([
        'user_id' => $otherUser->id,
        'full_name' => 'Competitor',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);
    $otherDistribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'lawyer_profile_id' => $otherLawyer->id,
        'source' => 'client_invite',
        'status' => 'negotiating',
        'sent_at' => now(),
    ]);
    $otherNegotiation = Negotiation::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'lawyer_profile_id' => $otherLawyer->id,
        'distribution_id' => $otherDistribution->id,
        'source' => 'client_invite',
        'status' => Negotiation::STATUS_PROPOSAL_SUBMITTED,
        'opened_at' => now(),
    ]);
    $loser = LawyerProposal::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'negotiation_id' => $otherNegotiation->id,
        'distribution_id' => $otherDistribution->id,
        'lawyer_profile_id' => $otherLawyer->id,
        'service_scope' => 'Other scope',
        'proposed_fee_rial' => 60_000_000,
        'estimated_days' => 35,
        'status' => 'submitted',
        'source' => 'matched',
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/proposals/{$winner->public_id}/select")
        ->assertCreated()
        ->assertJsonPath('proposal.status', 'selected')
        ->assertJsonPath('engagement.status', 'pending_contract');

    $engagement = $fixture['legalRequest']->engagement()->firstOrFail();
    expect($engagement->contract_due_at->equalTo(now()->addHours(48)))->toBeTrue();
    expect($fixture['negotiation']->fresh()->status)->toBe(Negotiation::STATUS_WON);
    expect($otherNegotiation->fresh()->status)->toBe(Negotiation::STATUS_CANCELLED);
    expect($loser->fresh()->status)->toBe(LawyerProposal::STATUS_CANCELLED);
    expect($otherDistribution->fresh()->status)->toBe('cancelled');
    $this->assertDatabaseCount('engagements', 1);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('expired final proposal cannot be selected', function () {
    $fixture = finalProposalFixture();
    $proposal = createSubmittedFinalProposal($fixture);
    $proposal->forceFill(['expires_at' => now()->subMinute()])->save();

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/proposals/{$proposal->public_id}/select")
        ->assertStatus(409);

    $this->assertDatabaseCount('engagements', 0);
});

test('open interest negotiation produces an open source final proposal', function () {
    $fixture = finalProposalFixture(Negotiation::SOURCE_LAWYER_INTEREST);
    Sanctum::actingAs($fixture['lawyerUser']);

    $this->postJson("/api/negotiations/{$fixture['negotiation']->public_id}/proposal", [
        'service_scope' => 'Representation',
        'proposed_fee_rial' => 40_000_000,
        'estimated_days' => 25,
    ])->assertCreated()->assertJsonPath('proposal.source', 'open');
});

test('another lawyer cannot create update submit or withdraw another lawyersAdmin final proposal', function () {
    $fixture = finalProposalFixture();
    $other = finalProposalFixture();

    Sanctum::actingAs($other['lawyerUser']);

    $this->postJson("/api/negotiations/{$fixture['negotiation']->public_id}/proposal", [
        'summary' => 'Unauthorized proposal',
        'service_scope' => 'Representation',
        'proposed_fee_rial' => 10_000_000,
        'estimated_days' => 10,
    ])->assertForbidden();

    $proposal = LawyerProposal::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'negotiation_id' => $fixture['negotiation']->id,
        'distribution_id' => $fixture['distribution']->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'source' => LawyerProposal::SOURCE_MATCHED,
        'summary' => 'Final terms',
        'service_scope' => 'Representation',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
        'status' => LawyerProposal::STATUS_DRAFT,
    ]);

    $this->patchJson("/api/lawyer/proposals/{$proposal->public_id}", [
        'summary' => 'Unauthorized update',
    ])->assertForbidden();

    $this->postJson("/api/lawyer/proposals/{$proposal->public_id}/submit")
        ->assertForbidden();

    $proposal->forceFill([
        'status' => LawyerProposal::STATUS_SUBMITTED,
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ])->save();

    $this->postJson("/api/lawyer/proposals/{$proposal->public_id}/withdraw")
        ->assertForbidden();
});

test('an unapproved lawyer cannot create a final proposal', function () {
    $fixture = finalProposalFixture();

    $fixture['lawyer']->forceFill([
        'verification_status' => 'pending',
    ])->save();

    Sanctum::actingAs($fixture['lawyerUser']);

    $this->postJson("/api/negotiations/{$fixture['negotiation']->public_id}/proposal", [
        'summary' => 'Final offer',
        'service_scope' => 'Representation',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
    ])->assertForbidden();

    $this->assertDatabaseCount('lawyer_proposals', 0);
});

test('an inactive lawyer cannot create a final proposal', function () {
    $fixture = finalProposalFixture();

    $fixture['lawyerUser']->forceFill([
        'status' => 'suspended',
    ])->save();

    Sanctum::actingAs($fixture['lawyerUser']);

    $this->postJson("/api/negotiations/{$fixture['negotiation']->public_id}/proposal", [
        'summary' => 'Final offer',
        'service_scope' => 'Representation',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
    ])->assertForbidden();

    $this->assertDatabaseCount('lawyer_proposals', 0);
});

test('a submitted final proposal cannot be updated or submitted again', function () {
    $fixture = finalProposalFixture();
    $proposal = createSubmittedFinalProposal($fixture);

    Sanctum::actingAs($fixture['lawyerUser']);

    $this->patchJson("/api/lawyer/proposals/{$proposal->public_id}", [
        'summary' => 'Changed after submission',
    ])->assertStatus(409);

    $this->postJson("/api/lawyer/proposals/{$proposal->public_id}/submit")
        ->assertStatus(409);
});

test('final proposal values cannot be negative or have zero duration', function () {
    $fixture = finalProposalFixture();

    Sanctum::actingAs($fixture['lawyerUser']);

    $this->postJson("/api/negotiations/{$fixture['negotiation']->public_id}/proposal", [
        'service_scope' => 'Representation',
        'proposed_fee_rial' => -1,
        'estimated_days' => 0,
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors([
            'proposed_fee_rial',
            'estimated_days',
        ]);

    $this->assertDatabaseCount('lawyer_proposals', 0);
});

test('another client cannot select a final proposal', function () {
    $fixture = finalProposalFixture();
    $proposal = createSubmittedFinalProposal($fixture);
    $otherClient = User::factory()->create();

    Sanctum::actingAs($otherClient);

    $this->postJson(
        "/api/legal-requests/{$fixture['legalRequest']->id}/proposals/{$proposal->public_id}/select"
    )->assertForbidden();

    $this->assertDatabaseCount('engagements', 0);
});

test('selecting the same final proposal again is idempotent', function () {
    $fixture = finalProposalFixture();
    $proposal = createSubmittedFinalProposal($fixture);

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legalRequest']->id}/proposals/{$proposal->public_id}/select"
    )->assertCreated();

    $this->postJson(
        "/api/legal-requests/{$fixture['legalRequest']->id}/proposals/{$proposal->public_id}/select"
    )
        ->assertOk()
        ->assertJsonPath('proposal.status', LawyerProposal::STATUS_ACCEPTED);

    $this->assertDatabaseCount('engagements', 1);
});

test('withdrawn and cancelled final proposals cannot be selected', function () {
    $withdrawnFixture = finalProposalFixture();
    $withdrawnProposal = createSubmittedFinalProposal($withdrawnFixture);

    $withdrawnProposal->forceFill([
        'status' => LawyerProposal::STATUS_WITHDRAWN,
    ])->save();

    Sanctum::actingAs($withdrawnFixture['client']);

    $this->postJson(
        "/api/legal-requests/{$withdrawnFixture['legalRequest']->id}/proposals/{$withdrawnProposal->public_id}/select"
    )->assertStatus(409);

    $cancelledFixture = finalProposalFixture();
    $cancelledProposal = createSubmittedFinalProposal($cancelledFixture);

    $cancelledProposal->forceFill([
        'status' => LawyerProposal::STATUS_CANCELLED,
    ])->save();

    Sanctum::actingAs($cancelledFixture['client']);

    $this->postJson(
        "/api/legal-requests/{$cancelledFixture['legalRequest']->id}/proposals/{$cancelledProposal->public_id}/select"
    )->assertStatus(409);

    $this->assertDatabaseCount('engagements', 0);
});

test('expired submitted final proposals are expired by the scheduler and close their negotiation', function () {
    Carbon::setTestNow('2026-08-29 15:00:00');

    $fixture = finalProposalFixture();
    $proposal = createSubmittedFinalProposal($fixture);

    $proposal->forceFill([
        'expires_at' => now()->subMinute(),
    ])->save();

    expect($fixture['negotiation']->fresh()->status)
        ->toBe(Negotiation::STATUS_PROPOSAL_SUBMITTED);

    expect($fixture['distribution']->fresh()->status)
        ->toBe('negotiating');

    $this->artisan('schedule:run')
        ->assertExitCode(0);

    expect($proposal->fresh()->status)
        ->toBe(LawyerProposal::STATUS_EXPIRED);

    expect($fixture['negotiation']->fresh()->status)
        ->toBe(Negotiation::STATUS_CLOSED);

    expect($fixture['negotiation']->fresh()->closed_at)
        ->not->toBeNull();

    expect($fixture['distribution']->fresh()->status)
        ->toBe('expired');

    $this->assertDatabaseCount('engagements', 0);
});
