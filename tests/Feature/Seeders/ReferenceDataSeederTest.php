<?php

use Database\Seeders\CitySeeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DocumentTypeSeeder;
use Database\Seeders\LegalCategorySeeder;
use Database\Seeders\ProvinceSeeder;
use Database\Seeders\SpecialtySeeder;

test('reference data seeders populate the approved lookup data', function () {
    $this->seed(DatabaseSeeder::class);

    $this->assertDatabaseCount('legal_categories', 11);
    $this->assertDatabaseCount('specialties', 11);
    $this->assertDatabaseCount('document_types', 16);
    $this->assertDatabaseCount('provinces', 31);
    $this->assertDatabaseCount('cities', 1451);

    $this->assertDatabaseHas('legal_categories', [
        'code' => 'other',
        'name' => 'سایر',
        'status' => true,
    ]);
    $this->assertDatabaseHas('document_types', [
        'code' => 'other',
        'name' => 'سایر',
        'status' => true,
    ]);
    $this->assertDatabaseHas('specialties', [
        'code' => 'family',
        'name' => 'خانواده',
        'status' => true,
    ]);
    $this->assertDatabaseHas('provinces', [
        'id' => 123,
        'name' => 'تهران',
    ]);
    $this->assertDatabaseHas('cities', [
        'name' => 'تهران',
        'province_id' => 123,
    ]);
});

test('reference data seeders can be run repeatedly without creating extra rows', function () {
    foreach ([
        LegalCategorySeeder::class,
        SpecialtySeeder::class,
        DocumentTypeSeeder::class,
        ProvinceSeeder::class,
        CitySeeder::class,
    ] as $seeder) {
        $this->seed($seeder);
        $this->seed($seeder);
    }

    $this->assertDatabaseCount('legal_categories', 11);
    $this->assertDatabaseCount('specialties', 11);
    $this->assertDatabaseCount('document_types', 16);
    $this->assertDatabaseCount('provinces', 31);
    $this->assertDatabaseCount('cities', 1451);
});
