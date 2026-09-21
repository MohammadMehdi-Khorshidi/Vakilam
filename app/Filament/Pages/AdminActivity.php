<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;
use UnitEnum;

use App\Models\AdminAction;
use App\Support\AdminAccess;

class AdminActivity extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static string|UnitEnum|null $navigationGroup = 'نظارت';
    protected static ?string $navigationLabel = 'لاگ مدیریتی';
    protected static ?string $title = 'لاگ فعالیت مدیران';
    protected static ?int $navigationSort = 50;
    protected string $view = 'filament.pages.admin-activity';

    public static function canAccess(): bool
    {
        $user = auth()->user();

        return AdminAccess::can($user, 'audit.view_own')
            || AdminAccess::can($user, 'audit.view_all');
    }

    public function actions()
    {
        $user = auth()->user();

        return AdminAction::query()
            ->with('admin:id,name,last_name')
            ->when(
                ! AdminAccess::can($user, 'audit.view_all'),
                fn ($query) => $query->where('admin_user_id', $user->id),
            )
            ->latest('created_at')
            ->limit(100)
            ->get();
    }
}
