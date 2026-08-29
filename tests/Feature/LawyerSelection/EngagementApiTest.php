<?php

use App\Models\Engagement;
use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function engagementReadFixture(): array
{
    $client = User::factory()->create(['status' => 'active']);
    $lawyerUser = User::factory()->create(['status' => 'active']);
    $otherUser = User::factory()->create(['status' => 'active']);

    $lawyer = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => 'Engagement Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Engagement request',
        'description' => 'Submitted request.',
        'service_intent' => 'lawyer_selection',
        'status' => 'matched',
        'submitted_at' => now(),
    ]);

    $engagement = Engagement::query()->create([
        'legal_request_id' => $legalRequest->id,
        'client_user_id' => $client->id,
        'lawyer_profile_id' => $lawyer->id,
        'status' => 'pending_contract',
    ]);

    return compact('client', 'lawyerUser', 'otherUser', 'lawyer', 'legalRequest', 'engagement');
}

test('client and assigned lawyer can reload the selected engagement', function () {
    $fixture = engagementReadFixture();

    Sanctum::actingAs($fixture['client']);
    $this->getJson("/api/legal-requests/{$fixture['legalRequest']->id}/engagement")
        ->assertOk()
        ->assertJsonPath('data.public_id', $fixture['engagement']->public_id)
        ->assertJsonPath('data.lawyer.public_id', $fixture['lawyer']->public_id);

    Sanctum::actingAs($fixture['lawyerUser']);
    $this->getJson("/api/engagements/{$fixture['engagement']->public_id}")
        ->assertOk()
        ->assertJsonPath('data.public_id', $fixture['engagement']->public_id)
        ->assertJsonPath('data.legal_request.public_id', $fixture['legalRequest']->public_id);
});

test('an unrelated user cannot read an engagement', function () {
    $fixture = engagementReadFixture();
    Sanctum::actingAs($fixture['otherUser']);

    $this->getJson("/api/engagements/{$fixture['engagement']->public_id}")
        ->assertForbidden();
});
