<?php

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\UniqueConstraintViolationException;

test('a user can have only one active assignment for the same role', function () {
    $user = User::factory()->create();

    $role = Role::query()->create([
        'code' => 'client',
        'name' => 'Client',
        'is_system' => true,
    ]);

    $firstAssignment = UserRole::query()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
        'granted_at' => now(),
    ]);

    expect(
        fn () => UserRole::query()->create([
            'user_id' => $user->id,
            'role_id' => $role->id,
            'granted_at' => now(),
        ]),
    )->toThrow(UniqueConstraintViolationException::class);

    $firstAssignment->forceFill([
        'revoked_at' => now(),
    ])->save();

    UserRole::query()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
        'granted_at' => now(),
    ]);

    expect(
        UserRole::query()
            ->where('user_id', $user->id)
            ->where('role_id', $role->id)
            ->whereNull('revoked_at')
            ->count(),
    )->toBe(1);

    expect(
        UserRole::query()
            ->where('user_id', $user->id)
            ->where('role_id', $role->id)
            ->count(),
    )->toBe(2);
});
