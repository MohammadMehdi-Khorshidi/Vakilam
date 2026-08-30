<?php

use App\Models\LegalMatter;
use App\Models\LegalRequest;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Laravel\Sanctum\Sanctum;

function dashboardTestClient(): User
{
    $user = User::factory()->create();

    $role = Role::query()->firstOrCreate(
        ['code' => 'client'],
        ['name' => 'موکل'],
    );

    UserRole::query()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
        'granted_at' => now(),
    ]);

    return $user;
}


test('client dashboard returns own drafts and active matters only', function () {

    $client = dashboardTestClient();
    $otherClient = dashboardTestClient();

    $ownDraft = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'My Draft Case',
        'description' => 'Draft description',
        'status' => 'draft',
    ]);

    $ownMatter = LegalMatter::query()->create([
        'source_legal_request_id' => $ownDraft->id,
        'client_user_id' => $client->id,
        'title' => 'My Active Case',
        'status' => 'onboarding',
        'opened_at' => now(),
    ]);


    LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'My Submitted Request',
        'description' => 'Submitted description',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    LegalRequest::query()->create([
        'client_user_id' => $otherClient->id,
        'title' => 'Other Draft Case',
        'description' => 'Other description',
        'status' => 'draft',
    ]);

    Sanctum::actingAs($client);

    $this->getJson('/api/client/dashboard')
        ->assertOk()
        ->assertJsonCount(1, 'draft_cases')
        ->assertJsonCount(1, 'submitted_requests')
        ->assertJsonCount(1, 'active_cases')
        ->assertJsonPath('draft_cases.0.title', 'My Draft Case')
        ->assertJsonPath('submitted_requests.0.title', 'My Submitted Request')
        ->assertJsonPath('active_cases.0.title', 'My Active Case');
});