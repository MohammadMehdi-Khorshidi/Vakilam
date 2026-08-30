<?php

use App\Models\City;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\Province;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Laravel\Sanctum\Sanctum;

function legalRequestTestUser(string $roleCode = 'client'): User
{
    $user = User::factory()->create();

    $role = Role::query()->firstOrCreate(
        ['code' => $roleCode],
        ['name' => $roleCode === 'lawyer' ? 'وکیل' : 'موکل'],
    );

    UserRole::query()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
        'granted_at' => now(),
    ]);

    return $user;
}

test('legal request creation requires authentication and an active client role', function () {
    $payload = ['description' => 'A contract payment has not been made.'];

    $this->postJson('/api/legal-requests', $payload)
        ->assertUnauthorized();

    Sanctum::actingAs(legalRequestTestUser('lawyer'));

    $this->postJson('/api/legal-requests', $payload)
        ->assertForbidden();
});

test('a client can create a draft legal request with its parties', function () {
    $client = legalRequestTestUser();

    $category = LegalCategory::query()->create([
        'code' => 'civil',
        'name' => 'Civil',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'name' => 'Tehran',
        'province_id' => $province->id,
    ]);

    Sanctum::actingAs($client);

    $response = $this->postJson('/api/legal-requests', [
        'title' => 'Contract payment claim',
        'description' => 'The other party has not paid the agreed amount.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'parties' => [
            [
                'party_role' => 'plaintiff',
                'full_name' => 'Client Person',
                'relation_note' => 'The requesting client',
                'is_client' => true,
            ],
            [
                'party_role' => 'defendant',
                'full_name' => 'Other Party',
                'is_client' => false,
            ],
        ],
    ])
        ->assertCreated()
        ->assertJsonPath('message', 'Legal request created successfully.')
        ->assertJsonPath('legal_request.client_user_id', $client->id)
        ->assertJsonPath('legal_request.status', 'draft')
        ->assertJsonPath('legal_request.service_intent', 'lawyer_selection')
        ->assertJsonCount(2, 'legal_request.parties');

    $legalRequestId = $response->json('legal_request.id');

    expect($legalRequestId)->toBeString()
        ->and($response->json('legal_request.public_id'))->toBeString();

    $this->assertDatabaseHas('legal_requests', [
        'id' => $legalRequestId,
        'client_user_id' => $client->id,
        'status' => 'draft',
    ]);

    $this->assertDatabaseHas('legal_request_parties', [
        'legal_request_id' => $legalRequestId,
        'party_role' => 'plaintiff',
        'is_client' => true,
    ]);
});

test('creation validates enums active references city ownership and client party uniqueness', function () {
    $client = legalRequestTestUser();

    $inactiveCategory = LegalCategory::query()->create([
        'code' => 'inactive',
        'name' => 'Inactive',
        'status' => false,
    ]);

    $firstProvince = Province::query()->create([
        'name' => 'First',
    ]);

    $secondProvince = Province::query()->create([
        'name' => 'Second',
    ]);

    $city = City::query()->create([
        'name' => 'Second City',
        'province_id' => $secondProvince->id,
    ]);

    Sanctum::actingAs($client);

    $this->postJson('/api/legal-requests', [
        'description' => 'Invalid request references.',
        'legal_category_id' => $inactiveCategory->id,
        'province_id' => $firstProvince->id,
        'city_id' => $city->id,
        'urgency' => 'immediate',
        'service_intent' => 'unknown',
        'parties' => [
            [
                'party_role' => 'plaintiff',
                'is_client' => true,
            ],
            [
                'party_role' => 'witness',
                'is_client' => true,
            ],
        ],
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'legal_category_id',
            'city_id',
            'urgency',
            'service_intent',
            'parties',
        ]);
});

test('only the owner can submit a draft legal request and it cannot be submitted twice', function () {
    $client = legalRequestTestUser();
    $otherClient = legalRequestTestUser();

    $category = LegalCategory::query()->create([
        'code' => 'submission-test',
        'name' => 'Submission Test',
        'status' => true,
    ]);

    $province = Province::query()->create([
        'name' => 'Submission Province',
    ]);

    $city = City::query()->create([
        'name' => 'Submission City',
        'province_id' => $province->id,
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Submission Test Matter',
        'description' => 'Ready for submission.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'draft',
    ]);

    Sanctum::actingAs($otherClient);

    $this->postJson("/api/legal-requests/{$legalRequest->id}/submit")
        ->assertForbidden();

    Sanctum::actingAs($client);

    $this->postJson("/api/legal-requests/{$legalRequest->id}/submit")
        ->assertOk()
        ->assertJsonPath('message', 'Legal request submitted successfully.')
        ->assertJsonPath('legal_request.status', 'submitted');

    $legalRequest->refresh();

    expect($legalRequest->submitted_at)->not->toBeNull();

    $this->assertDatabaseMissing('legal_matters', [
        'source_legal_request_id' => $legalRequest->id,
    ]);

    $this->postJson("/api/legal-requests/{$legalRequest->id}/submit")
        ->assertStatus(409);
});
