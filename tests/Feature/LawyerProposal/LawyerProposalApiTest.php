<?php

use App\Models\City;
use App\Models\LawyerProfile;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Province;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('an approved lawyer can create a proposal draft for their distribution', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family-proposal-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted legal request for proposal testing.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/proposal",
        [
            'summary' => 'I can handle this legal matter.',
            'proposed_fee_rial' => 50_000_000,
            'estimated_days' => 30,
        ],
    )
        ->assertCreated()
        ->assertJsonPath('proposal.status', 'draft')
        ->assertJsonPath('proposal.distribution_id', $distribution->id)
        ->assertJsonPath('proposal.lawyer_profile_id', $lawyerProfile->id);

    $this->assertDatabaseHas('lawyer_proposals', [
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'draft',
    ]);

    $this->assertDatabaseCount('legal_matters', 0);
});

test('a lawyer cannot create a proposal for another lawyers distribution', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family-proposal-ownership-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted legal request for proposal authorization testing.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $ownerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $ownerProfile = LawyerProfile::query()->create([
        'user_id' => $ownerUser->id,
        'full_name' => $ownerUser->name.' '.$ownerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $otherLawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    LawyerProfile::query()->create([
        'user_id' => $otherLawyerUser->id,
        'full_name' => $otherLawyerUser->name.' '.$otherLawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $ownerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    Sanctum::actingAs($otherLawyerUser);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/proposal",
        [
            'summary' => 'Unauthorized proposal.',
            'proposed_fee_rial' => 50_000_000,
            'estimated_days' => 30,
        ],
    )
        ->assertForbidden();

    $this->assertDatabaseCount('lawyer_proposals', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('a lawyer can update their own proposal while it is still a draft', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family-proposal-update-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted legal request for proposal update testing.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = \App\Models\LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Initial proposal.',
        'proposed_fee_rial' => 40_000_000,
        'estimated_days' => 20,
        'status' => 'draft',
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->patchJson(
        "/api/lawyer/proposals/{$proposal->id}",
        [
            'summary' => 'Updated proposal.',
            'proposed_fee_rial' => 55_000_000,
            'estimated_days' => 25,
        ],
    )
        ->assertOk()
        ->assertJsonPath('proposal.status', 'draft')
        ->assertJsonPath('proposal.summary', 'Updated proposal.')
        ->assertJsonPath('proposal.proposed_fee_rial', 55_000_000)
        ->assertJsonPath('proposal.estimated_days', 25);

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'status' => 'draft',
        'summary' => 'Updated proposal.',
        'proposed_fee_rial' => 55_000_000,
        'estimated_days' => 25,
    ]);

    $this->assertDatabaseCount('legal_matters', 0);
});

test('a lawyer can submit their own proposal draft without creating a matter or engagement', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family-proposal-submit-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted legal request for proposal submission testing.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = \App\Models\LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Ready to submit.',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
        'status' => 'draft',
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/submit"
    )
        ->assertOk()
        ->assertJsonPath('proposal.status', 'submitted');

    $proposal->refresh();

    expect($proposal->submitted_at)->not->toBeNull();

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'status' => 'submitted',
    ]);

    $this->assertDatabaseCount('engagements', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('a submitted proposal cannot be updated', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family-proposal-locked-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = \App\Models\LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Submitted proposal.',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->patchJson(
        "/api/lawyer/proposals/{$proposal->id}",
        [
            'summary' => 'This change must not be accepted.',
        ],
    )
        ->assertStatus(409);

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'summary' => 'Submitted proposal.',
        'status' => 'submitted',
    ]);
});

