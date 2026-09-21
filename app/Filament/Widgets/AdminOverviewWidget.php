<?php

namespace App\Filament\Widgets;

use App\Models\Consultation;
use App\Models\LawyerVerification;
use App\Models\LegalRequest;
use App\Models\Payment;
use App\Models\User;
use App\Support\AdminAccess;
use Filament\Widgets\Widget;

class AdminOverviewWidget extends Widget
{
    protected string $view = 'filament.widgets.admin-overview';

    public static function canView(): bool
    {
        return AdminAccess::can(auth()->user(), 'dashboard.view');
    }

    public function stats(): array
    {
        return [
            'users' => User::query()->where('status', 'active')->count(),
            'pending_lawyers' => LawyerVerification::query()->where('status', 'pending')->count(),
            'requests' => LegalRequest::query()->count(),
            'consultations' => Consultation::query()->count(),
            'failed_payments' => Payment::query()->where('status', 'failed')->count(),
        ];
    }

    public function pendingLawyers()
    {
        return LawyerVerification::query()
            ->with('lawyerProfile:id,full_name,license_number')
            ->where('status', 'pending')
            ->latest('submitted_at')
            ->limit(5)
            ->get();
    }
}
