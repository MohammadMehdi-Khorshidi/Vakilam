<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;
use UnitEnum;

use App\Models\LawyerVerification;
use App\Services\Admin\AdminActionService;
use App\Support\AdminAccess;
use Filament\Notifications\Notification;

class ReviewLawyers extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-shield-check';
    protected static string|UnitEnum|null $navigationGroup = 'کاربران';
    protected static ?string $navigationLabel = 'بررسی وکلا';
    protected static ?string $title = 'بررسی و تأیید وکلا';
    protected static ?int $navigationSort = 20;
    protected string $view = 'filament.pages.review-lawyers';

    public string $filter = 'pending';
    public string $search = '';
    public array $notes = [];

    public static function canAccess(): bool
    {
        return AdminAccess::can(auth()->user(), 'lawyers.view');
    }

    public function verifications()
    {
        return LawyerVerification::query()
            ->with([
                'lawyerProfile.user:id,name,last_name,phone,status',
                'lawyerProfile.specialties:id,name',
                'reviewer:id,name,last_name',
            ])
            ->when($this->filter !== '', fn ($query) => $query->where('status', $this->filter))
            ->when($this->search !== '', function ($query): void {
                $value = '%'.trim($this->search).'%';
                $query->whereHas('lawyerProfile', function ($query) use ($value): void {
                    $query->where('full_name', 'like', $value)
                        ->orWhere('license_number', 'like', $value)
                        ->orWhereHas('user', fn ($q) => $q->where('phone', 'like', $value));
                });
            })
            ->latest('submitted_at')
            ->limit(60)
            ->get();
    }

    public function approve(string $verificationId, AdminActionService $service): void
    {
        $service->reviewLawyer(
            auth()->user(),
            LawyerVerification::query()->findOrFail($verificationId),
            'approved',
            $this->notes[$verificationId] ?? '',
        );

        Notification::make()->title('وکیل تأیید شد و به او اعلان ارسال شد.')->success()->send();
    }

    public function reject(string $verificationId, AdminActionService $service): void
    {
        $note = trim($this->notes[$verificationId] ?? '');

        if ($note === '') {
            Notification::make()->title('برای رد وکیل، دلیل را وارد کنید.')->danger()->send();
            return;
        }

        $service->reviewLawyer(
            auth()->user(),
            LawyerVerification::query()->findOrFail($verificationId),
            'rejected',
            $note,
        );

        Notification::make()->title('درخواست وکیل رد شد و دلیل برای او ارسال شد.')->warning()->send();
    }
}