test('a submitted proposal cannot be submitted again', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family-proposal-resubmit-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $submittedAt = now();

    $proposal = \App\Models\LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Already submitted proposal.',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
        'status' => 'submitted',
        'submitted_at' => $submittedAt,
    ]);

    $proposal->refresh();
    $originalSubmittedAt = $proposal->submitted_at?->copy();

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/submit"
    )
        ->assertStatus(409);

    $proposal->refresh();

    expect($proposal->status)->toBe('submitted');
    expect($proposal->submitted_at?->equalTo($originalSubmittedAt))->toBeTrue();

    $this->assertDatabaseCount('engagements', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('a second proposal cannot be created for the same distribution', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family-proposal-duplicate-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/proposal",
        [
            'summary' => 'First proposal.',
            'proposed_fee_rial' => 50_000_000,
            'estimated_days' => 30,
        ],
    )->assertCreated();

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/proposal",
        [
            'summary' => 'Second proposal.',
            'proposed_fee_rial' => 60_000_000,
            'estimated_days' => 40,
        ],
    )->assertStatus(409);

    $this->assertDatabaseCount('lawyer_proposals', 1);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('a proposal cannot be created for a draft legal request', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family-proposal-draft-request-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A draft legal request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'draft',
    ]);

    $lawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/proposal",
        [
            'summary' => 'This proposal must not be created.',
            'proposed_fee_rial' => 50_000_000,
            'estimated_days' => 30,
        ],
    )
        ->assertStatus(409);

    $this->assertDatabaseCount('lawyer_proposals', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('an unapproved lawyer cannot create a proposal', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family-proposal-unapproved-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted legal request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'pending',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/proposal",
        [
            'summary' => 'This proposal must not be created.',
            'proposed_fee_rial' => 50_000_000,
            'estimated_days' => 30,
        ],
    )
        ->assertForbidden();

    $this->assertDatabaseCount('lawyer_proposals', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('an inactive lawyer cannot create a proposal', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-inactive-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create(['name' => 'Tehran']);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create([
        'status' => 'suspended',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/proposal"
    )->assertForbidden();

    $this->assertDatabaseCount('lawyer_proposals', 0);
});


test('another lawyer cannot update a proposal', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-update-owner-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create(['name' => 'Tehran']);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $ownerUser = User::factory()->create(['status' => 'active']);

    $ownerProfile = LawyerProfile::query()->create([
        'user_id' => $ownerUser->id,
        'full_name' => $ownerUser->name.' '.$ownerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $otherUser = User::factory()->create(['status' => 'active']);

    LawyerProfile::query()->create([
        'user_id' => $otherUser->id,
        'full_name' => $otherUser->name.' '.$otherUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $ownerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = \App\Models\LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $ownerProfile->id,
        'summary' => 'Original proposal.',
        'status' => 'draft',
    ]);

    Sanctum::actingAs($otherUser);

    $this->patchJson(
        "/api/lawyer/proposals/{$proposal->id}",
        ['summary' => 'Unauthorized change.'],
    )->assertForbidden();

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'summary' => 'Original proposal.',
        'status' => 'draft',
    ]);
});


test('another lawyer cannot submit a proposal', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-submit-owner-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create(['name' => 'Tehran']);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $ownerUser = User::factory()->create(['status' => 'active']);

    $ownerProfile = LawyerProfile::query()->create([
        'user_id' => $ownerUser->id,
        'full_name' => $ownerUser->name.' '.$ownerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $otherUser = User::factory()->create(['status' => 'active']);

    LawyerProfile::query()->create([
        'user_id' => $otherUser->id,
        'full_name' => $otherUser->name.' '.$otherUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $ownerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = \App\Models\LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $ownerProfile->id,
        'summary' => 'Draft proposal.',
        'status' => 'draft',
    ]);

    Sanctum::actingAs($otherUser);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/submit"
    )->assertForbidden();

    $proposal->refresh();

    expect($proposal->status)->toBe('draft');
    expect($proposal->submitted_at)->toBeNull();
});


test('a proposal cannot be submitted when its legal request is no longer submitted', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-request-state-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create(['name' => 'Tehran']);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create(['status' => 'active']);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = \App\Models\LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Draft proposal.',
        'status' => 'draft',
    ]);

    $legalRequest->forceFill([
        'status' => 'cancelled',
        'cancelled_at' => now(),
    ])->save();

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/submit"
    )->assertStatus(409);

    $proposal->refresh();

    expect($proposal->status)->toBe('draft');
    expect($proposal->submitted_at)->toBeNull();

    $this->assertDatabaseCount('engagements', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});


test('proposal monetary and duration values cannot be negative', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-validation-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create(['name' => 'Tehran']);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create(['status' => 'active']);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/proposal",
        [
            'proposed_fee_rial' => -1,
            'estimated_days' => -1,
        ],
    )
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'proposed_fee_rial',
            'estimated_days',
        ]);

    $this->assertDatabaseCount('lawyer_proposals', 0);
});
