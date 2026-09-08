<?php

namespace Database\Seeders;

use App\Models\LawyerProfile;
use App\Models\LawyerServiceArea;
use App\Models\LawyerSpecialty;
use App\Models\Province;
use App\Models\Role;
use App\Models\Specialty;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestLawyerSeeder extends Seeder
{
    public function run(): void
    {
        $lawyerRole = Role::query()->where('code', 'lawyer')->firstOrFail();
        $specialties = Specialty::query()->where('status', true)->get()->keyBy('code');
        $provinces = Province::query()->with('cities')->whereHas('cities')->take(4)->get();

        if ($provinces->isEmpty()) {
            throw new \RuntimeException('Run ProvinceSeeder and CitySeeder first.');
        }

        $items = [
            ['علی', 'رضایی', '09120001001', 'TEST-1001', 'family', 18, 4.90, 120, 0, 0, false],
            ['مریم', 'احمدی', '09120001002', 'TEST-1002', 'family', 12, 4.70, 80, 0, 0, false],
            ['حسین', 'کریمی', '09120001003', 'TEST-1003', 'family', 7, 4.30, 35, 0, 0, false],
            ['زهرا', 'محمدی', '09120001004', 'TEST-1004', 'family', 20, 4.80, 100, 0, 0, true],
            ['رضا', 'حسینی', '09120001005', 'TEST-1005', 'family', 3, 5.00, 10, 0, 0, false],
            ['سارا', 'موسوی', '09120001006', 'TEST-1006', 'civil', 15, 4.60, 60, 0, 0, false],
            ['امیر', 'اکبری', '09120001007', 'TEST-1007', 'criminal', 10, 4.50, 55, 0, 0, false],
            ['نگار', 'جعفری', '09120001008', 'TEST-1008', 'real_estate', 9, 4.40, 42, 0, 0, false],
            ['محمد', 'صادقی', '09120001009', 'TEST-1009', 'commercial', 14, 4.75, 70, 1, 0, false],
            ['الهام', 'مرادی', '09120001010', 'TEST-1010', 'labor', 6, 4.20, 25, 0, 1, false],
        ];

        DB::transaction(function () use ($items, $lawyerRole, $specialties, $provinces): void {
            foreach ($items as $item) {
                [$name, $lastName, $phone, $license, $specialtyCode, $experience,
                    $rating, $ratingCount, $provinceIndex, $cityIndex, $wholeProvince] = $item;

                $user = User::query()->updateOrCreate(
                    ['phone' => $phone],
                    [
                        'name' => $name,
                        'last_name' => $lastName,
                        'password' => '12345678',
                    ],
                );

                $user->forceFill([
                    'status' => 'active',
                    'phone_verified_at' => now(),
                ])->save();

                UserRole::query()->updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'role_id' => $lawyerRole->id,
                    ],
                    [
                        'granted_at' => now(),
                        'revoked_at' => null,
                    ],
                );

                $profile = LawyerProfile::query()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'full_name' => "{$name} {$lastName}",
                        'license_number' => $license,
                        'bio' => 'وکیل آزمایشی وکیلم',
                        'verification_status' => 'approved',
                        'average_rating' => $rating,
                        'rating_count' => $ratingCount,
                        'is_available' => true,
                    ],
                );

                $specialty = $specialties->get($specialtyCode);

                LawyerSpecialty::query()->updateOrCreate(
                    [
                        'lawyer_profile_id' => $profile->id,
                        'specialty_id' => $specialty->id,
                    ],
                    ['years_experience' => $experience],
                );

                $province = $provinces->get($provinceIndex) ?? $provinces->first();
                $city = $province->cities->get($cityIndex) ?? $province->cities->first();

                LawyerServiceArea::query()
                    ->where('lawyer_profile_id', $profile->id)
                    ->delete();

                LawyerServiceArea::query()->create([
                    'lawyer_profile_id' => $profile->id,
                    'province_id' => $province->id,
                    'city_id' => $wholeProvince ? null : $city->id,
                ]);
            }
        });

        $this->command?->info('10 test lawyers created.');
    }
}
