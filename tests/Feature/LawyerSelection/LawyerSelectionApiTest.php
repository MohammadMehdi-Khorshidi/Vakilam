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

function lawyerSelectionFixture(): array
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

    $province = Province::query()->create([
        'name' => 'Tehran',
    ]);

    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted family-law request.',
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
        'specialty' => $specialty,
        'province' => $province,
        'city' => $city,
    ];
}

function lawyerSelectionLawyer(
    Specialty $specialty,
    Province $province,
    City $city,
): LawyerProfile {
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

test('a client can send a direct collaboration request to a matching lawyer', function () {
    Carbon::setTestNow('2026-08-25 00:00:00');

    $fixture = lawyerSelectionFixture();

    $lawyer = lawyerSelectionLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
    );

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/matching",
    )->assertCreated();

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$lawyer->id}",
    )
        ->assertCreated()
        ->assertJsonPath('distribution.status', 'pending')
        ->assertJsonPath('distribution.lawyer_profile_id', $lawyer->id);

    $distribution = $fixture['legal_request']
        ->distributions()
        ->where('lawyer_profile_id', $lawyer->id)
        ->firstOrFail();

    expect($distribution->status)->toBe('pending');
    expect($distribution->sent_at->equalTo(now()))->toBeTrue();
    expect($distribution->expires_at->equalTo(now()->addHours(72)))->toBeTrue();

    $this->assertDatabaseCount('legal_request_distributions', 1);

    Carbon::setTestNow();
});

test('a client cannot have more than five open lawyer requests', function () {
    $fixture = lawyerSelectionFixture();

    $lawyers = collect();

    for ($i = 1; $i <= 6; $i++) {
        $lawyers->push(
            lawyerSelectionLawyer(
                $fixture['specialty'],
                $fixture['province'],
                $fixture['city'],
            ),
        );
    }

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/matching",
    )->assertCreated();

    foreach ($lawyers->take(5) as $lawyer) {
        $this->postJson(
            "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$lawyer->id}",
        )
            ->assertCreated()
            ->assertJsonPath('distribution.status', 'pending');
    }

    $sixthLawyer = $lawyers->get(5);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$sixthLawyer->id}",
    )
        ->assertStatus(409)
        ->assertJsonPath(
            'message',
            'A maximum of five lawyer requests may be open at the same time.',
        );

    expect(
        $fixture['legal_request']
            ->distributions()
            ->where('status', 'pending')
            ->count(),
    )->toBe(5);
});

test('a lawyer can reject a direct collaboration request', function () {
    $fixture = lawyerSelectionFixture();

    $lawyer = lawyerSelectionLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
    );

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/matching",
    )->assertCreated();

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$lawyer->id}",
    )->assertCreated();

    $distribution = $fixture['legal_request']
        ->distributions()
        ->where('lawyer_profile_id', $lawyer->id)
        ->firstOrFail();

    $lawyerUser = $lawyer->user;

    Sanctum::actingAs($lawyerUser);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/respond",
        ['action' => 'reject'],
    )
        ->assertOk()
        ->assertJsonPath('distribution.status', 'rejected')
        ->assertJsonPath('engagement', null);

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $distribution->id,
        'status' => 'rejected',
    ]);

    $this->assertDatabaseCount('engagements', 0);
});

test('first lawyer acceptance creates one engagement and cancels other open requests', function () {
    $fixture = lawyerSelectionFixture();

    $firstLawyer = lawyerSelectionLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
    );

    $secondLawyer = lawyerSelectionLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
    );

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/matching",
    )->assertCreated();

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$firstLawyer->id}",
    )->assertCreated();

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$secondLawyer->id}",
    )->assertCreated();

    $firstDistribution = $fixture['legal_request']
        ->distributions()
        ->where('lawyer_profile_id', $firstLawyer->id)
        ->firstOrFail();

    $secondDistribution = $fixture['legal_request']
        ->distributions()
        ->where('lawyer_profile_id', $secondLawyer->id)
        ->firstOrFail();

    Sanctum::actingAs($firstLawyer->user);

    $this->postJson(
        "/api/lawyer/distributions/{$firstDistribution->id}/respond",
        ['action' => 'accept'],
    )
        ->assertCreated()
        ->assertJsonPath('distribution.status', 'accepted')
        ->assertJsonPath('engagement.status', 'pending_contract')
        ->assertJsonPath('engagement.lawyer_profile_id', $firstLawyer->id)
        ->assertJsonPath('engagement.proposal_id', null);

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $firstDistribution->id,
        'status' => 'accepted',
    ]);

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $secondDistribution->id,
        'status' => 'cancelled',
    ]);

    $this->assertDatabaseHas('engagements', [
        'legal_request_id' => $fixture['legal_request']->id,
        'client_user_id' => $fixture['client']->id,
        'lawyer_profile_id' => $firstLawyer->id,
        'proposal_id' => null,
        'status' => 'pending_contract',
    ]);

    $this->assertDatabaseCount('engagements', 1);
    $this->assertDatabaseCount('legal_matters', 0);
});

