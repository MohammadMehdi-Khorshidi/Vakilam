<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use JsonException;
use RuntimeException;

class CitySeeder extends Seeder
{
    /** @throws JsonException */
    public function run(): void
    {
        $path = database_path('data/iran_cities.json');
        $contents = file_get_contents($path);

        if (! is_string($contents)) {
            throw new RuntimeException('Iran city seed data could not be read.');
        }

        /** @var array<int, array{id: int, name: string, province_id: int}> $cities */
        $cities = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
        $now = now();

        collect($cities)
            ->map(fn (array $city): array => [
                'id' => $city['id'],
                'name' => $city['name'],
                'province_id' => $city['province_id'],
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->chunk(500)
            ->each(function (Collection $rows): void {
                DB::table('cities')->upsert(
                    $rows->all(),
                    ['id'],
                    ['name', 'province_id', 'updated_at'],
                );
            });
    }
}
