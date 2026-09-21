<?php

namespace App\Services\Admin;

use App\Events\UserNotificationCreated;
use App\Models\AdminAction;
use App\Models\AuditLog;
use App\Models\LawyerVerification;
use App\Models\Role;
use App\Models\User;
use App\Models\UserNotification;
use App\Models\UserRole;
use App\Support\AdminAccess;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

class AdminActionService
{
    public function setUserStatus(
        User $actor,
        User $target,
        string $status,
        string $reason,
    ): void {
        abort_unless(AdminAccess::can($actor, 'users.suspend'), 403);
        abort_unless(in_array($status, ['active', 'suspended'], true), 422);
        abort_if($actor->id === $target->id, 422, 'نمی‌توانید وضعیت حساب خودتان را تغییر دهید.');

        if (
            ! AdminAccess::isSuperAdmin($actor)
            && $target->roles()->whereIn('roles.code', ['admin', 'super_admin'])->exists()
        ) {
            abort(403, 'ادمین عادی اجازه تغییر وضعیت مدیران را ندارد.');
        }

        DB::transaction(function () use ($actor, $target, $status, $reason): void {
            $target->forceFill(['status' => $status])->save();

            $title = $status === 'suspended'
                ? 'حساب شما توسط مدیریت تعلیق شد'
                : 'حساب شما توسط مدیریت فعال شد';

            $body = trim($reason) !== ''
                ? $reason
                : ($status === 'suspended'
                    ? 'برای پیگیری می‌توانید با پشتیبانی وکیلم در ارتباط باشید.'
                    : 'اکنون می‌توانید دوباره از حساب وکیلم استفاده کنید.');

            $this->record(
                $actor,
                'user.status.'.$status,
                $target,
                $reason,
                ['new_status' => $status],
            );

            $this->notify(
                $target,
                'admin.account_'.$status,
                $title,
                $body,
                ['status' => $status],
            );
        });
    }

    public function reviewLawyer(
        User $actor,
        LawyerVerification $verification,
        string $status,
        string $note,
    ): void {
        abort_unless(AdminAccess::can($actor, 'lawyers.verify'), 403);
        abort_unless(in_array($status, ['approved', 'rejected'], true), 422);

        $verification->loadMissing('lawyerProfile.user');

        DB::transaction(function () use ($actor, $verification, $status, $note): void {
            $verification->forceFill([
                'status' => $status,
                'review_note' => trim($note) ?: null,
                'reviewed_by' => $actor->id,
                'reviewed_at' => now(),
            ])->save();

            $verification->lawyerProfile->forceFill([
                'verification_status' => $status,
            ])->save();

            $user = $verification->lawyerProfile->user;

            $title = $status === 'approved'
                ? 'احراز هویت وکالت شما تأیید شد'
                : 'درخواست احراز هویت وکالت شما رد شد';

            $body = trim($note) !== ''
                ? $note
                : ($status === 'approved'
                    ? 'پروفایل وکیل شما تأیید شده و امکانات مربوط به وکلا فعال است.'
                    : 'برای اصلاح اطلاعات، بخش پروفایل وکیل را بررسی کنید.');

            $this->record(
                $actor,
                'lawyer.verification.'.$status,
                $verification->lawyerProfile,
                $note,
                ['verification_id' => $verification->id],
            );

            $this->notify(
                $user,
                'admin.lawyer_verification_'.$status,
                $title,
                $body,
                [
                    'verification_status' => $status,
                    'lawyer_public_id' => $verification->lawyerProfile->public_id,
                ],
            );
        });
    }

    public function setAdminRole(
        User $actor,
        User $target,
        bool $enabled,
        string $reason = '',
    ): void {
        abort_unless(AdminAccess::isSuperAdmin($actor), 403);
        abort_if($actor->id === $target->id && ! $enabled, 422, 'نمی‌توانید نقش مدیریت خودتان را حذف کنید.');

        $role = Role::query()->where('code', 'admin')->firstOrFail();

        DB::transaction(function () use ($actor, $target, $role, $enabled, $reason): void {
            $assignment = UserRole::query()
                ->where('user_id', $target->id)
                ->where('role_id', $role->id)
                ->latest('granted_at')
                ->first();

            if ($enabled) {
                if ($assignment) {
                    $assignment->forceFill([
                        'revoked_at' => null,
                        'granted_at' => $assignment->granted_at ?? now(),
                    ])->save();
                } else {
                    UserRole::query()->create([
                        'user_id' => $target->id,
                        'role_id' => $role->id,
                        'granted_at' => now(),
                        'revoked_at' => null,
                    ]);
                }
            } elseif ($assignment && $assignment->revoked_at === null) {
                $assignment->forceFill(['revoked_at' => now()])->save();
            }

            $this->record(
                $actor,
                $enabled ? 'admin.granted' : 'admin.revoked',
                $target,
                $reason,
            );

            $this->notify(
                $target,
                $enabled ? 'admin.role_granted' : 'admin.role_revoked',
                $enabled ? 'دسترسی مدیریت برای شما فعال شد' : 'دسترسی مدیریت شما لغو شد',
                trim($reason) ?: ($enabled
                    ? 'از این پس می‌توانید وارد پنل مدیریت وکیلم شوید.'
                    : 'دسترسی شما به پنل مدیریت وکیلم پایان یافته است.'),
            );
        });
    }

    private function record(
        User $actor,
        string $action,
        ?Model $target = null,
        ?string $reason = null,
        array $metadata = [],
    ): void {
        AdminAction::query()->create([
            'admin_user_id' => $actor->id,
            'action_type' => $action,
            'target_type' => $target?->getMorphClass(),
            'target_id' => $target?->getKey(),
            'reason' => trim((string) $reason) ?: null,
            'metadata' => $metadata ?: null,
        ]);

        AuditLog::query()->create([
            'actor_user_id' => $actor->id,
            'action' => $action,
            'target_type' => $target?->getMorphClass(),
            'target_id' => $target?->getKey(),
            'ip_address' => Request::ip(),
            'metadata' => [
                ...$metadata,
                'reason' => trim((string) $reason) ?: null,
            ],
        ]);
    }

    private function notify(
        User $user,
        string $type,
        string $title,
        ?string $body = null,
        array $data = [],
    ): void {
        $notification = UserNotification::query()->create([
            'user_id' => $user->id,
            'channel' => 'in_app',
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data ?: null,
            'status' => 'unread',
            'read_at' => null,
        ]);

        broadcast(new UserNotificationCreated(
            $user->public_id,
            $notification,
        ));
    }
}
