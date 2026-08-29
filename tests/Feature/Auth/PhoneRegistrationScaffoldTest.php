<?php

use App\Models\Policy;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

beforeEach(function () {
    Cache::flush();
    Storage::fake('local');
    config()->set(
        'lawyer_registry.path',
        Storage::disk('local')->path('lawyers.json'),
    );
    config()->set('lawyer_registry.records_key', null);
    config()->set('lawyer_registry.license_key', 'license_number');
    config()->set('lawyer_registry.phone_key', 'phone');
    config()->set('lawyer_registry.organization_key', 'organization');

    Storage::disk('local')->put('lawyers.json', json_encode([
        [
            'license_number' => '۱۲۳-۴۵',
            'phone' => '+989121111111',
            'organization' => 'Judiciary Center',
        ],
        [
            'license_number' => '12345',
            'phone' => '09122222222',
            'organization' => 'Bar Association',
        ],
    ], JSON_UNESCAPED_UNICODE));
});

test('a registration otp can be generated in the testing environment', function () {
    $response = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09121234567',
    ]);

    $response
        ->assertOk()
        ->assertJsonStructure(['message', 'expires_in', 'resend_after', 'debug_otp']);

    expect($response->json('debug_otp'))->toMatch('/^\d{6}$/');
});

test('a generated registration otp can be verified', function () {
    $otpResponse = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09121234567',
    ]);

    $response = $this->postJson('/api/auth/register/verify-otp', [
        'phone' => '09121234567',
        'otp' => $otpResponse->json('debug_otp'),
    ]);

    $response
        ->assertOk()
        ->assertJsonStructure(['message', 'verification_token', 'expires_in']);

    expect($response->json('verification_token'))->toHaveLength(64);
});

