<?php

use App\Models\City;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\Province;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/** @return array{client: User, legal_request: LegalRequest} */
function emptyLawyerSelectionFixture(): array
{
    $client = User::factory()->create();
    $category = LegalCategory::query()->create([
        'code' => 'family-empty-state',
        'name' => 'Family Empty State',
        'status' => true,
    ]);
    $province = Province::query()->create(['name' => 'Empty State Province']);
    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Empty State City',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A request used to verify the no-lawyer empty state.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    return [
        'client' => $client,
        'legal_request' => $legalRequest,
    ];
}

test('matching GET returns a stable not-started empty state instead of 404', function () {
    $fixture = emptyLawyerSelectionFixture();
    Sanctum::actingAs($fixture['client']);

    $this->getJson("/api/legal-requests/{$fixture['legal_request']->id}/matching")
        ->assertOk()
        ->assertJsonPath('data.status', 'not_started')
        ->assertJsonPath('data.candidates_count', 0)
        ->assertJsonCount(0, 'data.candidates')
        ->assertJsonPath('meta.selection.limit', 5)
        ->assertJsonPath('meta.selection.selected_count', 0)
        ->assertJsonPath('meta.selection.remaining_count', 5);

    $this->assertDatabaseCount('lawyer_match_runs', 0);
});

test('selectable-lawyer directory returns an empty successful response when there are no lawyers', function () {
    $fixture = emptyLawyerSelectionFixture();
    Sanctum::actingAs($fixture['client']);

    $this->getJson("/api/legal-requests/{$fixture['legal_request']->id}/lawyers")
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('meta.matching_run_id', null)
        ->assertJsonPath('meta.matching_status', 'not_started')
        ->assertJsonPath('meta.pagination.total', 0)
        ->assertJsonPath('meta.selection.limit', 5)
        ->assertJsonPath('meta.selection.selected_count', 0)
        ->assertJsonPath('meta.selection.remaining_count', 5);

    // A read-only directory request must not create matching state.
    $this->assertDatabaseCount('lawyer_match_runs', 0);
});

test('running matching succeeds with zero lawyers and remains idempotent', function () {
    $fixture = emptyLawyerSelectionFixture();
    Sanctum::actingAs($fixture['client']);

    $this->postJson("/api/legal-requests/{$fixture['legal_request']->id}/matching")
        ->assertCreated()
        ->assertJsonPath('data.status', 'completed')
        ->assertJsonPath('data.candidates_count', 0)
        ->assertJsonCount(0, 'data.candidates')
        ->assertJsonPath('meta.selection.remaining_count', 5);

    $this->getJson("/api/legal-requests/{$fixture['legal_request']->id}/matching")
        ->assertOk()
        ->assertJsonPath('data.status', 'completed')
        ->assertJsonCount(0, 'data.candidates');

    $this->assertDatabaseCount('lawyer_match_runs', 1);
    $this->assertDatabaseCount('lawyer_match_candidates', 0);
    $this->assertDatabaseCount('legal_request_distributions', 0);
});
