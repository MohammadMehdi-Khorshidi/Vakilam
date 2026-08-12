<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('a user can log in with phone and password', function () {
    $user = User::factory()->create([
        'phone' => '09121234567',
        'password' => Hash::make('password123'),
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'phone' => '09121234567',
        'password' => 'password123',
        'device_name' => 'postman',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.phone', '09121234567')
        ->assertJsonStructure(['message', 'token_type', 'access_token', 'user']);

    expect($response->json('access_token'))->toBeString()->not->toBeEmpty();
    $this->assertDatabaseCount('personal_access_tokens', 1);
});

test('a user cannot log in with an invalid password', function () {
    User::factory()->create([
        'phone' => '09121234567',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'phone' => '09121234567',
        'password' => 'wrong-password',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors('phone');

    $this->assertDatabaseCount('personal_access_tokens', 0);
});

test('an inactive user cannot log in', function () {
    User::factory()->create([
        'phone' => '09121234567',
        'password' => Hash::make('password123'),
        'is_active' => false,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'phone' => '09121234567',
        'password' => 'password123',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors('phone');

    $this->assertDatabaseCount('personal_access_tokens', 0);
});

test('login validates phone and password', function () {
    $response = $this->postJson('/api/auth/login', [
        'phone' => '1234',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['phone', 'password']);
});

test('an authenticated user can fetch their profile and log out', function () {
    $user = User::factory()->create([
        'phone' => '09121234567',
    ]);

    $token = $user->createToken('postman')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('id', $user->id);

    $this->withToken($token)
        ->postJson('/api/auth/logout')
        ->assertOk()
        ->assertJsonPath('message', 'خروج با موفقیت انجام شد.');

    $this->assertDatabaseCount('personal_access_tokens', 0);
    $this->app['auth']->forgetGuards();

    $this->withToken($token)
        ->getJson('/api/user')
        ->assertUnauthorized();
});
