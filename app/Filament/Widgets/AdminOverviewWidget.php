<?php

namespace App\Filament\Widgets;

use App\Models\AdminAction;
use App\Models\Consultation;
use App\Models\LawyerVerification;
use App\Models\LegalRequest;
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
            'active_users' => User::query()->where('status', 'active')->count(),
            'suspended_users' => User::query()->where('status', 'suspended')->count(),
            'pending_lawyers' => LawyerVerification::query()->where('status', 'pending')->count(),
            'legal_requests' => LegalRequest::query()->count(),
            'consultations' => Consultation::query()->count(),
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

    public function recentActions()
    {
        $user = auth()->user();

        return AdminAction::query()
            ->with('admin:id,name,last_name')
            ->when(
                ! AdminAccess::can($user, 'audit.view_all'),
                fn ($query) => $query->where('admin_user_id', $user->id),
            )
            ->latest('created_at')
            ->limit(6)
            ->get();
    }
}