test('admin cannot be selected as a public registration role', function () {
    $response = $this->postJson('/api/auth/register', [
        'first_name' => 'Ali',
        'last_name' => 'Ahmadi',
        'phone' => '09121234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'admin',
        'terms_accepted' => true,
        'verification_token' => str_repeat('a', 64),
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors('role');
});

test('a verified client can register and receives an access token', function () {
    $otpResponse = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09121234567',
    ])->assertOk();
    $verificationToken = $this->postJson('/api/auth/register/verify-otp', [
        'phone' => '09121234567',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()->json('verification_token');

    $response = $this->postJson('/api/auth/register', [
        'first_name' => 'Ali',
        'last_name' => 'Ahmadi',
        'phone' => '09121234567',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'client',
        'terms_accepted' => true,
        'verification_token' => $verificationToken,
    ]);

    $response->assertCreated()
        ->assertJsonPath('message', 'Registered successfully.')
        ->assertJsonPath('user.role', 'client')
        ->assertJsonStructure(['token_type', 'access_token', 'user']);

    $user = User::query()->where('phone', '09121234567')->firstOrFail();
    expect(Hash::check('password123', $user->password))->toBeTrue()
        ->and($user->phone_verified_at)->not->toBeNull()
        ->and($user->clientProfile)->not->toBeNull()
        ->and($user->roles()->where('code', 'client')->exists())->toBeTrue();
});

test('a matching license and verified phone create an approved lawyer profile', function () {
    $otpResponse = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09121111111',
    ])->assertOk();
    $verificationToken = $this->postJson('/api/auth/register/verify-otp', [
        'phone' => '09121111111',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()->json('verification_token');

    $this->postJson('/api/auth/register', [
        'first_name' => 'Sara',
        'last_name' => 'Karimi',
        'phone' => '09121111111',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'lawyer',
        'license_number' => '123/45',
        'terms_accepted' => true,
        'verification_token' => $verificationToken,
    ])->assertCreated()->assertJsonPath('user.role', 'lawyer');

    $user = User::query()->where('phone', '09121111111')->firstOrFail();
    $assignment = $user->roleAssignments()->firstOrFail();

    expect($user->lawyerProfile?->verification_status)->toBe('approved')
        ->and($user->lawyerProfile?->license_number)->toBe('12345')
        ->and($user->lawyerProfile?->verifications()->count())->toBe(1)
        ->and($user->lawyerProfile?->verifications()->first()?->status)->toBe('approved')
        ->and($user->lawyerProfile?->verifications()->first()?->submitted_data['organization'])
        ->toBe('Judiciary Center')
        ->and($user->roles()->where('code', 'lawyer')->first()?->name)->toBe('Lawyer')
        ->and(Str::isUuid($assignment->user_id))->toBeTrue()
        ->and(Str::isUuid($assignment->role_id))->toBeTrue();
});

test('the same license number in two organizations is matched by verified phone', function () {
    $otpResponse = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09122222222',
    ])->assertOk();
    $verificationToken = $this->postJson('/api/auth/register/verify-otp', [
        'phone' => '09122222222',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()->json('verification_token');

    $this->postJson('/api/auth/register', [
        'first_name' => 'Reza',
        'last_name' => 'Ahmadi',
        'phone' => '09122222222',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'lawyer',
        'license_number' => '12345',
        'terms_accepted' => true,
        'verification_token' => $verificationToken,
    ])->assertCreated();

    $verification = User::query()
        ->where('phone', '09122222222')
        ->firstOrFail()
        ->lawyerProfile
        ->verifications()
        ->firstOrFail();

    expect($verification->submitted_data['organization'])
        ->toBe('Bar Association');
});

test('an invalid lawyer license is rejected without creating an account', function () {
    $otpResponse = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09123333333',
    ])->assertOk();
    $verificationToken = $this->postJson('/api/auth/register/verify-otp', [
        'phone' => '09123333333',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()->json('verification_token');

    $this->postJson('/api/auth/register', [
        'first_name' => 'Ali',
        'last_name' => 'Invalid',
        'phone' => '09123333333',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'lawyer',
        'license_number' => '99999',
        'terms_accepted' => true,
        'verification_token' => $verificationToken,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('license_number');

    expect(User::query()->where('phone', '09123333333')->exists())->toBeFalse();
});

test('a phone mismatch is rejected without creating an account', function () {
    $otpResponse = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09123333333',
    ])->assertOk();
    $verificationToken = $this->postJson('/api/auth/register/verify-otp', [
        'phone' => '09123333333',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()->json('verification_token');

    $this->postJson('/api/auth/register', [
        'first_name' => 'Ali',
        'last_name' => 'Mismatch',
        'phone' => '09123333333',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'lawyer',
        'license_number' => '12345',
        'terms_accepted' => true,
        'verification_token' => $verificationToken,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('phone');

    expect(User::query()->where('phone', '09123333333')->exists())->toBeFalse();
});

test('lawyer registration returns service unavailable when registry file is missing', function () {
    Storage::disk('local')->delete('lawyers.json');
    $otpResponse = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09121111111',
    ])->assertOk();
    $verificationToken = $this->postJson('/api/auth/register/verify-otp', [
        'phone' => '09121111111',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()->json('verification_token');

    $this->postJson('/api/auth/register', [
        'first_name' => 'Sara',
        'last_name' => 'Karimi',
        'phone' => '09121111111',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'lawyer',
        'license_number' => '12345',
        'terms_accepted' => true,
        'verification_token' => $verificationToken,
    ])->assertServiceUnavailable();
});

test('registration records acceptance of the current terms policy when configured', function () {
    $policy = Policy::query()->create([
        'type' => 'terms_of_service',
        'version' => '1.0',
        'title' => 'Terms of Service',
        'content' => 'Approved test terms.',
        'effective_from' => now()->subDay(),
        'is_current' => true,
        'published_at' => now()->subDay(),
    ]);

    $otpResponse = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09124444444',
    ])->assertOk();

    $verificationToken = $this->postJson('/api/auth/register/verify-otp', [
        'phone' => '09124444444',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()->json('verification_token');

    $this->postJson('/api/auth/register', [
        'first_name' => 'Policy',
        'last_name' => 'Client',
        'phone' => '09124444444',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'client',
        'terms_accepted' => true,
        'verification_token' => $verificationToken,
    ])->assertCreated();

    $user = User::query()->where('phone', '09124444444')->firstOrFail();

    $this->assertDatabaseHas('user_policy_acceptances', [
        'user_id' => $user->id,
        'policy_id' => $policy->id,
    ]);
});

test('registration does not record unpublished or future terms policies', function () {
    $unpublishedPolicy = Policy::query()->create([
        'type' => 'terms_of_service',
        'version' => 'draft',
        'title' => 'Draft Terms',
        'content' => 'Unpublished terms.',
        'effective_from' => now()->subDay(),
        'is_current' => true,
        'published_at' => null,
    ]);

    $futurePolicy = Policy::query()->create([
        'type' => 'terms_of_service',
        'version' => 'future',
        'title' => 'Future Terms',
        'content' => 'Future terms.',
        'effective_from' => now()->addDay(),
        'is_current' => true,
        'published_at' => now(),
    ]);

    $otpResponse = $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09125555555',
    ])->assertOk();

    $verificationToken = $this->postJson('/api/auth/register/verify-otp', [
        'phone' => '09125555555',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()->json('verification_token');

    $this->postJson('/api/auth/register', [
        'first_name' => 'Policy',
        'last_name' => 'Validation',
        'phone' => '09125555555',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'client',
        'terms_accepted' => true,
        'verification_token' => $verificationToken,
    ])->assertCreated();

    $user = User::query()
        ->where('phone', '09125555555')
        ->firstOrFail();

    $this->assertDatabaseMissing('user_policy_acceptances', [
        'user_id' => $user->id,
        'policy_id' => $unpublishedPolicy->id,
    ]);

    $this->assertDatabaseMissing('user_policy_acceptances', [
        'user_id' => $user->id,
        'policy_id' => $futurePolicy->id,
    ]);

    $this->assertDatabaseCount('user_policy_acceptances', 0);
});
