<?php

use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $this->get(route('register'))->assertOk();
});

test('new users can register with fields required by the user model', function () {
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
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'phone' => '09121234567',
        'last_name' => 'Example',
    ]);
});
