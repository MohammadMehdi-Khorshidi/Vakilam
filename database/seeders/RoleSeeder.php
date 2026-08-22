<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed default system roles.
     */
    public function run(): void
    {
        Role::updateOrCreate(
            ['code' => 'client'],
            [
                'name' => 'Client',
                'description' => 'Client user role',
                'is_system' => true,
            ]
        );

        Role::updateOrCreate(
            ['code' => 'lawyer'],
            [
                'name' => 'Lawyer',
                'description' => 'Lawyer user role',
                'is_system' => true,
            ]
        );

        Role::updateOrCreate(
            ['code' => 'admin'],
            [
                'name' => 'Admin',
                'description' => 'Administrator role',
                'is_system' => true,
            ]
        );
    }
}