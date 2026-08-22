<?php

use App\Models\City;
use App\Models\LawyerProfile;
use App\Models\Province;
use App\Models\Role;
use App\Models\Specialty;
use App\Models\User;
use App\Models\UserRole;

function createLawyerAccount(array $profileAttributes = []): array
{
    $user = User::factory()->create([
        'name' => 'محمد',
        'last_name' => 'رضایی',
    ]);
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
        'full_name' => $user->name.' '.$user->last_name,
        ...$profileAttributes,
    ]);

    return [$user, $profile];
}

test('an active lawyer can fetch their complete profile', function () {
    [$user, $profile] = createLawyerAccount([
        'license_number' => 'LIC-123',
        'bio' => 'وکیل پایه یک دادگستری',
    ]);

    $response = $this->actingAs($user)->getJson('/api/lawyer/profile');

    $response
        ->assertOk()
        ->assertJsonPath('lawyer_profile.id', $profile->id)
        ->assertJsonPath('lawyer_profile.first_name', 'محمد')
        ->assertJsonPath('lawyer_profile.last_name', 'رضایی')
        ->assertJsonPath('lawyer_profile.license_number', 'LIC-123')
        ->assertJsonPath('lawyer_profile.verification_status', 'pending')
        ->assertJsonStructure([
            'lawyer_profile' => [
                'id',
                'public_id',
                'first_name',
                'last_name',
                'full_name',
                'phone',
                'license_number',
                'bio',
                'verification_status',
                'average_rating',
                'rating_count',
                'is_available',
                'specialties',
                'service_areas',
                'created_at',
                'updated_at',
            ],
        ]);
});

test('a client cannot manage a lawyer profile', function () {
    $client = User::factory()->create();
    $role = Role::query()->create([
        'code' => 'client',
        'name' => 'موکل',
        'is_system' => true,
    ]);
    UserRole::query()->create([
        'user_id' => $client->id,
        'role_id' => $role->id,
        'granted_at' => now(),
    ]);

    $this->actingAs($client)
        ->getJson('/api/lawyer/profile')
        ->assertForbidden();
});

