<?php

namespace Database\Seeders;

use App\Models\Specialty;
use Illuminate\Database\Seeder;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        $specialties = [
            ['code' => 'family', 'name' => 'خانواده'],
            ['code' => 'civil', 'name' => 'حقوقی'],
            ['code' => 'criminal', 'name' => 'کیفری'],
            ['code' => 'real_estate', 'name' => 'املاک'],
            ['code' => 'commercial', 'name' => 'تجاری و شرکت‌ها'],
            ['code' => 'labor', 'name' => 'کار و تأمین اجتماعی'],
            ['code' => 'administrative', 'name' => 'دیوان عدالت اداری'],
            ['code' => 'registration', 'name' => 'ثبتی'],
            ['code' => 'tax', 'name' => 'مالیاتی'],
            ['code' => 'banking', 'name' => 'بانکی'],
            ['code' => 'other', 'name' => 'سایر'],
        ];

        foreach ($specialties as $specialty) {
            Specialty::query()->updateOrCreate(
                ['code' => $specialty['code']],
                [
                    'name' => $specialty['name'],
                    'status' => true,
                ],
            );
        }
    }
}
