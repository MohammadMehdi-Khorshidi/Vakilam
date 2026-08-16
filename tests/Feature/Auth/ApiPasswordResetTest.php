<?php

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    Cache::flush();
});

function createPasswordResetUser(array $attributes = []): User
{
    return User::factory()->create(array_merge([
        'phone' => '09121234567',
        'password' => Hash::make('old-password'),
        'status' => 'active',
    ], $attributes));
}

function issueResetToken($test, string $phone = '09121234567'): string
{
    $otpResponse = $test->postJson('/api/auth/password/forgot/send-otp', [
        'phone' => $phone,
    ])->assertOk();

    return $test->postJson('/api/auth/password/forgot/verify-otp', [
        'phone' => $phone,
        'otp' => $otpResponse->json('debug_otp'),
    ])->assertOk()->json('reset_token');
}

test('a registered active user can request a password reset otp', function () {
    createPasswordResetUser();

    $this->postJson('/api/auth/password/forgot/send-otp', [
        'phone' => '09121234567',
    ])->assertOk()
        ->assertJsonStructure(['message', 'expires_in', 'resend_after', 'debug_otp']);
});

test('an unknown or inactive user cannot request a password reset otp', function () {
    $this->postJson('/api/auth/password/forgot/send-otp', [
        'phone' => '09121234567',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('phone');

    createPasswordResetUser(['phone' => '09121111111', 'status' => 'suspended']);

    $this->postJson('/api/auth/password/forgot/send-otp', [
        'phone' => '09121111111',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('phone');
});

test('an otp cannot be resent before the cooldown ends', function () {
    createPasswordResetUser();

    $this->postJson('/api/auth/password/forgot/send-otp', [
        'phone' => '09121234567',
    ])->assertOk();

    $this->postJson('/api/auth/password/forgot/send-otp', [
        'phone' => '09121234567',
    ])->assertStatus(429)
        ->assertJsonPath('retry_after', 60);
});

test('a correct otp issues a short lived reset token and consumes the otp', function () {
    createPasswordResetUser();

    $otpResponse = $this->postJson('/api/auth/password/forgot/send-otp', [
        'phone' => '09121234567',
    ]);

    $payload = [
        'phone' => '09121234567',
        'otp' => $otpResponse->json('debug_otp'),
    ];

    $response = $this->postJson('/api/auth/password/forgot/verify-otp', $payload);

    $response->assertOk()
        ->assertJsonStructure(['message', 'reset_token', 'expires_in']);

    expect($response->json('reset_token'))->toHaveLength(64);

    $this->postJson('/api/auth/password/forgot/verify-otp', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('otp');
});

test('five invalid otp attempts consume the otp', function () {
    createPasswordResetUser();

    $this->postJson('/api/auth/password/forgot/send-otp', [
        'phone' => '09121234567',
    ])->assertOk();

    foreach (range(1, 5) as $attempt) {
        $this->postJson('/api/auth/password/forgot/verify-otp', [
            'phone' => '09121234567',
            'otp' => '000000',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('otp');
    }

    $this->postJson('/api/auth/password/forgot/verify-otp', [
        'phone' => '09121234567',
        'otp' => '000000',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('otp');
});

test('a verified user can set a different password and existing tokens are revoked', function () {
    $user = createPasswordResetUser();
    $user->createToken('mobile');
    $resetToken = issueResetToken($this);

    $this->postJson('/api/auth/password/reset', [
        'phone' => '09121234567',
        'reset_token' => $resetToken,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ])->assertOk()
        ->assertJsonPath('message', 'رمز عبور با موفقیت تغییر کرد؛ دوباره وارد شوید.');

    $user->refresh();

    expect(Hash::check('new-password', $user->password))->toBeTrue()
        ->and(Hash::check('old-password', $user->password))->toBeFalse();

    $this->assertDatabaseCount('personal_access_tokens', 0);

    $this->postJson('/api/auth/password/reset', [
        'phone' => '09121234567',
        'reset_token' => $resetToken,
        'password' => 'another-password',
        'password_confirmation' => 'another-password',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('reset_token');
});

test('the current password cannot be reused', function () {
    createPasswordResetUser();
    $resetToken = issueResetToken($this);

    $this->postJson('/api/auth/password/reset', [
        'phone' => '09121234567',
        'reset_token' => $resetToken,
        'password' => 'old-password',
        'password_confirmation' => 'old-password',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('password');

    $this->postJson('/api/auth/password/reset', [
        'phone' => '09121234567',
        'reset_token' => $resetToken,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ])->assertOk();
});

test('the reset token is bound to the verified phone', function () {
    createPasswordResetUser();
    $resetToken = issueResetToken($this);

    $this->postJson('/api/auth/password/reset', [
        'phone' => '09121111111',
        'reset_token' => $resetToken,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('reset_token');
});

test('password reset validates all required fields', function () {
    $this->postJson('/api/auth/password/reset', [
        'phone' => '1234',
        'reset_token' => 'short',
        'password' => '123',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['phone', 'reset_token', 'password']);
});
