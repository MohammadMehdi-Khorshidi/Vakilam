<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class AuthenticatedUserResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing(['roles:id,code,name', 'roleAssignments.role:id,code', 'clientProfile', 'lawyerProfile']);

        $roles = $this->roles
            ->pluck('code')
            ->values()
            ->all();

        $hasRoleHistory = $this->roleAssignments->isNotEmpty();

        $primaryRole = collect(['super_admin', 'admin', 'lawyer', 'client'])
            ->first(fn (string $role): bool => in_array($role, $roles, true))
            ?? match (true) {
                ! $hasRoleHistory && $this->lawyerProfile !== null => 'lawyer',
                ! $hasRoleHistory && $this->clientProfile !== null => 'client',
                default => $roles[0] ?? null,
            };

        if ($primaryRole !== null && $roles === []) {
            $roles = [$primaryRole];
        }

        $profile = match ($primaryRole) {
            'lawyer' => $this->lawyerProfile === null
                ? ['type' => 'lawyer', 'status' => 'missing', 'public_id' => null]
                : [
                    'type' => 'lawyer',
                    'status' => $this->lawyerProfile->verification_status,
                    'public_id' => $this->lawyerProfile->public_id,
                ],
            'client' => [
                'type' => 'client',
                'status' => $this->clientProfile === null ? 'missing' : 'ready',
                'id' => $this->clientProfile?->id,
            ],
            default => null,
        };

        $nextStep = match (true) {
            $primaryRole === 'lawyer' && $this->lawyerProfile === null => 'complete_lawyer_profile',
            $primaryRole === 'lawyer' && $this->lawyerProfile?->verification_status !== 'approved' => 'lawyer_verification',
            $primaryRole === 'lawyer' => 'lawyer_dashboard',
            $primaryRole === 'client' && $this->clientProfile === null => 'complete_client_profile',
            $primaryRole === 'client' => 'client_dashboard',
            $primaryRole === 'admin' || $primaryRole === 'super_admin' => 'admin_dashboard',
            default => null,
        };

        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'name' => $this->name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'role' => $primaryRole,
            'roles' => $roles,
            'profile' => $profile,
            'next_step' => $nextStep,
        ];
    }
}
