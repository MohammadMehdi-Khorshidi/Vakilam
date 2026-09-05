<?php

use App\Models\ClientProfile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\Hash;

test('a user can log in with phone and password', function () {
    $user = User::factory()->create([
        'phone' => '09121234567',
        'password' => Hash::make('password123'),
        'status' => 'active',
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
    expect($user->fresh()->last_login_at)->not->toBeNull();
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
        'status' => 'suspended',
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

test('login and user profile return active role profile status and next step', function () {
    $user = User::factory()->create([
        'phone' => '09123334444',
        'password' => Hash::make('password123'),
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

    $login = $this->postJson('/api/auth/login', [
        'phone' => '09123334444',
        'password' => 'password123',
    ])->assertOk()
        ->assertJsonPath('user.role', 'client')
        ->assertJsonPath('user.roles.0', 'client')
        ->assertJsonPath('user.profile.type', 'client')
        ->assertJsonPath('user.profile.status', 'ready')
        ->assertJsonPath('user.next_step', 'client_dashboard');

    $this->withToken($login->json('access_token'))
        ->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('role', 'client')
        ->assertJsonPath('next_step', 'client_dashboard');
});

test('a suspended user cannot keep using an existing sanctum token on protected api routes', function () {
    $user = User::factory()->create([
        'phone' => '09125556666',
        'status' => 'active',
    ]);

    $token = $user->createToken('existing-device')->plainTextToken;
    $user->forceFill(['status' => 'suspended'])->save();

    $this->withToken($token)
        ->getJson('/api/user')
        ->assertForbidden()
        ->assertJsonPath('message', 'This account is not active.');
});
