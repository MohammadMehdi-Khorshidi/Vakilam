<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            LegalCategorySeeder::class,
            DocumentTypeSeeder::class,
            ProvinceSeeder::class,
            CitySeeder::class,
        ]);
    }
}
