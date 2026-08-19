<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use JsonException;
use RuntimeException;

class ProvinceSeeder extends Seeder
{
    /** @throws JsonException */
    public function run(): void
    {
        $path = database_path('data/iran_provinces.json');
        $contents = file_get_contents($path);

        if (! is_string($contents)) {
            throw new RuntimeException('Iran province seed data could not be read.');
        }

        /** @var array<int, array{id: int, name: string}> $provinces */
        $provinces = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
        $now = now();
        $rows = collect($provinces)->map(fn (array $province): array => [
            'id' => $province['id'],
            'name' => $province['name'],
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        DB::table('provinces')->upsert(
            $rows,
            ['id'],
            ['name', 'updated_at'],
        );
    }
}
