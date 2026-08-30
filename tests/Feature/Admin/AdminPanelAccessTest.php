<?php

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Filament\Panel;

test('only an active user with a non-revoked admin role can access the admin panel', function () {
    $panel = Panel::make()->id('admin');

    $adminRole = Role::query()->create([
        'code' => 'admin',
        'name' => 'Admin',
        'is_system' => true,
    ]);

    $admin = User::factory()->create([
        'status' => 'active',
    ]);

    $assignment = UserRole::query()->create([
        'user_id' => $admin->id,
        'role_id' => $adminRole->id,
        'granted_at' => now(),
    ]);

    expect($admin->canAccessPanel($panel))->toBeTrue()
        ->and($admin->roles()->where('code', 'admin')->exists())->toBeTrue();

    $assignment->forceFill([
        'revoked_at' => now(),
    ])->save();

    expect($admin->fresh()->canAccessPanel($panel))->toBeFalse()
        ->and($admin->fresh()->roles()->where('code', 'admin')->exists())->toBeFalse();

    $assignment->forceFill([
        'revoked_at' => null,
    ])->save();

    $admin->forceFill([
        'status' => 'suspended',
    ])->save();

    expect($admin->fresh()->canAccessPanel($panel))->toBeFalse();

    $client = User::factory()->create([
        'status' => 'active',
    ]);

    expect($client->canAccessPanel($panel))->toBeFalse();
});

test('an admin role does not grant access to another panel', function () {
    $adminRole = Role::query()->create([
        'code' => 'admin',
        'name' => 'Admin',
        'is_system' => true,
    ]);

    $admin = User::factory()->create([
        'status' => 'active',
    ]);

    UserRole::query()->create([
        'user_id' => $admin->id,
        'role_id' => $adminRole->id,
        'granted_at' => now(),
    ]);

    $otherPanel = Panel::make()->id('other');

    expect($admin->canAccessPanel($otherPanel))->toBeFalse();
});
