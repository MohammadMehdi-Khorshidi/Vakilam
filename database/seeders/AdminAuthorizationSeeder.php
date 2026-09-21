<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminAuthorizationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Role::updateOrCreate(
            ['code' => 'admin'],
            ['name' => 'Admin', 'description' => 'مدیر سامانه', 'is_system' => true],
        );

        $superAdmin = Role::updateOrCreate(
            ['code' => 'super_admin'],
            ['name' => 'Super Admin', 'description' => 'مدیر ارشد سامانه', 'is_system' => true],
        );

        $definitions = [
            ['dashboard.view', 'مشاهده داشبورد مدیریت', 'dashboard', false],
            ['users.view', 'مشاهده کاربران', 'users', false],
            ['users.suspend', 'تعلیق و فعال‌سازی کاربران', 'users', true],
            ['lawyers.view', 'مشاهده وکلا', 'lawyers', false],
            ['lawyers.verify', 'تأیید یا رد وکیل', 'lawyers', true],
            ['legal_requests.view', 'مشاهده درخواست‌های حقوقی', 'legal_requests', false],
            ['consultations.view', 'مشاهده مشاوره‌ها', 'consultations', false],
            ['audit.view_own', 'مشاهده فعالیت‌های مدیریتی خود', 'audit', false],
            ['audit.view_all', 'مشاهده کل لاگ مدیریتی', 'audit', true],
            ['admins.manage', 'مدیریت مدیران', 'system', true],
        ];

        $permissions = [];

        foreach ($definitions as [$code, $name, $group, $sensitive]) {
            $permissions[$code] = Permission::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'group_code' => $group,
                    'description' => null,
                    'is_sensitive' => $sensitive,
                ],
            );
        }

        $knownPrototypeCodes = [
            'negotiations.view_metadata',
            'payments.view',
            'taxonomy.manage',
            'system.settings',
        ];

        $prototypeIds = Permission::query()
            ->whereIn('code', $knownPrototypeCodes)
            ->pluck('id');

        if ($prototypeIds->isNotEmpty()) {
            DB::table('role_permissions')
                ->whereIn('permission_id', $prototypeIds)
                ->delete();

            Permission::query()
                ->whereIn('id', $prototypeIds)
                ->delete();
        }

        $managedIds = collect($permissions)->pluck('id');

        DB::table('role_permissions')
            ->whereIn('permission_id', $managedIds)
            ->delete();

        foreach ([
            'dashboard.view',
            'users.view',
            'users.suspend',
            'lawyers.view',
            'lawyers.verify',
            'legal_requests.view',
            'consultations.view',
            'audit.view_own',
        ] as $code) {
            $this->attach($admin->id, $permissions[$code]->id);
        }

        foreach ($permissions as $permission) {
            $this->attach($superAdmin->id, $permission->id);
        }
    }

    private function attach(string $roleId, string $permissionId): void
    {
        DB::table('role_permissions')->insert([
            'id' => (string) Str::uuid(),
            'role_id' => $roleId,
            'permission_id' => $permissionId,
            'created_at' => now(),
        ]);
    }
}
