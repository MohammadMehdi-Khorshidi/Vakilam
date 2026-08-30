<?php

use App\Models\Engagement;
use App\Models\LawyerProfile;
use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Laravel\Sanctum\Sanctum;

function lawyerWorkspaceFixture(): array
{
    $client = User::factory()->create(['status' => 'active']);
    $lawyerUser = User::factory()->create(['status' => 'active']);

    $lawyer = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => 'Workspace Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Workspace request',
        'description' => 'A submitted request for lawyer workspace testing.',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyer->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);

    $proposal = LawyerProposal::query()->create([
        'legal_request_id' => $legalRequest->id,
        'distribution_id' => $distribution->id,
        'lawyer_profile_id' => $lawyer->id,
        'summary' => 'Workspace proposal',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
        'status' => 'draft',
    ]);

    return compact('client', 'lawyerUser', 'lawyer', 'legalRequest', 'distribution', 'proposal');
}

test('an approved lawyer can reload incoming opportunities and recover distribution ids', function () {
    $fixture = lawyerWorkspaceFixture();
    Sanctum::actingAs($fixture['lawyerUser']);

    $this->getJson('/api/lawyer/opportunities')
        ->assertOk()
        ->assertJsonPath('data.0.distribution_id', $fixture['distribution']->id)
        ->assertJsonPath('data.0.status', 'sent')
        ->assertJsonPath('data.0.legal_request.public_id', $fixture['legalRequest']->public_id)
        ->assertJsonPath('data.0.proposal.public_id', $fixture['proposal']->public_id);
});

test('an approved lawyer can reload their proposals after refresh', function () {
    $fixture = lawyerWorkspaceFixture();
    Sanctum::actingAs($fixture['lawyerUser']);

    $this->getJson('/api/lawyer/proposals')
        ->assertOk()
        ->assertJsonPath('data.0.public_id', $fixture['proposal']->public_id)
        ->assertJsonPath('data.0.distribution_id', $fixture['distribution']->id)
        ->assertJsonPath('data.0.status', 'draft')
        ->assertJsonPath('data.0.legal_request.public_id', $fixture['legalRequest']->public_id);
});

test('a lawyer can reload engagements assigned to their profile', function () {
    $fixture = lawyerWorkspaceFixture();

    $fixture['proposal']->forceFill([
        'status' => 'selected',
        'submitted_at' => now(),
        'expires_at' => now()->addHours(72),
    ])->save();

    $engagement = Engagement::query()->create([
        'legal_request_id' => $fixture['legalRequest']->id,
        'proposal_id' => $fixture['proposal']->id,
        'client_user_id' => $fixture['client']->id,
        'lawyer_profile_id' => $fixture['lawyer']->id,
        'status' => 'pending_contract',
    ]);

    Sanctum::actingAs($fixture['lawyerUser']);

    $this->getJson('/api/lawyer/engagements')
        ->assertOk()
        ->assertJsonPath('data.0.public_id', $engagement->public_id)
        ->assertJsonPath('data.0.status', 'pending_contract')
        ->assertJsonPath('data.0.legal_request.public_id', $fixture['legalRequest']->public_id);
});

test('an explicitly revoked lawyer role blocks lawyer workspace actions', function () {
    $fixture = lawyerWorkspaceFixture();

    $role = Role::query()->create([
        'code' => 'lawyer',
        'name' => 'Lawyer',
        'is_system' => true,
    ]);

    UserRole::query()->create([
        'user_id' => $fixture['lawyerUser']->id,
        'role_id' => $role->id,
        'granted_at' => now()->subDay(),
        'revoked_at' => now(),
    ]);

    Sanctum::actingAs($fixture['lawyerUser']);

    $this->getJson('/api/lawyer/opportunities')->assertForbidden();
});
