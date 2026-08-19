<?php

namespace Database\Seeders;

use App\Models\LegalCategory;
use Illuminate\Database\Seeder;

class LegalCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
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

        foreach ($categories as $sortOrder => $category) {
            LegalCategory::query()->updateOrCreate(
                ['code' => $category['code']],
                [
                    'name' => $category['name'],
                    'status' => true,
                    'sort_order' => $sortOrder + 1,
                ],
            );
        }
    }
}
