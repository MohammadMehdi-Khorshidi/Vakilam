<?php

use App\Models\MatterTimeline;
use App\Models\User;
use App\Models\LegalRequest;
use App\Models\LegalMatter;
use Laravel\Sanctum\Sanctum;

function clientCaseMatter(LegalRequest $legalRequest): LegalMatter
{
    return LegalMatter::query()->create([
        'source_legal_request_id' => $legalRequest->id,
        'origin_type' => 'lawyer_selection',
        'client_user_id' => $legalRequest->client_user_id,
        'title' => $legalRequest->title,
        'status' => 'active',
        'opened_at' => now(),
    ]);
}

test('client can view own case details with timeline', function () {
    $client = User::factory()->create();

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Test Legal Request',
        'description' => 'Testing case detail.',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $matter = clientCaseMatter($legalRequest);

    MatterTimeline::query()->create([
        'legal_matter_id' => $matter->id,
        'event_type' => 'matter_created',
        'summary' => 'Matter created',
        'occurred_at' => now(),
    ]);

    Sanctum::actingAs($client);

    $this->getJson("/api/client/cases/{$matter->id}")
        ->assertOk()
        ->assertJsonPath('data.title', 'Test Legal Request')
        ->assertJsonCount(1, 'data.timeline');
});


test('client cannot view another clients case', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $owner->id,
        'title' => 'Private Request',
        'description' => 'Private case test.',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $matter = clientCaseMatter($legalRequest);

    Sanctum::actingAs($otherUser);

    $this->getJson("/api/client/cases/{$matter->id}")
        ->assertForbidden();
});

test('client case details include documents', function () {
    $client = User::factory()->create();

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Document Test Request',
        'description' => 'Testing documents.',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $matter = clientCaseMatter($legalRequest);

    \App\Models\Document::query()->create([
        'legal_matter_id' => $matter->id,
        'owner_user_id' => $client->id,
        'title' => 'contract.pdf',
        'status' => 'active',
    ]);

    Sanctum::actingAs($client);

    $this->getJson("/api/client/cases/{$matter->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data.documents');
});
