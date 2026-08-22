<?php

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    Cache::flush();
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

test('a lawyer registration creates a pending profile and uuid role assignment', function () {
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
        'terms_accepted' => true,
        'verification_token' => $verificationToken,
    ])->assertCreated()->assertJsonPath('user.role', 'lawyer');

    $user = User::query()->where('phone', '09121111111')->firstOrFail();
    $assignment = $user->roleAssignments()->firstOrFail();

    expect($user->lawyerProfile?->verification_status)->toBe('pending')
        ->and(Str::isUuid($assignment->user_id))->toBeTrue()
        ->and(Str::isUuid($assignment->role_id))->toBeTrue();
});
