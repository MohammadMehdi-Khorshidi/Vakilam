<?php

use App\Models\City;
use App\Models\LawyerProfile;
use App\Models\Province;
use App\Models\Specialty;
use App\Models\User;

function createDirectoryLawyer(array $attributes = []): LawyerProfile
{
    $user = User::factory()->create();

    return LawyerProfile::query()->create([
        'user_id' => $user->id,
        'full_name' => $user->name.' '.$user->last_name,
        'verification_status' => 'approved',
        'is_available' => true,
        ...$attributes,
    ]);
}

test('only approved and available lawyersAdmin are publicly listed', function () {
    $visible = createDirectoryLawyer(['full_name' => 'وکیل قابل نمایش']);
    createDirectoryLawyer([
        'full_name' => 'وکیل در انتظار',
        'verification_status' => 'pending',
    ]);
    createDirectoryLawyer([
        'full_name' => 'وکیل غیرفعال',
        'is_available' => false,
    ]);
    $suspended = createDirectoryLawyer(['full_name' => 'وکیل تعلیق‌شده']);
    $suspended->user->forceFill(['status' => 'suspended'])->save();

    $response = $this->getJson('/api/lawyersAdmin');

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.public_id', $visible->public_id)
        ->assertJsonMissing(['full_name' => 'وکیل در انتظار'])
        ->assertJsonMissing(['full_name' => 'وکیل غیرفعال'])
        ->assertJsonMissing(['full_name' => 'وکیل تعلیق‌شده']);

    $this->getJson("/api/lawyersAdmin/{$suspended->public_id}")
        ->assertNotFound();
});

test('lawyersAdmin can be filtered by specialty and service city', function () {
    $province = Province::query()->create(['name' => 'تهران']);
    $city = City::query()->create([
        'name' => 'تهران',
        'province_id' => $province->id,
    ]);
    $specialty = Specialty::query()->create([
        'code' => 'family',
        'name' => 'خانواده',
        'status' => true,
    ]);
    $matching = createDirectoryLawyer(['full_name' => 'وکیل خانواده']);
    $matching->lawyerSpecialties()->create([
        'specialty_id' => $specialty->id,
        'years_experience' => 10,
    ]);
    $matching->serviceAreas()->create([
        'province_id' => $province->id,
        'city_id' => null,
    ]);
    createDirectoryLawyer(['full_name' => 'وکیل دیگر']);

    $response = $this->getJson('/api/lawyersAdmin?'.http_build_query([
        'specialty_id' => $specialty->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
    ]));

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.public_id', $matching->public_id);
});

test('public lawyer detail uses public id and hides unapproved profiles', function () {
    $approved = createDirectoryLawyer();
    $pending = createDirectoryLawyer(['verification_status' => 'pending']);

    $this->getJson("/api/lawyersAdmin/{$approved->public_id}")
        ->assertOk()
        ->assertJsonPath('lawyer.public_id', $approved->public_id)
        ->assertJsonMissingPath('lawyer.id')
        ->assertJsonMissingPath('lawyer.license_number');

    $this->getJson("/api/lawyersAdmin/{$pending->public_id}")
        ->assertNotFound();
});

test('only active specialties are returned as reference data', function () {
    Specialty::query()->create([
        'code' => 'family',
        'name' => 'خانواده',
        'status' => true,
    ]);
    Specialty::query()->create([
        'code' => 'disabled',
        'name' => 'غیرفعال',
        'status' => false,
    ]);

    $this->getJson('/api/reference/specialties')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonFragment(['code' => 'family'])
        ->assertJsonMissing(['code' => 'disabled']);
});
