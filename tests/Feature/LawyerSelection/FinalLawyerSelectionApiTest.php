<?php

use App\Models\LawyerProfile;
use App\Models\LawyerProposal;
use App\Models\LegalRequest;
use App\Models\LegalRequestDistribution;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function finalSelectionLawyer(array $attributes = []): LawyerProfile
{
    $user = User::factory()->create($attributes['user'] ?? []);
    unset($attributes['user']);

    return LawyerProfile::query()->create([
        'user_id' => $user->id,
        'full_name' => $user->name.' '.$user->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
        ...$attributes,
    ]);
}

/**
 * @return array{
 *     client: User,
 *     legal_request: LegalRequest,
 *     first_proposal: LawyerProposal,
 *     second_proposal: LawyerProposal
 * }
 */
function finalSelectionFixture(): array
{
    $client = User::factory()->create();
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted request with lawyer proposals.',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
    $firstLawyer = finalSelectionLawyer(['full_name' => 'First Lawyer']);
    $secondLawyer = finalSelectionLawyer(['full_name' => 'Second Lawyer']);
    $firstDistribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $firstLawyer->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);
    $secondDistribution = LegalRequestDistribution::query()->create([
        'legal_request_id' => $legalRequest->id,
        'lawyer_profile_id' => $secondLawyer->id,
        'status' => 'sent',
        'sent_at' => now(),
    ]);
    $firstProposal = LawyerProposal::query()->create([
        'distribution_id' => $firstDistribution->id,
        'lawyer_profile_id' => $firstLawyer->id,
        'summary' => 'First submitted proposal.',
        'proposed_fee_rial' => 100000000,
        'estimated_days' => 30,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
    $secondProposal = LawyerProposal::query()->create([
        'distribution_id' => $secondDistribution->id,
        'lawyer_profile_id' => $secondLawyer->id,
        'summary' => 'Second submitted proposal.',
        'proposed_fee_rial' => 80000000,
        'estimated_days' => 45,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    return [
        'client' => $client,
        'legal_request' => $legalRequest,
        'first_proposal' => $firstProposal,
        'second_proposal' => $secondProposal,
    ];
}

test('a client can select one submitted proposal as the final lawyer', function () {
    $fixture = finalSelectionFixture();
    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection",
        ['proposal_public_id' => $fixture['first_proposal']->public_id],
    )
        ->assertOk()
        ->assertJsonPath('data.proposal_public_id', $fixture['first_proposal']->public_id)
        ->assertJsonPath('data.status', 'selected')
        ->assertJsonPath(
            'data.lawyer.public_id',
            $fixture['first_proposal']->lawyerProfile->public_id,
        );

    $this->assertDatabaseHas('legal_requests', [
        'id' => $fixture['legal_request']->id,
        'status' => 'matched',
    ]);
    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $fixture['first_proposal']->id,
        'status' => 'selected',
    ]);
    $this->assertDatabaseHas('lawyer_proposals', [
        'id' => $fixture['second_proposal']->id,
        'status' => 'rejected',
    ]);
    $this->assertDatabaseHas('engagements', [
        'legal_request_id' => $fixture['legal_request']->id,
        'proposal_id' => $fixture['first_proposal']->id,
        'client_user_id' => $fixture['client']->id,
        'lawyer_profile_id' => $fixture['first_proposal']->lawyer_profile_id,
        'status' => 'pending_contract',
    ]);
    $this->assertDatabaseCount('engagements', 1);
    $this->assertDatabaseCount('legal_matters', 0);

    $this->getJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection",
    )
        ->assertOk()
        ->assertJsonPath('data.proposal_public_id', $fixture['first_proposal']->public_id);
});

test('a final lawyer cannot be selected twice', function () {
    $fixture = finalSelectionFixture();
    Sanctum::actingAs($fixture['client']);
    $endpoint = "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection";

    $this->postJson($endpoint, [
        'proposal_public_id' => $fixture['first_proposal']->public_id,
    ])->assertOk();

    $this->postJson($endpoint, [
        'proposal_public_id' => $fixture['second_proposal']->public_id,
    ])->assertStatus(409);

    $this->assertDatabaseCount('lawyer_proposals', 2);
    expect($fixture['first_proposal']->fresh()->status)->toBe('selected');
    $this->assertDatabaseCount('engagements', 1);
});

test('only the owner can select or view the final lawyer', function () {
    $fixture = finalSelectionFixture();
    $otherClient = User::factory()->create();
    Sanctum::actingAs($otherClient);
    $endpoint = "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection";

    $this->postJson($endpoint, [
        'proposal_public_id' => $fixture['first_proposal']->public_id,
    ])->assertForbidden();
    $this->getJson($endpoint)->assertForbidden();

    $this->assertDatabaseMissing('lawyer_proposals', [
        'id' => $fixture['first_proposal']->id,
        'status' => 'selected',
    ]);
});

test('a draft, unrelated, or expired proposal cannot be selected', function () {
    $fixture = finalSelectionFixture();
    Sanctum::actingAs($fixture['client']);
    $endpoint = "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection";

    $fixture['first_proposal']->forceFill(['status' => 'draft'])->save();
    $this->postJson($endpoint, [
        'proposal_public_id' => $fixture['first_proposal']->public_id,
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('proposal_public_id');

    $fixture['first_proposal']->forceFill([
        'status' => 'submitted',
        'expires_at' => now()->subMinute(),
    ])->save();
    $this->postJson($endpoint, [
        'proposal_public_id' => $fixture['first_proposal']->public_id,
    ])->assertStatus(409);

    $otherFixture = finalSelectionFixture();
    $this->postJson($endpoint, [
        'proposal_public_id' => $otherFixture['first_proposal']->public_id,
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('proposal_public_id');

    $this->assertDatabaseMissing('lawyer_proposals', [
        'id' => $fixture['first_proposal']->id,
        'status' => 'selected',
    ]);
});

test('the selection endpoint returns null before a lawyer is selected', function () {
    $fixture = finalSelectionFixture();
    Sanctum::actingAs($fixture['client']);

    $this->getJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection",
    )
        ->assertOk()
        ->assertJsonPath('data', null);
});
