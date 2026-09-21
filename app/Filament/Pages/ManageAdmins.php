<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;
use UnitEnum;

use App\Models\User;
use App\Services\Admin\AdminActionService;
use App\Support\AdminAccess;
use Filament\Notifications\Notification;

class ManageAdmins extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-key';
    protected static string|UnitEnum|null $navigationGroup = 'مدیریت ارشد';
    protected static ?string $navigationLabel = 'مدیران سامانه';
    protected static ?string $title = 'مدیریت ادمین‌ها';
    protected static ?int $navigationSort = 90;
    protected string $view = 'filament.pages.manage-admins';

    public string $search = '';
    public array $reasons = [];

    public static function canAccess(): bool
    {
        return AdminAccess::isSuperAdmin(auth()->user());
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
                        ->orWhere('phone', 'like', $value);
                });
            })
            ->latest()
            ->limit(60)
            ->get();
    }

    public function grant(string $userId, AdminActionService $service): void
    {
        $service->setAdminRole(
            auth()->user(),
            User::query()->findOrFail($userId),
            true,
            $this->reasons[$userId] ?? '',
        );

        Notification::make()->title('دسترسی ادمین فعال شد.')->success()->send();
    }

    public function revoke(string $userId, AdminActionService $service): void
    {
        $service->setAdminRole(
            auth()->user(),
            User::query()->findOrFail($userId),
            false,
            $this->reasons[$userId] ?? '',
        );

        Notification::make()->title('دسترسی ادمین لغو شد.')->warning()->send();
    }
}
