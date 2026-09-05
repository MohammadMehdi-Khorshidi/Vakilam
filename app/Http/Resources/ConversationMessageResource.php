<?php

namespace App\Http\Resources;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Message */
class ConversationMessageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $sender = $this->whenLoaded('sender');

        return [
            'public_id' => $this->public_id,
            'body' => $this->status === 'deleted' ? null : $this->body,
            'status' => $this->status,
            'sent_at' => $this->sent_at?->toISOString(),
            'edited_at' => $this->edited_at?->toISOString(),
            'is_mine' => $request->user()?->id === $this->sender_user_id,
            'sender' => $sender instanceof \App\Models\User
                ? [
                    'public_id' => $sender->public_id,
                    'name' => trim($sender->name.' '.$sender->last_name),
                ]
                : null,
        ];
    }
}
