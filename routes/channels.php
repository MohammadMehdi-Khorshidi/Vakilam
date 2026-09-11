<?php

use App\Models\Negotiation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel(
    'negotiation.{publicId}',
    function (User $user, string $publicId): array|false {
        if ($user->status !== 'active') {
            return false;
        }

        $negotiation = Negotiation::query()
            ->where('public_id', $publicId)
            ->with([
                'legalRequest:id,client_user_id',
                'lawyerProfile:id,user_id',
            ])
            ->first();

        if ($negotiation === null) {
            return false;
        }

        $isClient = $negotiation->legalRequest?->client_user_id === $user->id;
        $isLawyer = $negotiation->lawyerProfile?->user_id === $user->id
            && $user->mayActAsRole('lawyer');

        if (! $isClient && ! $isLawyer) {
            return false;
        }

        return [
            'id' => $user->public_id,
            'name' => trim("{$user->name} {$user->last_name}"),
            'role' => $isLawyer ? 'lawyer' : 'client',
        ];
    },
    ['guards' => ['sanctum']],
);
