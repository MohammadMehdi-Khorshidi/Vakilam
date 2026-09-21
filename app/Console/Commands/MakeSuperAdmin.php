<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\AdminAuthorizationSeeder;
use Illuminate\Console\Command;

class MakeSuperAdmin extends Command
{
    protected $signature = 'vakilam:make-super-admin {phone : شماره موبایل کاربر موجود}';

    protected $description = 'Promote an existing active user to Vakilam super admin';

    public function handle(): int
    {
        $this->call('db:seed', [
            '--class' => AdminAuthorizationSeeder::class,
            '--force' => true,
        ]);

        $phone = (string) $this->argument('phone');

        $user = User::query()->where('phone', $phone)->first();

        if (! $user) {
            $this->error('کاربری با این شماره موبایل پیدا نشد.');

            return self::FAILURE;
        }

        $user->forceFill(['status' => 'active'])->save();

        foreach (['admin', 'super_admin'] as $code) {
            $role = Role::query()->where('code', $code)->firstOrFail();

            $assignment = UserRole::query()
                ->where('user_id', $user->id)
                ->where('role_id', $role->id)
                ->latest('granted_at')
                ->first();

            if ($assignment) {
                $assignment->forceFill([
                    'revoked_at' => null,
                    'granted_at' => $assignment->granted_at ?? now(),
                ])->save();
            } else {
                UserRole::query()->create([
                    'user_id' => $user->id,
                    'role_id' => $role->id,
                    'granted_at' => now(),
                    'revoked_at' => null,
                ]);
            }
        }

        $this->info("سوپر ادمین فعال شد: {$user->name} {$user->last_name} ({$phone})");
        $this->warn('برای امنیت، ساخت سوپر ادمین از پنل انجام نمی‌شود و فقط همین فرمان CLI مجاز است.');

        return self::SUCCESS;
    }
}
