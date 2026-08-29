<?php

use App\Models\AuditLog;
use App\Models\City;
use App\Models\LawyerProfile;
use App\Models\LawyerProposal;
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
        'legal_request_id' => $legalRequest->id,
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

    $proposal = LawyerProposal::query()->create([
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

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'draft',
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/submit"
    )
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'summary',
            'proposed_fee_rial',
            'estimated_days',
        ]);

    expect($proposal->fresh()->status)->toBe('draft');

    $proposal->forceFill([
        'summary' => 'Ready to submit.',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
    ])->save();

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

    $proposal->refresh();

    $this->assertNotNull($proposal->submitted_at);
    $this->assertTrue(
        $proposal->expires_at->equalTo(
            $proposal->submitted_at->copy()->addHours(72)
        )
    );
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

    $proposal = LawyerProposal::query()->create([
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

    $proposal = LawyerProposal::query()->create([
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

    $proposal = LawyerProposal::query()->create([
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

    $proposal = LawyerProposal::query()->create([
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

    $proposal = LawyerProposal::query()->create([
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

test('a client can view submitted proposals for their own legal request while lawyer drafts stay hidden', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-client-view-test',
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
        'description' => 'Submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $submittedLawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $submittedLawyerProfile = LawyerProfile::query()->create([
        'user_id' => $submittedLawyerUser->id,
        'full_name' => 'Submitted Proposal Lawyer',
        'verification_status' => 'approved',
        'average_rating' => 4.5,
        'rating_count' => 12,
        'is_available' => true,
    ]);

    $submittedDistribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $submittedLawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $submittedProposal = LawyerProposal::query()->create([
        'distribution_id' => $submittedDistribution->id,
        'lawyer_profile_id' => $submittedLawyerProfile->id,
        'summary' => 'Visible submitted proposal.',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $draftLawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $draftLawyerProfile = LawyerProfile::query()->create([
        'user_id' => $draftLawyerUser->id,
        'full_name' => 'Draft Proposal Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $draftDistribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $draftLawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $draftProposal = LawyerProposal::query()->create([
        'distribution_id' => $draftDistribution->id,
        'lawyer_profile_id' => $draftLawyerProfile->id,
        'summary' => 'Hidden draft proposal.',
        'status' => 'draft',
    ]);

    Sanctum::actingAs($client);

    $response = $this->getJson(
        "/api/legal-requests/{$legalRequest->id}/proposals"
    )
        ->assertOk()
        ->assertJsonCount(1, 'proposals')
        ->assertJsonPath('proposals.0.id', $submittedProposal->id)
        ->assertJsonPath('proposals.0.status', 'submitted')
        ->assertJsonPath('proposals.0.summary', 'Visible submitted proposal.')
        ->assertJsonPath('proposals.0.lawyer.public_id', $submittedLawyerProfile->public_id)
        ->assertJsonPath('proposals.0.lawyer.full_name', 'Submitted Proposal Lawyer');

    expect(
        collect($response->json('proposals'))->pluck('id')
    )->not->toContain($draftProposal->id);
});

test('a client cannot view proposals for another clients legal request', function () {
    $owner = User::factory()->create();
    $otherClient = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-client-ownership-test',
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
        'client_user_id' => $owner->id,
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
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => 'Proposal Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Private submitted proposal.',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    Sanctum::actingAs($otherClient);

    $this->getJson(
        "/api/legal-requests/{$legalRequest->id}/proposals"
    )->assertForbidden();
});

test('proposal viewing requires authentication', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-view-auth-test',
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
        'description' => 'Submitted request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $this->getJson(
        "/api/legal-requests/{$legalRequest->id}/proposals"
    )->assertUnauthorized();
});

test('a lawyer can withdraw their own submitted proposal without creating an engagement or matter', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-withdraw-test',
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
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => 'Withdraw Proposal Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Submitted proposal.',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/withdraw"
    )
        ->assertOk()
        ->assertJsonPath('proposal.status', 'withdrawn');

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'status' => 'withdrawn',
    ]);

    $this->assertDatabaseCount('engagements', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('another lawyer cannot withdraw a proposal', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-withdraw-owner-test',
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
        'full_name' => 'Proposal Owner',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $otherUser = User::factory()->create(['status' => 'active']);

    LawyerProfile::query()->create([
        'user_id' => $otherUser->id,
        'full_name' => 'Other Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $ownerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $ownerProfile->id,
        'summary' => 'Submitted proposal.',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    Sanctum::actingAs($otherUser);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/withdraw"
    )->assertForbidden();

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'status' => 'submitted',
    ]);
});

test('a draft proposal cannot be withdrawn', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-withdraw-draft-test',
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
        'full_name' => 'Draft Proposal Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Draft proposal.',
        'status' => 'draft',
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/withdraw"
    )->assertStatus(409);

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'status' => 'draft',
    ]);
});

