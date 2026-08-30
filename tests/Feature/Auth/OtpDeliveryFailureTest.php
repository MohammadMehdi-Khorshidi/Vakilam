<?php

use App\Contracts\OtpSender;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    Cache::flush();
});

test('registration otp state is cleared when sms delivery fails', function () {
    $sender = Mockery::mock(OtpSender::class);
    $sender->shouldReceive('send')
        ->once()
        ->with('09121234567', Mockery::type('string'))
        ->andThrow(new RuntimeException('SMS provider unavailable.'));

    $this->app->instance(OtpSender::class, $sender);

    $this->postJson('/api/auth/register/send-otp', [
        'phone' => '09121234567',
    ])->assertStatus(503);

    expect(Cache::has('registration:otp:09121234567'))->toBeFalse()
        ->and(Cache::has('registration:resend:'.hash('sha256', '09121234567')))->toBeFalse();
});

test('password reset otp state is cleared when sms delivery fails', function () {
    User::factory()->create([
        'phone' => '09121234567',
        'password' => Hash::make('old-password'),
        'status' => 'active',
    ]);

    $sender = Mockery::mock(OtpSender::class);
    $sender->shouldReceive('send')
        ->once()
        ->with('09121234567', Mockery::type('string'))
        ->andThrow(new RuntimeException('SMS provider unavailable.'));

    $this->app->instance(OtpSender::class, $sender);

    $this->postJson('/api/auth/password/forgot/send-otp', [
        'phone' => '09121234567',
    ])->assertStatus(503);

    expect(Cache::has('password-reset:otp:'.hash('sha256', '09121234567')))->toBeFalse()
        ->and(Cache::has('password-reset:resend:'.hash('sha256', '09121234567')))->toBeFalse();
});
