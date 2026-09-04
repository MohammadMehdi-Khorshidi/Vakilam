<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\LawyerProfile;
use App\Models\User;
use Illuminate\Http\Request;

trait ResolvesAuthenticatedLawyer
{
    private function authenticatedLawyerProfile(Request $request): LawyerProfile
    {
        /** @var User|null $user */
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $user->mayActAsRole('lawyer'),
            403,
            'Only active lawyers may manage a lawyer profile.',
        );

        return LawyerProfile::query()
            ->where('user_id', $user->id)
            ->firstOrFail();
    }
}
