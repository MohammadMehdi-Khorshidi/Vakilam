<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;
use UnitEnum;

use App\Models\LegalRequest;
use App\Support\AdminAccess;

class LegalRequestsOverview extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-document-text';
    protected static string|UnitEnum|null $navigationGroup = 'عملیات';
    protected static ?string $navigationLabel = 'درخواست‌های حقوقی';
    protected static ?string $title = 'درخواست‌های حقوقی';
    protected static ?int $navigationSort = 30;
    protected string $view = 'filament.pages.legal-requests-overview';

    public string $search = '';

    public static function canAccess(): bool
    {
        return AdminAccess::can(auth()->user(), 'legal_requests.view');
    }

    public function requests()
    {
        return LegalRequest::query()
            ->with([
                'client:id,name,last_name,phone',
                'legalCategory:id,name',
                'province:id,name',
                'city:id,name',
            ])
            ->when($this->search !== '', function ($query): void {
                $value = '%'.trim($this->search).'%';
                $query->where(function ($query) use ($value): void {
                    $query->where('title', 'like', $value)
                        ->orWhere('public_id', 'like', $value)
                        ->orWhereHas('client', fn ($q) => $q->where('phone', 'like', $value));
                });
            })
            ->latest()
            ->limit(80)
            ->get();
    }
}