test('a rejected request frees one of the five open request slots', function () {
    $fixture = lawyerSelectionFixture();

    $lawyers = collect();

    for ($i = 1; $i <= 6; $i++) {
        $lawyers->push(
            lawyerSelectionLawyer(
                $fixture['specialty'],
                $fixture['province'],
                $fixture['city'],
            ),
        );
    }

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/matching",
    )->assertCreated();

    foreach ($lawyers->take(5) as $lawyer) {
        $this->postJson(
            "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$lawyer->id}",
        )->assertCreated();
    }

    $firstLawyer = $lawyers->first();

    $firstDistribution = $fixture['legal_request']
        ->distributions()
        ->where('lawyer_profile_id', $firstLawyer->id)
        ->firstOrFail();

    Sanctum::actingAs($firstLawyer->user);

    $this->postJson(
        "/api/lawyer/distributions/{$firstDistribution->id}/respond",
        ['action' => 'reject'],
    )
        ->assertOk()
        ->assertJsonPath('distribution.status', 'rejected');

    Sanctum::actingAs($fixture['client']);

    $sixthLawyer = $lawyers->get(5);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$sixthLawyer->id}",
    )
        ->assertCreated()
        ->assertJsonPath('distribution.status', 'pending');

    expect(
        $fixture['legal_request']
            ->distributions()
            ->where('status', 'pending')
            ->count(),
    )->toBe(5);

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $firstDistribution->id,
        'status' => 'rejected',
    ]);

    $this->assertDatabaseHas('legal_request_distributions', [
        'lawyer_profile_id' => $sixthLawyer->id,
        'status' => 'pending',
    ]);
});

test('an expired direct request frees one of the five open request slots', function () {
    $fixture = lawyerSelectionFixture();

    $lawyers = collect();

    for ($i = 1; $i <= 6; $i++) {
        $lawyers->push(
            lawyerSelectionLawyer(
                $fixture['specialty'],
                $fixture['province'],
                $fixture['city'],
            ),
        );
    }

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/matching",
    )->assertCreated();

    foreach ($lawyers->take(5) as $lawyer) {
        $this->postJson(
            "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$lawyer->id}",
        )->assertCreated();
    }

    $firstLawyer = $lawyers->first();

    $expiredDistribution = $fixture['legal_request']
        ->distributions()
        ->where('lawyer_profile_id', $firstLawyer->id)
        ->firstOrFail();

    $expiredDistribution->forceFill([
        'expires_at' => now()->subMinute(),
    ])->save();

    $sixthLawyer = $lawyers->get(5);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$sixthLawyer->id}",
    )
        ->assertCreated()
        ->assertJsonPath('distribution.status', 'pending');

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $expiredDistribution->id,
        'status' => 'expired',
    ]);

    $this->assertDatabaseHas('legal_request_distributions', [
        'lawyer_profile_id' => $sixthLawyer->id,
        'status' => 'pending',
    ]);

    expect(
        $fixture['legal_request']
            ->distributions()
            ->where('status', 'pending')
            ->count(),
    )->toBe(5);
});

test('an expired direct request is marked expired when the lawyer tries to respond', function () {
    $fixture = lawyerSelectionFixture();

    $lawyer = lawyerSelectionLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
    );

    Sanctum::actingAs($fixture['client']);

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/matching",
    )->assertCreated();

    $this->postJson(
        "/api/legal-requests/{$fixture['legal_request']->id}/lawyer-selection/{$lawyer->id}",
    )->assertCreated();

    $distribution = $fixture['legal_request']
        ->distributions()
        ->where('lawyer_profile_id', $lawyer->id)
        ->firstOrFail();

    $distribution->forceFill([
        'expires_at' => now()->subMinute(),
    ])->save();

    Sanctum::actingAs($lawyer->user);

    $this->postJson(
        "/api/lawyer/distributions/{$distribution->id}/respond",
        ['action' => 'accept'],
    )->assertStatus(409);

    $this->assertDatabaseHas('legal_request_distributions', [
        'id' => $distribution->id,
        'status' => 'expired',
    ]);

    $this->assertDatabaseCount('engagements', 0);
});