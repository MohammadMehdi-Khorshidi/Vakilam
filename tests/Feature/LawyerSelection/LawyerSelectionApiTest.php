<?php

use App\Models\City;
use App\Models\LawyerProfile;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\Province;
use App\Models\Specialty;
use App\Models\User;
use Carbon\Carbon;
use Laravel\Sanctum\Sanctum;

function negotiationSelectionFixture(): array
{
    $client = User::factory()->create();

    $category = LegalCategory::query()->create([
        'code' => 'family',
        'name' => 'Family',
        'status' => true,
    ]);

    $specialty = Specialty::query()->create([
        'code' => 'family',
        'name' => 'Family',
        'status' => true,
    ]);

    $province = Province::query()->create(['name' => 'Tehran']);
    $city = City::query()->create(['province_id' => $province->id, 'name' => 'Tehran']);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Family request',
        'description' => 'A submitted family-law request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    return compact('client', 'specialty', 'province', 'city', 'legalRequest');
}

function negotiationSelectionLawyer(Specialty $specialty, Province $province, City $city): LawyerProfile
{
    $user = User::factory()->create();
    $lawyer = LawyerProfile::query()->create([
        'user_id' => $user->id,
        'full_name' => $user->name.' '.$user->last_name,
        'verification_status' => 'approved',
        'average_rating' => 4,
        'rating_count' => 2,
        'is_available' => true,
    ]);

    $lawyer->lawyerSpecialties()->create([
        'specialty_id' => $specialty->id,
        'years_experience' => 5,
    ]);

    $lawyer->serviceAreas()->create([
        'province_id' => $province->id,
        'city_id' => $city->id,
    ]);

    return $lawyer;
}

test('a client can invite a matching lawyer to negotiate', function () {
    Carbon::setTestNow('2026-08-29 10:00:00');
    $fixture = negotiationSelectionFixture();
    $lawyer = negotiationSelectionLawyer($fixture['specialty'], $fixture['province'], $fixture['city']);

    Sanctum::actingAs($fixture['client']);

    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/matching")->assertCreated();

    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyer->public_id}")
        ->assertCreated()
        ->assertJsonPath('distribution.source', 'client_invite')
        ->assertJsonPath('distribution.status', 'pending');

    $this->assertDatabaseHas('legal_request_distributions', [
        'legal_request_id' => $fixture['legalRequest']->id,
        'lawyer_profile_id' => $lawyer->id,
        'source' => 'client_invite',
        'status' => 'pending',
    ]);
});

test('a client cannot keep more than five direct invitations open', function () {
    $fixture = negotiationSelectionFixture();
    $lawyers = collect(range(1, 6))->map(fn () => negotiationSelectionLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
    ));

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/matching")->assertCreated();

    foreach ($lawyers->take(5) as $lawyer) {
        $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyer->public_id}")
            ->assertCreated();
    }

    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyers->last()->public_id}")
        ->assertStatus(422);
});

test('a lawyer can reject a direct invitation without opening negotiation', function () {
    $fixture = negotiationSelectionFixture();
    $lawyer = negotiationSelectionLawyer($fixture['specialty'], $fixture['province'], $fixture['city']);

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/matching")->assertCreated();
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyer->public_id}")->assertCreated();

    $distribution = $fixture['legalRequest']->distributions()->where('lawyer_profile_id', $lawyer->id)->firstOrFail();

    Sanctum::actingAs($lawyer->user);
    $this->postJson("/api/lawyer/distributions/{$distribution->id}/respond", ['action' => 'reject'])
        ->assertOk()
        ->assertJsonPath('distribution.status', 'rejected')
        ->assertJsonPath('engagement', null);

    $this->assertDatabaseCount('negotiations', 0);
    $this->assertDatabaseCount('engagements', 0);
});

test('multiple lawyer acceptances open parallel negotiations without creating engagement', function () {
    $fixture = negotiationSelectionFixture();
    $first = negotiationSelectionLawyer($fixture['specialty'], $fixture['province'], $fixture['city']);
    $second = negotiationSelectionLawyer($fixture['specialty'], $fixture['province'], $fixture['city']);

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/matching")->assertCreated();

    foreach ([$first, $second] as $lawyer) {
        $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyer->public_id}")->assertCreated();
    }

    foreach ([$first, $second] as $lawyer) {
        $distribution = $fixture['legalRequest']->distributions()->where('lawyer_profile_id', $lawyer->id)->firstOrFail();
        Sanctum::actingAs($lawyer->user);

        $this->postJson("/api/lawyer/distributions/{$distribution->id}/respond", ['action' => 'accept'])
            ->assertCreated()
            ->assertJsonPath('distribution.status', 'negotiating')
            ->assertJsonPath('negotiation.status', 'active')
            ->assertJsonPath('engagement', null);
    }

    $this->assertDatabaseCount('negotiations', 2);
    $this->assertDatabaseCount('engagements', 0);
    expect($fixture['legalRequest']->fresh()->status)->toBe('submitted');
});

