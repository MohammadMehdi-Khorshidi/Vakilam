<?php

use App\Models\ClientProfile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
});

test('an unknown phone continues to registration without an account error', function () {
    $otpResponse = $this->postJson('/api/auth/phone/send-otp', [
        'phone' => '09121234567',
    ])->assertOk()
        ->assertJsonMissingPath('requires_registration')
        ->assertJsonStructure([
            'message',
            'expires_in',
            'resend_after',
            'debug_otp',
        ]);

    $verificationResponse = $this->postJson('/api/auth/phone/verify-otp', [
        'phone' => '09121234567',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()
        ->assertJsonPath('requires_registration', true)
        ->assertJsonStructure(['verification_token', 'expires_in']);

    $this->postJson('/api/auth/register', [
        'first_name' => 'Ali',
        'last_name' => 'Ahmadi',
        'phone' => '09121234567',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'client',
        'terms_accepted' => true,
        'verification_token' => $verificationResponse->json('verification_token'),
    ])->assertCreated()
        ->assertJsonPath('user.role', 'client')
        ->assertJsonStructure(['access_token', 'user']);

    expect(User::query()->where('phone', '09121234567')->exists())->toBeTrue();
});

test('an existing active phone logs in through the same otp endpoints', function () {
    $user = User::factory()->create([
        'phone' => '09123334444',
        'status' => 'active',
    ]);

    $role = Role::query()->create([
        'code' => 'client',
        'name' => 'Client',
        'is_system' => true,
    ]);

    UserRole::query()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
        'granted_at' => now(),
    ]);

    ClientProfile::query()->create([
        'user_id' => $user->id,
        'full_name' => $user->name.' '.$user->last_name,
    ]);

    $otpResponse = $this->postJson('/api/auth/phone/send-otp', [
        'phone' => '09123334444',
    ])->assertOk()
        ->assertJsonMissingPath('requires_registration');

    $this->postJson('/api/auth/phone/verify-otp', [
        'phone' => '09123334444',
        'otp' => $otpResponse->json('debug_otp'),
        'device_name' => 'test-browser',
    ])->assertOk()
        ->assertJsonPath('requires_registration', false)
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.role', 'client')
        ->assertJsonStructure(['access_token', 'user']);

    expect($user->fresh()->last_login_at)->not->toBeNull();
    $this->assertDatabaseCount('personal_access_tokens', 1);
});

test('a suspended phone is not registered again after otp verification', function () {
    User::factory()->create([
        'phone' => '09125556666',
        'status' => 'suspended',
    ]);

    $otpResponse = $this->postJson('/api/auth/phone/send-otp', [
        'phone' => '09125556666',
    ])->assertOk();

    $this->postJson('/api/auth/phone/verify-otp', [
        'phone' => '09125556666',
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertForbidden()
        ->assertJsonPath(
            'message',
            'حساب کاربری شما فعال نیست. لطفاً با پشتیبانی تماس بگیرید.',
        );

    $this->assertDatabaseCount('personal_access_tokens', 0);
});
