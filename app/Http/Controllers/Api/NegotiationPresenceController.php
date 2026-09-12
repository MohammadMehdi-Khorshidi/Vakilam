<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Negotiation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NegotiationPresenceController extends Controller
{
    public function touch(Request $request, Negotiation $negotiation): JsonResponse
    {
        $user = $this->ensureParticipant($request, $negotiation);

        $typing = (bool) $request->boolean('typing');

        Cache::put(
            $this->presenceKey($negotiation, $user),
            true,
            now()->addSeconds(8),
        );

        if ($typing) {
            Cache::put(
                $this->typingKey($negotiation, $user),
                true,
                now()->addSeconds(3),
            );
        } else {
            Cache::forget(
                $this->typingKey($negotiation, $user),
            );
        }

        [$otherUser, $otherRole] = $this->otherParticipant(
            $negotiation,
            $user,
        );

        return response()->json([
            'data' => [
                'self' => [
                    'public_id' => $user->public_id,
                ],
                'other' => $otherUser === null
                    ? null
                    : [
                        'public_id' => $otherUser->public_id,
                        'role' => $otherRole,
                        'online' => Cache::has(
                            $this->presenceKey(
                                $negotiation,
                                $otherUser,
                            ),
                        ),
                        'typing' => Cache::has(
                            $this->typingKey(
                                $negotiation,
                                $otherUser,
                            ),
                        ),
                    ],
            ],
        ]);
    }

    private function ensureParticipant(
        Request $request,
        Negotiation $negotiation,
    ): User {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active',
            403,
        );

        $negotiation->loadMissing([
            'legalRequest:id,client_user_id',
            'legalRequest.client:id,public_id,name,last_name',
            'lawyerProfile:id,user_id',
            'lawyerProfile.user:id,public_id,name,last_name',
        ]);

        $isClient =
            $negotiation->legalRequest?->client_user_id
                === $user->id;

        $isLawyer =
            $negotiation->lawyerProfile?->user_id
                === $user->id
            && $user->mayActAsRole('lawyer');

        abort_unless(
            $isClient || $isLawyer,
            403,
            'You are not a participant in this negotiation.',
        );

        return $user;
    }

    private function otherParticipant(
        Negotiation $negotiation,
        User $currentUser,
    ): array {
        if (
            $negotiation->legalRequest?->client_user_id
                === $currentUser->id
        ) {
            return [
                $negotiation->lawyerProfile?->user,
                'lawyer',
            ];
        }

        return [
            $negotiation->legalRequest?->client,
            'client',
        ];
    }

    private function presenceKey(
        Negotiation $negotiation,
        User $user,
    ): string {
        return "negotiation:{$negotiation->id}:presence:{$user->id}";
    }

    private function typingKey(
        Negotiation $negotiation,
        User $user,
    ): string {
        return "negotiation:{$negotiation->id}:typing:{$user->id}";
    }
}
