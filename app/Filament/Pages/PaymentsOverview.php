<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;
use UnitEnum;

use App\Models\Payment;
use App\Support\AdminAccess;

class PaymentsOverview extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-credit-card';
    protected static string|UnitEnum|null $navigationGroup = 'مالی';
    protected static ?string $navigationLabel = 'پرداخت‌ها';
    protected static ?string $title = 'پرداخت‌ها';
    protected static ?int $navigationSort = 50;
    protected string $view = 'filament.pages.payments-overview';

    public static function canAccess(): bool
    {
        return AdminAccess::can(auth()->user(), 'payments.view');
    }

    public function payments()
    {
        return Payment::query()
            ->with([
                'payer:id,name,last_name,phone',
                'invoice:id,public_id,total_rial,status',
            ])
            ->latest('created_at')
            ->limit(80)
            ->get();
    }
}
