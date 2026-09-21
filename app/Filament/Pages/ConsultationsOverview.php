<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;
use UnitEnum;

use App\Models\Consultation;
use App\Support\AdminAccess;

class ConsultationsOverview extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-calendar-days';
    protected static string|UnitEnum|null $navigationGroup = 'عملیات';
    protected static ?string $navigationLabel = 'مشاوره‌ها';
    protected static ?string $title = 'مشاوره‌ها';
    protected static ?int $navigationSort = 40;
    protected string $view = 'filament.pages.consultations-overview';

    public static function canAccess(): bool
    {
        return AdminAccess::can(auth()->user(), 'consultations.view');
    }

    public function consultations()
    {
        return Consultation::query()
            ->with([
                'client:id,name,last_name,phone',
                'lawyerProfile:id,full_name',
                'legalRequest:id,public_id,title',
            ])
            ->latest()
            ->limit(80)
            ->get();
    }
}
