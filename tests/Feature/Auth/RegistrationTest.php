<?php

use Illuminate\Support\Facades\Cache;
use Laravel\Fortify\Features;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();

    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();

beforeEach(function () {
    Cache::flush();
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'last_name' => 'Example',
        'email' => 'test@example.com',
        'phone' => '09121234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertNoContent();
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
});