test('an expired direct invitation cannot open negotiation', function () {
    Carbon::setTestNow('2026-08-29 10:00:00');
    $fixture = negotiationSelectionFixture();
    $lawyer = negotiationSelectionLawyer($fixture['specialty'], $fixture['province'], $fixture['city']);

    Sanctum::actingAs($fixture['client']);
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/matching")->assertCreated();
    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyer->public_id}")->assertCreated();

    $distribution = $fixture['legalRequest']->distributions()->where('lawyer_profile_id', $lawyer->id)->firstOrFail();
    $distribution->forceFill(['expires_at' => now()->subMinute()])->save();

    Sanctum::actingAs($lawyer->user);
    $this->postJson("/api/lawyer/distributions/{$distribution->id}/respond", ['action' => 'accept'])
        ->assertStatus(409);

    $this->assertDatabaseHas('legal_request_distributions', ['id' => $distribution->id, 'status' => 'expired']);
    $this->assertDatabaseCount('negotiations', 0);
    $this->assertDatabaseCount('engagements', 0);
});

test('a rejected direct invitation frees one of the five open invitation slots', function () {
    $fixture = negotiationSelectionFixture();

    $lawyers = collect(range(1, 6))->map(fn () => negotiationSelectionLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
    ));

    Sanctum::actingAs($fixture['client']);

    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/matching")
        ->assertCreated();

    foreach ($lawyers->take(5) as $lawyer) {
        $this->postJson(
            "/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyer->public_id}"
        )->assertCreated();
    }

    $firstLawyer = $lawyers->first();

    $distribution = $fixture['legalRequest']
        ->distributions()
        ->where('lawyer_profile_id', $firstLawyer->id)
        ->firstOrFail();

    Sanctum::actingAs($firstLawyer->user);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/respond",
        ['action' => 'reject']
    )->assertOk();

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyers->last()->public_id}"
    )->assertCreated();
});

test('an expired direct invitation frees one of the five open invitation slots', function () {
    Carbon::setTestNow('2026-08-29 10:00:00');

    $fixture = negotiationSelectionFixture();

    $lawyers = collect(range(1, 6))->map(fn () => negotiationSelectionLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
    ));

    Sanctum::actingAs($fixture['client']);

    $this->postJson("/api/legal-requests/{$fixture['legalRequest']->id}/matching")
        ->assertCreated();

    foreach ($lawyers->take(5) as $lawyer) {
        $this->postJson(
            "/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyer->public_id}"
        )->assertCreated();
    }

    $firstLawyer = $lawyers->first();

    $distribution = $fixture['legalRequest']
        ->distributions()
        ->where('lawyer_profile_id', $firstLawyer->id)
        ->firstOrFail();

    $distribution->forceFill([
        'expires_at' => now()->subMinute(),
    ])->save();

    $this->postJson(
        "/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyers->last()->public_id}"
    )->assertCreated();
});

test('a closed negotiation cannot be reopened by reinviting the same lawyer', function () {
    $fixture = negotiationSelectionFixture();

    $lawyer = negotiationSelectionLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
    );

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legalRequest']->id}/matching",
    )->assertCreated();

    $this->postJson(
        "/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyer->public_id}",
    )->assertCreated();

    $distribution = $fixture['legalRequest']
        ->distributions()
        ->where('lawyer_profile_id', $lawyer->id)
        ->firstOrFail();

    Sanctum::actingAs($lawyer->user);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/respond",
        ['action' => 'accept'],
    )->assertCreated();

    $negotiation = $distribution->negotiation()->firstOrFail();

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/negotiations/{$negotiation->public_id}/close",
    )->assertOk();

    $this->postJson(
        "/api/legal-requests/{$fixture['legalRequest']->id}/lawyer-selection/{$lawyer->public_id}",
    )->assertStatus(409);

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $distribution->id,
        'status' => 'closed',
    ]);

    $this->assertDatabaseHas('negotiations', [
        'id' => $negotiation->id,
        'status' => 'closed',
    ]);

    $this->assertDatabaseCount('negotiations', 1);
});
