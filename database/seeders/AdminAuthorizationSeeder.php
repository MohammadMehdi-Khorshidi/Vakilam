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
            [
                'name' => 'Admin',
                'description' => 'مدیر سامانه',
                'is_system' => true,
            ],
        );

        $superAdmin = Role::updateOrCreate(
            ['code' => 'super_admin'],
            [
                'name' => 'Super Admin',
                'description' => 'مدیر ارشد سامانه',
                'is_system' => true,
            ],
        );

        $permissions = [
            ['dashboard.view', 'مشاهده داشبورد مدیریت', 'dashboard', false],
            ['users.view', 'مشاهده کاربران', 'users', false],
            ['users.suspend', 'تعلیق و فعال‌سازی کاربران', 'users', true],
            ['lawyers.view', 'مشاهده وکلا', 'lawyers', false],
            ['lawyers.verify', 'تأیید یا رد وکیل', 'lawyers', true],
            ['legal_requests.view', 'مشاهده درخواست‌های حقوقی', 'legal_requests', false],
            ['negotiations.view_metadata', 'مشاهده اطلاعات مدیریتی مذاکرات', 'negotiations', false],
            ['consultations.view', 'مشاهده مشاوره‌ها', 'consultations', false],
            ['payments.view', 'مشاهده پرداخت‌ها', 'payments', true],
            ['taxonomy.manage', 'مدیریت اطلاعات مرجع', 'taxonomy', true],
            ['audit.view_own', 'مشاهده فعالیت‌های مدیریتی خود', 'audit', false],
            ['audit.view_all', 'مشاهده کل لاگ مدیریتی', 'audit', true],
            ['admins.manage', 'مدیریت مدیران', 'system', true],
            ['system.settings', 'تنظیمات حساس سامانه', 'system', true],
        ];

        $models = [];

        foreach ($permissions as [$code, $name, $group, $sensitive]) {
            $models[$code] = Permission::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'group_code' => $group,
                    'description' => null,
                    'is_sensitive' => $sensitive,
                ],
            );
        }

        $adminPermissionCodes = [
            'dashboard.view',
            'users.view',
            'users.suspend',
            'lawyers.view',
            'lawyers.verify',
            'legal_requests.view',
            'negotiations.view_metadata',
            'consultations.view',
            'payments.view',
            'taxonomy.manage',
            'audit.view_own',
        ];

        foreach ($adminPermissionCodes as $code) {
            $this->attachPermission($admin->id, $models[$code]->id);
        }

        foreach ($models as $permission) {
            $this->attachPermission($superAdmin->id, $permission->id);
        }
    }

    private function attachPermission(string $roleId, string $permissionId): void
    {
        if (DB::table('role_permissions')
            ->where('role_id', $roleId)
            ->where('permission_id', $permissionId)
            ->exists()) {
            return;
        }

        DB::table('role_permissions')->insert([
            'id' => (string) Str::uuid(),
            'role_id' => $roleId,
            'permission_id' => $permissionId,
            'created_at' => now(),
        ]);
    }
}
