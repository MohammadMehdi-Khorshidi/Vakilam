<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\Consultation;
use App\Models\LawyerProfile;
use App\Models\LawyerVerification;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\Admin\AdminActionService;
use App\Support\AdminAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPanelController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $this->ensure($request, 'dashboard.view');

        return response()->json([
            'data' => [
                'stats' => [
                    'active_users' => User::query()->where('status', 'active')->count(),
                    'suspended_users' => User::query()->where('status', 'suspended')->count(),
                    'pending_lawyers' => LawyerVerification::query()->where('status', 'pending')->count(),
                    'legal_requests' => LegalRequest::query()->count(),
                    'consultations' => Consultation::query()->count(),
                ],
                'pending_lawyers' => LawyerVerification::query()
                    ->with('lawyerProfile:id,public_id,full_name,license_number')
                    ->where('status', 'pending')
                    ->latest('submitted_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (LawyerVerification $item) => [
                        'id' => $item->id,
                        'lawyer_public_id' => $item->lawyerProfile?->public_id,
                        'full_name' => $item->lawyerProfile?->full_name,
                        'license_number' => $item->lawyerProfile?->license_number,
                        'submitted_at' => $item->submitted_at,
                    ]),
                'recent_actions' => $this->activityQuery($request)
                    ->limit(6)
                    ->get()
                    ->map($this->actionMapper(...)),
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $this->ensure($request, 'users.view');

        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $items = User::query()
            ->with('roles:id,code,name')
            ->when($search !== '', function ($query) use ($search): void {
                $like = "%{$search}%";
                $query->where(function ($query) use ($like): void {
                    $query->where('name', 'like', $like)
                        ->orWhere('last_name', 'like', $like)
                        ->orWhere('phone', 'like', $like)
                        ->orWhere('public_id', 'like', $like);
                });
            })
            ->when(in_array($status, ['active', 'suspended', 'closed'], true), fn ($query) => $query->where('status', $status))
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'public_id' => $user->public_id,
                'name' => trim("{$user->name} {$user->last_name}"),
                'phone' => $user->phone,
                'email' => $user->email,
                'status' => $user->status,
                'roles' => $user->roles->pluck('code')->values(),
                'last_login_at' => $user->last_login_at,
                'created_at' => $user->created_at,
            ]);

        return response()->json(['data' => $items]);
    }

    public function setUserStatus(
        Request $request,
        User $user,
        AdminActionService $service,
    ): JsonResponse {
        $this->ensure($request, 'users.suspend');

        $data = $request->validate([
            'status' => ['required', 'in:active,suspended'],
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $service->setUserStatus(
            $request->user(),
            $user,
            $data['status'],
            $data['reason'],
        );

        return response()->json(['message' => 'وضعیت کاربر با موفقیت تغییر کرد.']);
    }

    public function lawyers(Request $request): JsonResponse
    {
        $this->ensure($request, 'lawyers.view');

        $status = trim((string) $request->query('status', ''));
        $search = trim((string) $request->query('search', ''));

        $items = LawyerProfile::query()
            ->with([
                'user:id,name,last_name,phone,email,status,last_login_at',
                'specialties:id,name',
                'serviceAreas.province:id,name',
                'serviceAreas.city:id,name,province_id',
                'verifications' => fn ($query) => $query->latest('submitted_at'),
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $like = "%{$search}%";
                $query->where(function ($query) use ($like): void {
                    $query->where('full_name', 'like', $like)
                        ->orWhere('license_number', 'like', $like)
                        ->orWhereHas('user', fn ($q) => $q->where('phone', 'like', $like))
                        ->orWhereHas('specialties', fn ($q) => $q->where('specialties.name', 'like', $like))
                        ->orWhereHas('serviceAreas.province', fn ($q) => $q->where('name', 'like', $like))
                        ->orWhereHas('serviceAreas.city', fn ($q) => $q->where('name', 'like', $like));
                });
            })
            ->when(
                in_array($status, ['pending', 'approved', 'rejected'], true),
                fn ($query) => $query->where('verification_status', $status),
            )
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (LawyerProfile $lawyer) => $this->lawyerSummary($lawyer));

        return response()->json(['data' => $items]);
    }

    public function lawyer(Request $request, LawyerProfile $lawyerProfile): JsonResponse
    {
        $this->ensure($request, 'lawyers.view');

        $lawyerProfile->load([
            'user:id,name,last_name,phone,email,status,last_login_at,created_at',
            'lawyerSpecialties.specialty:id,name,code',
            'serviceAreas.province:id,name',
            'serviceAreas.city:id,name,province_id',
            'verifications.reviewer:id,name,last_name',
        ]);

        return response()->json([
            'data' => [
                ...$this->lawyerSummary($lawyerProfile),
                'bio' => $lawyerProfile->bio,
                'created_at' => $lawyerProfile->created_at,
                'user' => [
                    'name' => trim(($lawyerProfile->user?->name ?? '').' '.($lawyerProfile->user?->last_name ?? '')),
                    'phone' => $lawyerProfile->user?->phone,
                    'email' => $lawyerProfile->user?->email,
                    'status' => $lawyerProfile->user?->status,
                    'last_login_at' => $lawyerProfile->user?->last_login_at,
                    'created_at' => $lawyerProfile->user?->created_at,
                ],
                'specialty_details' => $lawyerProfile->lawyerSpecialties
                    ->map(fn ($item) => [
                        'id' => $item->id,
                        'name' => $item->specialty?->name,
                        'code' => $item->specialty?->code,
                        'years_experience' => $item->years_experience,
                    ])
                    ->values(),
                'service_areas' => $lawyerProfile->serviceAreas
                    ->map(fn ($area) => [
                        'id' => $area->id,
                        'province' => $area->province?->name,
                        'city' => $area->city?->name,
                    ])
                    ->values(),
                'verifications' => $lawyerProfile->verifications
                    ->sortByDesc('submitted_at')
                    ->values()
                    ->map(fn (LawyerVerification $verification) => [
                        'id' => $verification->id,
                        'status' => $verification->status,
                        'review_note' => $verification->review_note,
                        'submitted_data' => $verification->submitted_data,
                        'submitted_at' => $verification->submitted_at,
                        'reviewed_at' => $verification->reviewed_at,
                        'reviewer' => $verification->reviewer
                            ? trim($verification->reviewer->name.' '.$verification->reviewer->last_name)
                            : null,
                    ]),
            ],
        ]);
    }

    public function reviewLawyer(
        Request $request,
        LawyerVerification $verification,
        AdminActionService $service,
    ): JsonResponse {
        $this->ensure($request, 'lawyers.verify');

        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($data['status'] === 'rejected' && trim((string) ($data['note'] ?? '')) === '') {
            return response()->json([
                'message' => 'برای رد وکیل، وارد کردن دلیل الزامی است.',
            ], 422);
        }

        $service->reviewLawyer(
            $request->user(),
            $verification,
            $data['status'],
            (string) ($data['note'] ?? ''),
        );

        return response()->json(['message' => 'وضعیت احراز وکیل ثبت شد.']);
    }

    public function legalRequests(Request $request): JsonResponse
    {
        $this->ensure($request, 'legal_requests.view');

        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $serviceIntent = trim((string) $request->query('service_intent', ''));

        $items = LegalRequest::query()
            ->with([
                'client:id,name,last_name,phone',
                'legalCategory:id,name',
                'province:id,name',
                'city:id,name',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $like = "%{$search}%";
                $query->where(function ($query) use ($like): void {
                    $query->where('title', 'like', $like)
                        ->orWhere('description', 'like', $like)
                        ->orWhere('public_id', 'like', $like)
                        ->orWhereHas('client', function ($client) use ($like): void {
                            $client->where('name', 'like', $like)
                                ->orWhere('last_name', 'like', $like)
                                ->orWhere('phone', 'like', $like);
                        })
                        ->orWhereHas('legalCategory', fn ($category) => $category->where('name', 'like', $like))
                        ->orWhereHas('province', fn ($province) => $province->where('name', 'like', $like))
                        ->orWhereHas('city', fn ($city) => $city->where('name', 'like', $like));
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($serviceIntent !== '', fn ($query) => $query->where('service_intent', $serviceIntent))
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (LegalRequest $item) => [
                'id' => $item->id,
                'public_id' => $item->public_id,
                'title' => $item->title,
                'description' => $item->description,
                'status' => $item->status,
                'service_intent' => $item->service_intent,
                'urgency' => $item->urgency,
                'client' => [
                    'name' => trim(($item->client?->name ?? '').' '.($item->client?->last_name ?? '')),
                    'phone' => $item->client?->phone,
                ],
                'category' => $item->legalCategory?->name,
                'province' => $item->province?->name,
                'city' => $item->city?->name,
                'created_at' => $item->created_at,
            ]);

        return response()->json(['data' => $items]);
    }

    public function consultations(Request $request): JsonResponse
    {
        $this->ensure($request, 'consultations.view');

        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $items = Consultation::query()
            ->with([
                'client:id,name,last_name,phone',
                'lawyerProfile:id,full_name',
                'legalRequest:id,public_id,title',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $like = "%{$search}%";
                $query->where(function ($query) use ($like): void {
                    $query->where('public_id', 'like', $like)
                        ->orWhereHas('client', function ($client) use ($like): void {
                            $client->where('name', 'like', $like)
                                ->orWhere('last_name', 'like', $like)
                                ->orWhere('phone', 'like', $like);
                        })
                        ->orWhereHas('lawyerProfile', fn ($lawyer) => $lawyer->where('full_name', 'like', $like))
                        ->orWhereHas('legalRequest', fn ($legalRequest) => $legalRequest->where('title', 'like', $like));
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Consultation $item) => [
                'id' => $item->id,
                'public_id' => $item->public_id,
                'status' => $item->status,
                'duration_minutes' => $item->duration_minutes,
                'price_rial' => $item->price_rial,
                'scheduled_start_at' => $item->scheduled_start_at,
                'scheduled_end_at' => $item->scheduled_end_at,
                'client' => [
                    'name' => trim(($item->client?->name ?? '').' '.($item->client?->last_name ?? '')),
                    'phone' => $item->client?->phone,
                ],
                'lawyer' => $item->lawyerProfile?->full_name,
                'request_title' => $item->legalRequest?->title,
            ]);

        return response()->json(['data' => $items]);
    }

    public function activity(Request $request): JsonResponse
    {
        abort_unless(
            AdminAccess::can($request->user(), 'audit.view_own')
                || AdminAccess::can($request->user(), 'audit.view_all'),
            403,
        );

        $search = trim((string) $request->query('search', ''));

        return response()->json([
            'data' => $this->activityQuery($request)
                ->when($search !== '', function ($query) use ($search): void {
                    $like = "%{$search}%";
                    $query->where(function ($query) use ($like): void {
                        $query->where('action_type', 'like', $like)
                            ->orWhere('reason', 'like', $like)
                            ->orWhere('target_type', 'like', $like)
                            ->orWhereHas('admin', function ($admin) use ($like): void {
                                $admin->where('name', 'like', $like)
                                    ->orWhere('last_name', 'like', $like);
                            });
                    });
                })
                ->limit(100)
                ->get()
                ->map($this->actionMapper(...)),
        ]);
    }

    public function admins(Request $request): JsonResponse
    {
        abort_unless(AdminAccess::isSuperAdmin($request->user()), 403);

        $items = User::query()
            ->with('roles:id,code,name')
            ->whereHas('roles', fn ($query) => $query->whereIn('roles.code', ['admin', 'super_admin']))
            ->latest()
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'public_id' => $user->public_id,
                'name' => trim("{$user->name} {$user->last_name}"),
                'phone' => $user->phone,
                'status' => $user->status,
                'roles' => $user->roles->pluck('code')->values(),
                'last_login_at' => $user->last_login_at,
            ]);

        return response()->json(['data' => $items]);
    }

    public function setAdminRole(
        Request $request,
        User $user,
        AdminActionService $service,
    ): JsonResponse {
        abort_unless(AdminAccess::isSuperAdmin($request->user()), 403);

        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $service->setAdminRole(
            $request->user(),
            $user,
            (bool) $data['enabled'],
            (string) ($data['reason'] ?? ''),
        );

        return response()->json(['message' => 'دسترسی ادمین به‌روزرسانی شد.']);
    }

    private function lawyerSummary(LawyerProfile $lawyer): array
    {
        $verification = $lawyer->verifications->sortByDesc('submitted_at')->first();

        return [
            'id' => $lawyer->id,
            'public_id' => $lawyer->public_id,
            'full_name' => $lawyer->full_name,
            'license_number' => $lawyer->license_number,
            'verification_status' => $lawyer->verification_status,
            'is_available' => $lawyer->is_available,
            'average_rating' => $lawyer->average_rating,
            'rating_count' => $lawyer->rating_count,
            'phone' => $lawyer->user?->phone,
            'email' => $lawyer->user?->email,
            'user_status' => $lawyer->user?->status,
            'last_login_at' => $lawyer->user?->last_login_at,
            'specialties' => $lawyer->specialties->pluck('name')->values(),
            'service_areas' => $lawyer->serviceAreas
                ->map(fn ($area) => [
                    'province' => $area->province?->name,
                    'city' => $area->city?->name,
                ])
                ->values(),
            'verification' => $verification ? [
                'id' => $verification->id,
                'status' => $verification->status,
                'review_note' => $verification->review_note,
                'submitted_at' => $verification->submitted_at,
                'reviewed_at' => $verification->reviewed_at,
            ] : null,
        ];
    }

    private function ensure(Request $request, string $permission): void
    {
        abort_unless(AdminAccess::can($request->user(), $permission), 403);
    }

    private function activityQuery(Request $request)
    {
        return AdminAction::query()
            ->with('admin:id,name,last_name')
            ->when(
                ! AdminAccess::can($request->user(), 'audit.view_all'),
                fn ($query) => $query->where('admin_user_id', $request->user()->id),
            )
            ->latest('created_at');
    }

    private function actionMapper(AdminAction $item): array
    {
        return [
            'id' => $item->id,
            'action_type' => $item->action_type,
            'target_type' => class_basename((string) $item->target_type),
            'target_id' => $item->target_id,
            'reason' => $item->reason,
            'created_at' => $item->created_at,
            'admin' => [
                'name' => trim(($item->admin?->name ?? '').' '.($item->admin?->last_name ?? '')),
            ],
        ];
    }
}
