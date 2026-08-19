<?php

use App\Models\City;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\Province;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Laravel\Sanctum\Sanctum;

function autosaveTestClient(): User
{
    $user = User::factory()->create();
    $role = Role::query()->firstOrCreate(
        ['code' => 'client'],
        ['name_fa' => 'موکل'],
    );
    UserRole::query()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
        'granted_at' => now(),
    ]);

    return $user;
}

test('a client cannot create an empty draft', function () {
    Sanctum::actingAs(autosaveTestClient());

    $this->postJson('/api/legal-requests', ['description' => '   '])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('description');

    expect(LegalRequest::query()->count())->toBe(0);
});

test('a client has at most one active draft', function () {
    $client = autosaveTestClient();
    Sanctum::actingAs($client);

    $first = $this->postJson('/api/legal-requests', [
        'description' => 'The first saved explanation.',
    ])->assertCreated();

    $second = $this->postJson('/api/legal-requests', [
        'description' => 'A second attempted draft.',
    ])->assertOk()
        ->assertJsonPath('message', 'An active draft already exists.');

    expect($second->json('legal_request.id'))->toBe($first->json('legal_request.id'))
        ->and(LegalRequest::query()
            ->where('client_user_id', $client->id)
            ->where('status', 'draft')
            ->count())->toBe(1);
});

test('a client can retrieve and autosave their draft', function () {
    $client = autosaveTestClient();
    $draft = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Initial explanation.',
        'status' => 'draft',
    ]);
    Sanctum::actingAs($client);

    $this->getJson('/api/legal-requests/draft')
        ->assertOk()
        ->assertJsonPath('legal_request.id', $draft->id)
        ->assertJsonPath('legal_request.documents', []);

    $this->patchJson("/api/legal-requests/{$draft->id}", [
        'description' => 'Autosaved explanation.',
        'urgency' => 'high',
        'parties' => [
            [
                'party_role' => 'plaintiff',
                'full_name' => 'Current client',
                'is_client' => true,
            ],
        ],
    ])->assertOk()
        ->assertJsonPath('message', 'Draft autosaved successfully.')
        ->assertJsonPath('legal_request.description', 'Autosaved explanation.')
        ->assertJsonCount(1, 'legal_request.parties');

    $this->assertDatabaseHas('legal_requests', [
        'id' => $draft->id,
        'description' => 'Autosaved explanation.',
        'urgency' => 'high',
    ]);
});

test('changing a draft province clears an omitted old city', function () {
    $client = autosaveTestClient();
    $firstProvince = Province::query()->create(['name' => 'First autosave province']);
    $secondProvince = Province::query()->create(['name' => 'Second autosave province']);
    $city = City::query()->create([
        'name' => 'Old autosave city',
        'province_id' => $firstProvince->id,
    ]);
    $draft = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A location will be changed.',
        'province_id' => $firstProvince->id,
        'city_id' => $city->id,
        'status' => 'draft',
    ]);
    Sanctum::actingAs($client);

    $this->patchJson("/api/legal-requests/{$draft->id}", [
        'province_id' => $secondProvince->id,
    ])->assertOk()
        ->assertJsonPath('legal_request.province_id', $secondProvince->id)
        ->assertJsonPath('legal_request.city_id', null);
});

test('only the owner can autosave and submitted requests are immutable', function () {
    $owner = autosaveTestClient();
    $otherClient = autosaveTestClient();
    $draft = LegalRequest::query()->create([
        'client_user_id' => $owner->id,
        'description' => 'Owner-only draft.',
        'status' => 'draft',
    ]);

    Sanctum::actingAs($otherClient);
    $this->patchJson("/api/legal-requests/{$draft->id}", [
        'description' => 'Forbidden change.',
    ])->assertForbidden();

    $draft->forceFill(['status' => 'submitted', 'submitted_at' => now()])->save();
    Sanctum::actingAs($owner);
    $this->patchJson("/api/legal-requests/{$draft->id}", [
        'description' => 'Late change.',
    ])->assertStatus(409);
});

test('submission validates all final required values', function () {
    $client = autosaveTestClient();
    $draft = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Incomplete final request.',
        'status' => 'draft',
    ]);
    Sanctum::actingAs($client);

    $this->postJson("/api/legal-requests/{$draft->id}/submit")
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'legal_category_id',
            'province_id',
            'city_id',
            'urgency',
            'service_intent',
        ]);

    expect($draft->fresh()->status)->toBe('draft');
});

test('submitting a complete draft frees the client to create a new draft', function () {
    $client = autosaveTestClient();
    $category = LegalCategory::query()->create([
        'code' => 'autosave-submit',
        'name' => 'Autosave Submit',
        'status' => true,
    ]);
    $province = Province::query()->create(['name' => 'Autosave Submit Province']);
    $city = City::query()->create([
        'name' => 'Autosave Submit City',
        'province_id' => $province->id,
    ]);
    $draft = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Complete final request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'consultation',
        'status' => 'draft',
    ]);
    Sanctum::actingAs($client);

    $this->postJson("/api/legal-requests/{$draft->id}/submit")
        ->assertOk()
        ->assertJsonPath('legal_request.status', 'submitted');

    $this->postJson('/api/legal-requests', [
        'description' => 'A new draft after submission.',
    ])->assertCreated();

    expect(LegalRequest::query()
        ->where('client_user_id', $client->id)
        ->where('status', 'draft')
        ->count())->toBe(1);
});
