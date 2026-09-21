<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;

final class AdminAccess
{
    public static function isSuperAdmin(?User $user): bool
    {
        return $user !== null
            && $user->status === 'active'
            && $user->roles()->where('roles.code', 'super_admin')->exists();
    }

    public static function can(?User $user, string $permission): bool
    {
        if ($user === null || $user->status !== 'active') {
            return false;
        }

        if (self::isSuperAdmin($user)) {
            return true;
        }

        return DB::table('user_roles')
            ->join('roles', 'roles.id', '=', 'user_roles.role_id')
            ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('user_roles.user_id', $user->id)
            ->whereNull('user_roles.revoked_at')
            ->where('permissions.code', $permission)
            ->exists();
    }

    public static function isAdministrator(?User $user): bool
    {
        return $user !== null
            && $user->status === 'active'
            && $user->roles()
                ->whereIn('roles.code', ['admin', 'super_admin'])
                ->exists();
    }
}
