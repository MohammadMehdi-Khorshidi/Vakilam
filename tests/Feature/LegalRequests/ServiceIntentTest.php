<?php

use App\Models\LawyerMatchRun;
use App\Models\LegalRequest;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Laravel\Sanctum\Sanctum;

function serviceIntentTestClient(): User
{
    $user = User::factory()->create();
    $role = Role::query()->firstOrCreate(
        ['code' => 'client'],
        ['name' => 'Client'],
    );
    UserRole::query()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
        'granted_at' => now(),
    ]);

    return $user;
}

test('a client can view service options for their submitted legal request', function () {
    $client = serviceIntentTestClient();
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request awaiting a service choice.',
        'service_intent' => 'undecided',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
    Sanctum::actingAs($client);

    $this->getJson("/api/legal-requests/{$legalRequest->id}/service-options")
        ->assertOk()
        ->assertJsonPath('data.selected_intent', 'undecided')
        ->assertJsonPath('data.options.0.key', 'ai_assistant')
        ->assertJsonPath('data.options.0.available', false)
        ->assertJsonPath('data.options.0.unavailable_reason', 'coming_soon')
        ->assertJsonPath('data.options.1.key', 'consultation')
        ->assertJsonPath('data.options.1.available', true)
        ->assertJsonPath('data.options.2.key', 'lawyer_selection')
        ->assertJsonPath('data.options.2.available', true);
});

test('a client can select and change the service intent of a submitted request', function () {
    $client = serviceIntentTestClient();
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request with a changeable service choice.',
        'service_intent' => 'undecided',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
    Sanctum::actingAs($client);

    $this->postJson("/api/legal-requests/{$legalRequest->id}/service-intent", [
        'service_intent' => 'consultation',
    ])->assertOk()
        ->assertJsonPath('data.service_intent', 'consultation')
        ->assertJsonPath('data.next_action', 'select_consultation_lawyer');

    $this->postJson("/api/legal-requests/{$legalRequest->id}/service-intent", [
        'service_intent' => 'lawyer_selection',
    ])->assertOk()
        ->assertJsonPath('data.service_intent', 'lawyer_selection')
        ->assertJsonPath('data.next_action', 'start_lawyer_selection');

    $this->assertDatabaseHas('legal_requests', [
        'id' => $legalRequest->id,
        'service_intent' => 'lawyer_selection',
    ]);
    $this->assertDatabaseCount('consultations', 0);
    $this->assertDatabaseCount('engagements', 0);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('ai and unknown service intents cannot be selected yet', function (string $serviceIntent) {
    $client = serviceIntentTestClient();
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request awaiting an available service.',
        'service_intent' => 'undecided',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
    Sanctum::actingAs($client);

    $this->postJson("/api/legal-requests/{$legalRequest->id}/service-intent", [
        'service_intent' => $serviceIntent,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('service_intent');

    expect($legalRequest->fresh()->service_intent)->toBe('undecided');
})->with(['ai_assistant', 'unknown']);

test('a service intent can only be selected for an owned submitted request', function () {
    $owner = serviceIntentTestClient();
    $otherClient = serviceIntentTestClient();
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $owner->id,
        'description' => 'Owner-only service selection.',
        'service_intent' => 'undecided',
        'status' => 'draft',
    ]);

    Sanctum::actingAs($otherClient);
    $this->getJson("/api/legal-requests/{$legalRequest->id}/service-options")
        ->assertForbidden();
    $this->postJson("/api/legal-requests/{$legalRequest->id}/service-intent", [
        'service_intent' => 'consultation',
    ])->assertForbidden();

    Sanctum::actingAs($owner);
    $this->getJson("/api/legal-requests/{$legalRequest->id}/service-options")
        ->assertStatus(409);
    $this->postJson("/api/legal-requests/{$legalRequest->id}/service-intent", [
        'service_intent' => 'consultation',
    ])->assertStatus(409);

    expect($legalRequest->fresh()->service_intent)->toBe('undecided');
});

test('service intent cannot change after matching has started', function () {
    $client = serviceIntentTestClient();
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request with an active matching flow.',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    LawyerMatchRun::query()->create([
        'legal_request_id' => $legalRequest->id,
        'algorithm_version' => 'v1',
        'status' => 'completed',
        'candidates_count' => 0,
        'completed_at' => now(),
    ]);

    Sanctum::actingAs($client);

    $this->postJson("/api/legal-requests/{$legalRequest->id}/service-intent", [
        'service_intent' => 'consultation',
    ])->assertStatus(409)
        ->assertJsonPath('message', 'Service intent cannot be changed after a service flow has started.');

    expect($legalRequest->fresh()->service_intent)->toBe('lawyer_selection');
});