test('a withdrawn proposal cannot be withdrawn again', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-rewithdraw-test',
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
        'full_name' => 'Withdrawn Proposal Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Already withdrawn proposal.',
        'status' => 'withdrawn',
        'submitted_at' => now(),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/withdraw"
    )->assertStatus(409);

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'status' => 'withdrawn',
    ]);

    $this->assertDatabaseCount('engagements', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('expired submitted proposals are marked as expired by the scheduler', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-expiry-test',
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
        'status' => 'active',
    ]);

    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => 'Expiry Test Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Expired proposal.',
        'status' => 'submitted',
        'submitted_at' => now()->subHours(73),
        'expires_at' => now()->subHour(),
    ]);

    $this->artisan('schedule:run')
        ->assertExitCode(0);

    $proposal->refresh();

    expect($proposal->status)->toBe('expired');

    $this->assertDatabaseCount('engagements', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('a client can select an active submitted proposal and create one pending contract engagement', function () {
    $client = User::factory()->create([
        'status' => 'active',
    ]);

    $category = LegalCategory::query()->create([
        'code' => 'proposal-select-test',
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
        'description' => 'Submitted lawyer-selection request.',
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
        'full_name' => 'Selected Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Selectable proposal.',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
        'status' => 'submitted',
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    /*
     * Another lawyer has an open direct collaboration request.
     * Selecting the proposal above must close this competing request.
     */
    $directLawyerUser = User::factory()->create([
        'status' => 'active',
    ]);

    $directLawyerProfile = LawyerProfile::query()->create([
        'user_id' => $directLawyerUser->id,
        'full_name' => 'Direct Request Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $directDistribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $directLawyerProfile->id,
        'status' => 'pending',
        'sent_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    $competingLawyerUser = User::factory()->create(['status' => 'active']);
    $competingLawyerProfile = LawyerProfile::query()->create([
        'user_id' => $competingLawyerUser->id,
        'full_name' => 'Competing Proposal Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);
    $competingDistribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $competingLawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);
    $competingProposal = LawyerProposal::query()->create([
        'legal_request_id' => $legalRequest->id,
        'distribution_id' => $competingDistribution->id,
        'lawyer_profile_id' => $competingLawyerProfile->id,
        'summary' => 'Competing submitted proposal.',
        'proposed_fee_rial' => 45_000_000,
        'estimated_days' => 35,
        'status' => 'submitted',
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    Sanctum::actingAs($client);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/select"
    )
        ->assertCreated()
        ->assertJsonPath('proposal.status', 'selected')
        ->assertJsonPath('engagement.status', 'pending_contract')
        ->assertJsonPath('engagement.proposal_id', $proposal->id)
        ->assertJsonPath('engagement.client_user_id', $client->id)
        ->assertJsonPath('engagement.lawyer_profile_id', $lawyerProfile->id);

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'status' => 'selected',
    ]);

    $this->assertDatabaseHas('engagements', [
        'legal_request_id' => $legalRequest->id,
        'proposal_id' => $proposal->id,
        'client_user_id' => $client->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'pending_contract',
    ]);

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $directDistribution->id,
        'status' => 'cancelled',
    ]);

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $competingProposal->id,
        'status' => 'rejected',
    ]);

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $competingDistribution->id,
        'status' => 'cancelled',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'actor_user_id' => $client->id,
        'action' => 'lawyer_proposal.selected',
        'target_id' => $proposal->id,
    ]);

    $this->assertDatabaseCount('engagements', 1);

    // Lawyer selection itself must not form a LegalMatter.
    $this->assertDatabaseCount('legal_matters', 0);
});

