<?php

namespace App\Providers\Filament;

use App\Filament\Pages\AdminActivity;
use App\Filament\Pages\Auth\AdminLogin;
use App\Filament\Pages\ConsultationsOverview;
use App\Filament\Pages\LegalRequestsOverview;
use App\Filament\Pages\ManageAdmins;
use App\Filament\Pages\ManageUsers;
use App\Filament\Pages\ReviewLawyers;
use App\Filament\Widgets\AdminOverviewWidget;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login(AdminLogin::class)
            ->brandName('وکیلم | مدیریت')
            ->colors([
                'primary' => Color::Emerald,
                'warning' => Color::Amber,
            ])
            ->sidebarWidth('17rem')
            ->sidebarCollapsibleOnDesktop()
            ->pages([
                Dashboard::class,
                ReviewLawyers::class,
                ManageUsers::class,
                LegalRequestsOverview::class,
                ConsultationsOverview::class,
                AdminActivity::class,
                ManageAdmins::class,
            ])
            ->widgets([
                AdminOverviewWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