test('a lawyer can update account and profile fields without changing verification status', function () {
    [$user, $profile] = createLawyerAccount([
        'verification_status' => 'pending',
        'license_number' => '987654',
    ]);

    $response = $this->actingAs($user)->patchJson('/api/lawyer/profile', [
        'first_name' => 'مهدی',
        'last_name' => 'محمدی',
        'bio' => 'متخصص دعاوی خانواده',
        'is_available' => false,
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('lawyer_profile.full_name', 'مهدی محمدی')
        ->assertJsonPath('lawyer_profile.license_number', '987654')
        ->assertJsonPath('lawyer_profile.is_available', false)
        ->assertJsonPath('lawyer_profile.verification_status', 'pending');

    expect($user->fresh()->name)->toBe('مهدی')
        ->and($user->fresh()->last_name)->toBe('محمدی')
        ->and($profile->fresh()->full_name)->toBe('مهدی محمدی');
});

test('a verified license cannot be changed through profile completion', function () {
    [$user] = createLawyerAccount([
        'verification_status' => 'approved',
        'license_number' => '12345',
    ]);

    $this->actingAs($user)->patchJson('/api/lawyer/profile', [
        'license_number' => '99999',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('license_number');
});

test('a lawyer can complete profile specialties and service areas in one request', function () {
    [$user, $profile] = createLawyerAccount();
    $specialty = Specialty::query()->create([
        'code' => 'family',
        'name' => 'خانواده',
        'status' => true,
    ]);
    $province = Province::query()->create(['name' => 'تهران']);
    $city = City::query()->create([
        'name' => 'تهران',
        'province_id' => $province->id,
    ]);

    $response = $this->actingAs($user)->patchJson('/api/lawyer/profile', [
        'first_name' => 'مهدی',
        'bio' => 'متخصص دعاوی خانواده',
        'is_available' => true,
        'specialties' => [
            [
                'specialty_id' => $specialty->id,
                'years_experience' => 7,
            ],
        ],
        'service_areas' => [
            [
                'province_id' => $province->id,
                'city_id' => $city->id,
            ],
        ],
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('lawyer_profile.first_name', 'مهدی')
        ->assertJsonPath('lawyer_profile.bio', 'متخصص دعاوی خانواده')
        ->assertJsonCount(1, 'lawyer_profile.specialties')
        ->assertJsonCount(1, 'lawyer_profile.service_areas');

    expect($profile->fresh()->bio)->toBe('متخصص دعاوی خانواده')
        ->and($profile->lawyerSpecialties()->count())->toBe(1)
        ->and($profile->serviceAreas()->count())->toBe(1);
});

test('omitted completion sections remain unchanged and empty arrays clear them', function () {
    [$user, $profile] = createLawyerAccount(['bio' => 'بیوگرافی قبلی']);
    $specialty = Specialty::query()->create([
        'code' => 'civil',
        'name' => 'حقوقی',
        'status' => true,
    ]);
    $province = Province::query()->create(['name' => 'البرز']);
    $profile->lawyerSpecialties()->create([
        'specialty_id' => $specialty->id,
        'years_experience' => 5,
    ]);
    $profile->serviceAreas()->create([
        'province_id' => $province->id,
        'city_id' => null,
    ]);

    $this->actingAs($user)->patchJson('/api/lawyer/profile', [
        'is_available' => false,
    ])->assertOk();

    expect($profile->lawyerSpecialties()->count())->toBe(1)
        ->and($profile->serviceAreas()->count())->toBe(1);

    $this->actingAs($user)->patchJson('/api/lawyer/profile', [
        'specialties' => [],
        'service_areas' => [],
    ])->assertOk()
        ->assertJsonCount(0, 'lawyer_profile.specialties')
        ->assertJsonCount(0, 'lawyer_profile.service_areas');

    expect($profile->lawyerSpecialties()->count())->toBe(0)
        ->and($profile->serviceAreas()->count())->toBe(0)
        ->and($profile->fresh()->bio)->toBe('بیوگرافی قبلی');
});

test('invalid aggregate profile data does not partially update the profile', function () {
    [$user, $profile] = createLawyerAccount(['bio' => 'قبل']);
    $tehran = Province::query()->create(['name' => 'تهران']);
    $alborz = Province::query()->create(['name' => 'البرز']);
    $karaj = City::query()->create([
        'name' => 'کرج',
        'province_id' => $alborz->id,
    ]);

    $this->actingAs($user)->patchJson('/api/lawyer/profile', [
        'bio' => 'بعد',
        'service_areas' => [
            [
                'province_id' => $tehran->id,
                'city_id' => $karaj->id,
            ],
        ],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('service_areas.0.city_id');

    expect($profile->fresh()->bio)->toBe('قبل')
        ->and($profile->serviceAreas()->count())->toBe(0);
});

test('a lawyer can replace their active specialties', function () {
    [$user, $profile] = createLawyerAccount();
    $family = Specialty::query()->create([
        'code' => 'family',
        'name' => 'خانواده',
        'status' => true,
    ]);
    $criminal = Specialty::query()->create([
        'code' => 'criminal',
        'name' => 'کیفری',
        'status' => true,
    ]);

    $response = $this->actingAs($user)->putJson('/api/lawyer/profile/specialties', [
        'specialties' => [
            ['specialty_id' => $family->id, 'years_experience' => 8],
            ['specialty_id' => $criminal->id, 'years_experience' => 3],
        ],
    ]);

    $response
        ->assertOk()
        ->assertJsonCount(2, 'specialties')
        ->assertJsonFragment([
            'specialty_id' => $family->id,
            'years_experience' => 8,
        ]);

    expect($profile->lawyerSpecialties()->count())->toBe(2);

    $this->actingAs($user)->putJson('/api/lawyer/profile/specialties', [
        'specialties' => [
            ['specialty_id' => $criminal->id, 'years_experience' => 4],
        ],
    ])->assertOk();

    expect($profile->lawyerSpecialties()->count())->toBe(1)
        ->and($profile->lawyerSpecialties()->first()->specialty_id)->toBe($criminal->id);
});

test('inactive and duplicate specialties are rejected', function () {
    [$user] = createLawyerAccount();
    $inactive = Specialty::query()->create([
        'code' => 'inactive',
        'name' => 'غیرفعال',
        'status' => false,
    ]);

    $this->actingAs($user)->putJson('/api/lawyer/profile/specialties', [
        'specialties' => [
            ['specialty_id' => $inactive->id],
        ],
    ])->assertUnprocessable();
});

test('a lawyer can clear all specialties', function () {
    [$user, $profile] = createLawyerAccount();
    $specialty = Specialty::query()->create([
        'code' => 'family',
        'name' => 'خانواده',
        'status' => true,
    ]);
    $profile->lawyerSpecialties()->create([
        'specialty_id' => $specialty->id,
        'years_experience' => 2,
    ]);

    $this->actingAs($user)->putJson('/api/lawyer/profile/specialties', [
        'specialties' => [],
    ])->assertOk()->assertJsonCount(0, 'specialties');

    expect($profile->lawyerSpecialties()->count())->toBe(0);
});

test('a lawyer can replace service areas and a null city covers the province', function () {
    [$user, $profile] = createLawyerAccount();
    $tehran = Province::query()->create(['name' => 'تهران']);
    $alborz = Province::query()->create(['name' => 'البرز']);
    $karaj = City::query()->create([
        'name' => 'کرج',
        'province_id' => $alborz->id,
    ]);

    $response = $this->actingAs($user)->putJson('/api/lawyer/profile/service-areas', [
        'service_areas' => [
            ['province_id' => $tehran->id, 'city_id' => null],
            ['province_id' => $alborz->id, 'city_id' => $karaj->id],
        ],
    ]);

    $response
        ->assertOk()
        ->assertJsonCount(2, 'service_areas')
        ->assertJsonFragment(['covers_entire_province' => true]);

    expect($profile->serviceAreas()->count())->toBe(2);
});

test('a city must belong to its selected province', function () {
    [$user] = createLawyerAccount();
    $tehran = Province::query()->create(['name' => 'تهران']);
    $alborz = Province::query()->create(['name' => 'البرز']);
    $karaj = City::query()->create([
        'name' => 'کرج',
        'province_id' => $alborz->id,
    ]);

    $this->actingAs($user)->putJson('/api/lawyer/profile/service-areas', [
        'service_areas' => [
            ['province_id' => $tehran->id, 'city_id' => $karaj->id],
        ],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('service_areas.0.city_id');
});

test('duplicate service areas are rejected before writing', function () {
    [$user, $profile] = createLawyerAccount();
    $province = Province::query()->create(['name' => 'تهران']);

    $this->actingAs($user)->putJson('/api/lawyer/profile/service-areas', [
        'service_areas' => [
            ['province_id' => $province->id, 'city_id' => null],
            ['province_id' => $province->id, 'city_id' => null],
        ],
    ])->assertUnprocessable();

    expect($profile->serviceAreas()->count())->toBe(0);
});