test('selecting the same proposal again is idempotent and does not create another engagement', function () {
    $client = User::factory()->create([
        'status' => 'active',
    ]);

    $category = LegalCategory::query()->create([
        'code' => 'proposal-select-idempotent-test',
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
        'full_name' => 'Idempotent Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'summary' => 'Selectable proposal.',
        'status' => 'submitted',
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    Sanctum::actingAs($client);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/select"
    )->assertCreated();

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/select"
    )
        ->assertOk()
        ->assertJsonPath('proposal.status', 'selected')
        ->assertJsonPath('engagement.status', 'pending_contract');

    $this->assertDatabaseCount('engagements', 1);

    $this->assertDatabaseCount('legal_matters', 0);

    expect(
        AuditLog::query()
            ->where('action', 'lawyer_proposal.selected')
            ->where('target_id', $proposal->id)
            ->count()
    )->toBe(1);
});

test('a client cannot select another clients proposal', function () {
    $owner = User::factory()->create([
        'status' => 'active',
    ]);

    $otherClient = User::factory()->create([
        'status' => 'active',
    ]);

    $category = LegalCategory::query()->create([
        'code' => 'proposal-select-owner-test',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create(['name' => 'Tehran']);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $owner->id,
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
        'full_name' => 'Protected Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'submitted',
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    Sanctum::actingAs($otherClient);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/select"
    )->assertForbidden();

    $this->assertDatabaseCount('engagements', 0);

    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $proposal->id,
        'status' => 'submitted',
    ]);
});

test('an expired proposal cannot be selected', function () {
    $client = User::factory()->create([
        'status' => 'active',
    ]);

    $category = LegalCategory::query()->create([
        'code' => 'proposal-select-expired-test',
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
        'full_name' => 'Expired Proposal Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'submitted',
        'submitted_at' => now()->subHours(73),
        'expires_at' => now()->subHour(),
    ]);

    Sanctum::actingAs($client);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/select"
    )->assertStatus(409);

    $this->assertDatabaseCount('engagements', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('a withdrawn proposal cannot be selected', function () {
    $client = User::factory()->create([
        'status' => 'active',
    ]);

    $category = LegalCategory::query()->create([
        'code' => 'proposal-select-withdrawn-test',
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
        'full_name' => 'Withdrawn Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'withdrawn',
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    Sanctum::actingAs($client);

    $this->postJson(
        "/api/lawyer/proposals/{$proposal->id}/select"
    )->assertStatus(409);

    $this->assertDatabaseCount('engagements', 0);
});

test('a lawyer cannot create a proposal for a pending direct collaboration request', function () {
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'proposal-pending-direct-request-test',
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
        'description' => 'Submitted direct lawyer-selection request.',
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
        'full_name' => 'Direct Request Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'pending',
        'sent_at' => now(),
        'expires_at' => now()->addHours(72),
    ]);

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/proposal",
        [
            'summary' => 'This must not become a proposal.',
            'proposed_fee_rial' => 50_000_000,
            'estimated_days' => 30,
        ],
    )
        ->assertStatus(409)
        ->assertJsonPath(
            'message',
            'A proposal cannot be created for this distribution.',
        );

    $this->assertDatabaseCount('lawyer_proposals', 0);

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $distribution->id,
        'status' => 'pending',
    ]);
});
