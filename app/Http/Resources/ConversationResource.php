<?php

namespace App\Http\Resources;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Conversation */
class ConversationResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $currentUserId = $request->user()?->id;
        $participants = $this->whenLoaded('participants');
        $counterpart = $participants instanceof \Illuminate\Support\Collection
            ? $participants->firstWhere('id', '!=', $currentUserId)
            : null;

        return [
            'public_id' => $this->public_id,
            'status' => $this->status,
            'context' => $this->contextData(),
            'counterpart' => $counterpart instanceof User
                ? $this->participantData($counterpart)
                : null,
            'participants' => $participants instanceof \Illuminate\Support\Collection
                ? $participants->map(fn (User $user): array => [
                    ...$this->participantData($user),
                    'is_current_user' => $user->id === $currentUserId,
                ])->values()
                : [],
            'last_message' => $this->whenLoaded(
                'lastMessage',
                fn () => $this->lastMessage === null
                    ? null
                    : ConversationMessageResource::make($this->lastMessage),
            ),
            'messages' => ConversationMessageResource::collection(
                $this->whenLoaded('messages'),
            ),
            'created_at' => $this->created_at?->toISOString(),
            'closed_at' => $this->closed_at?->toISOString(),
        ];
    }

    /** @return array<string, mixed>|null */
    private function contextData(): ?array
    {
        if ($this->relationLoaded('legalMatter') && $this->legalMatter !== null) {
            return [
                'type' => 'legal_matter',
                'public_id' => $this->legalMatter->public_id,
                'title' => $this->legalMatter->title,
            ];
        }

        if ($this->relationLoaded('consultation') && $this->consultation !== null) {
            return [
                'type' => 'consultation',
                'public_id' => $this->consultation->public_id,
                'title' => $this->consultation->legalRequest?->title ?: 'مشاوره حقوقی',
            ];
        }

        return null;
    }

    /** @return array<string, mixed> */
    private function participantData(User $user): array
    {
        $name = $user->lawyerProfile?->full_name
            ?: $user->clientProfile?->full_name
            ?: trim($user->name.' '.$user->last_name);

        return [
            'public_id' => $user->public_id,
            'name' => $name ?: 'کاربر وکیلم',
            'role' => $user->roles->pluck('code')->first(),
            'lawyer_public_id' => $user->lawyerProfile?->public_id,
        ];
    }
}
