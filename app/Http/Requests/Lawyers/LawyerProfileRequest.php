<?php

namespace App\Http\Requests\Lawyers;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

abstract class LawyerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User|null $user */
        $user = $this->user();

        return $user instanceof User
            && $user->status === 'active'
            && $user->lawyerProfile()->exists()
            && $user->roles()
                ->where('roles.code', 'lawyer')
                ->wherePivotNull('revoked_at')
                ->exists();
    }
}
