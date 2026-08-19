<?php

use App\Models\City;
use App\Models\Province;

test('provinces can be listed without authentication', function () {
    Province::query()->create(['name' => 'تهران']);
    Province::query()->create(['name' => 'البرز']);

    $response = $this->getJson('/api/reference/provinces');

    $response
        ->assertOk()
        ->assertJsonCount(2, 'provinces')
        ->assertJsonStructure([
            'provinces' => [
                '*' => ['id', 'name'],
            ],
        ]);
});

test('only cities belonging to the selected province are returned', function () {
    $tehran = Province::query()->create(['name' => 'تهران']);
    $alborz = Province::query()->create(['name' => 'البرز']);

    City::query()->create([
        'name' => 'تهران',
        'province_id' => $tehran->id,
    ]);
    City::query()->create([
        'name' => 'شهریار',
        'province_id' => $tehran->id,
    ]);
    City::query()->create([
        'name' => 'کرج',
        'province_id' => $alborz->id,
    ]);

    $response = $this->getJson("/api/reference/provinces/{$tehran->id}/cities");

    $response
        ->assertOk()
        ->assertJsonCount(2, 'cities')
        ->assertJsonFragment([
            'name' => 'تهران',
            'province_id' => $tehran->id,
        ])
        ->assertJsonFragment([
            'name' => 'شهریار',
            'province_id' => $tehran->id,
        ])
        ->assertJsonMissing(['name' => 'کرج']);
});

test('an unknown province returns not found', function () {
    $this->getJson('/api/reference/provinces/999999/cities')->assertNotFound();
});
