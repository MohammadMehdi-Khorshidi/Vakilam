<?php

use App\Models\LawyerProfile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Models\City;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\Province;
use App\Models\Specialty;
use Laravel\Sanctum\Sanctum;

function createAvailabilityLawyerAccount(): array
{
    $user = User::factory()->create();

    $role = Role::query()->firstOrCreate(
        ['code' => 'lawyer'],
        ['name' => 'وکیل', 'is_system' => true],
    );

    UserRole::query()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
        'granted_at' => now(),
    ]);

    $profile = LawyerProfile::query()->create([
        'user_id' => $user->id,
        'full_name' => trim($user->name.' '.$user->last_name),
    ]);

    return [$user, $profile];
}

test('a lawyer can publish an availability slot', function () {
    [$user, $profile] = createAvailabilityLawyerAccount();

    $startsAt = now()->addDay()->startOfHour();
    $endsAt = $startsAt->copy()->addMinutes(30);

    $response = $this->actingAs($user)->postJson('/api/lawyer/availabilities', [
        'starts_at' => $startsAt->toISOString(),
        'ends_at' => $endsAt->toISOString(),
        'note' => 'Consultation availability',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('availability.lawyer_profile_id', $profile->id)
        ->assertJsonPath('availability.status', 'open');

    $this->assertDatabaseHas('lawyer_availabilities', [
        'lawyer_profile_id' => $profile->id,
        'status' => 'open',
        'note' => 'Consultation availability',
    ]);
});

test('a lawyer cannot publish overlapping availability slots', function () {
    [$user, $profile] = createAvailabilityLawyerAccount();

    $startsAt = now()->addDay()->startOfHour();
    $endsAt = $startsAt->copy()->addHour();

    $profile->availabilities()->create([
        'starts_at' => $startsAt,
        'ends_at' => $endsAt,
        'status' => 'open',
    ]);

    $this->actingAs($user)->postJson('/api/lawyer/availabilities', [
        'starts_at' => $startsAt->copy()->addMinutes(30)->toISOString(),
        'ends_at' => $endsAt->copy()->addMinutes(30)->toISOString(),
    ])->assertUnprocessable();

    $this->assertDatabaseCount('lawyer_availabilities', 1);
});

test('a client can view only open future consultation slots for an eligible lawyer', function () {
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
        'description' => 'A submitted consultation request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => 'consultation',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $lawyerUser = User::factory()->create();

    $lawyer = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => $lawyerUser->name.' '.$lawyerUser->last_name,
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

    $openSlot = $lawyer->availabilities()->create([
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHour(),
        'status' => 'open',
    ]);

    $lawyer->availabilities()->create([
        'starts_at' => now()->addDays(2),
        'ends_at' => now()->addDays(2)->addHour(),
        'status' => 'blocked',
    ]);

    $lawyer->availabilities()->create([
        'starts_at' => now()->subDays(2),
        'ends_at' => now()->subDays(2)->addHour(),
        'status' => 'open',
    ]);

    Sanctum::actingAs($client);

    $this->getJson(
        "/api/legal-requests/{$legalRequest->id}/consultation-lawyersAdmin/{$lawyer->public_id}/slots"
    )
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slot_id', $openSlot->id)
        ->assertJsonPath('meta.count', 1);
});
