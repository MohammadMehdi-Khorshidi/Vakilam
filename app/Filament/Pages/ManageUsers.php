<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;
use UnitEnum;

use App\Models\User;
use App\Services\Admin\AdminActionService;
use App\Support\AdminAccess;
use Filament\Notifications\Notification;

class ManageUsers extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-users';
    protected static string|UnitEnum|null $navigationGroup = 'کاربران';
    protected static ?string $navigationLabel = 'کاربران';
    protected static ?string $title = 'مدیریت کاربران';
    protected static ?int $navigationSort = 10;
    protected string $view = 'filament.pages.manage-users';

    public string $search = '';
    public string $status = '';
    public array $reasons = [];

    public static function canAccess(): bool
    {
        return AdminAccess::can(auth()->user(), 'users.view');
    }

    public function users()
    {
        return User::query()
            ->with('roles:id,code,name')
            ->when($this->search !== '', function ($query): void {
                $value = '%'.trim($this->search).'%';
                $query->where(function ($query) use ($value): void {
                    $query->where('name', 'like', $value)
                        ->orWhere('last_name', 'like', $value)
                        ->orWhere('phone', 'like', $value)
                        ->orWhere('public_id', 'like', $value);
                });
            })
            ->when($this->status !== '', fn ($query) => $query->where('status', $this->status))
            ->latest()
            ->limit(60)
            ->get();
    }

    public function suspend(string $userId, AdminActionService $service): void
    {
        $service->setUserStatus(
            auth()->user(),
            User::query()->findOrFail($userId),
            'suspended',
            $this->reasons[$userId] ?? '',
        );

        Notification::make()->title('حساب کاربر تعلیق شد.')->success()->send();
    }

    public function activate(string $userId, AdminActionService $service): void
    {
        $service->setUserStatus(
            auth()->user(),
            User::query()->findOrFail($userId),
            'active',
            $this->reasons[$userId] ?? '',
        );

        Notification::make()->title('حساب کاربر فعال شد.')->success()->send();
    }
}
