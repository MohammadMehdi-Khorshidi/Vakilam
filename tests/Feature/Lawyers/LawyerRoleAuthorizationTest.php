<?php

use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Laravel\Sanctum\Sanctum;

function revokedLawyerFixture(string $distributionStatus): array
{
    $client = User::factory()->create(['status' => 'active']);
    $lawyerUser = User::factory()->create(['status' => 'active']);

    $lawyer = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => 'Revoked Role Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $role = Role::query()->create([
        'code' => 'lawyer',
        'name' => 'Lawyer',
        'is_system' => true,
    ]);

    UserRole::query()->create([
        'user_id' => $lawyerUser->id,
        'role_id' => $role->id,
        'granted_at' => now()->subDay(),
        'revoked_at' => now(),
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'Submitted request.',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $distribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $lawyer->id,
        'status' => $distributionStatus,
        'sent_at' => now(),
        'expires_at' => $distributionStatus === 'pending' ? now()->addHour() : null,
    ]);

    return compact('lawyerUser', 'distribution');
}

test('a lawyer with an explicitly revoked lawyer role cannot create a proposal', function () {
    $fixture = revokedLawyerFixture('sent');
    Sanctum::actingAs($fixture['lawyerUser']);

    $this->postJson("/api/lawyer/distributions/{$fixture['distribution']->id}/proposal", [
        'summary' => 'Must be rejected.',
        'proposed_fee_rial' => 50_000_000,
        'estimated_days' => 30,
    ])->assertForbidden();
});

test('a lawyer with an explicitly revoked lawyer role cannot respond to a direct request', function () {
    $fixture = revokedLawyerFixture('pending');
    Sanctum::actingAs($fixture['lawyerUser']);

    $this->postJson("/api/lawyer/distributions/{$fixture['distribution']->id}/respond", [
        'action' => 'accept',
    ])->assertForbidden();
});
