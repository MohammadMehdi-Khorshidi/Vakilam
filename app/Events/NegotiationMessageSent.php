<?php

namespace App\Events;

use App\Models\NegotiationMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NegotiationMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $negotiationPublicId,
        public readonly NegotiationMessage $message,
    ) {
        $this->message->loadMissing('sender:id,public_id,name,last_name');
    }

    public function broadcastOn(): array
    {
        return [new PresenceChannel("negotiation.{$this->negotiationPublicId}")];
    }

    public function broadcastAs(): string
    {
        return 'negotiation.message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'body' => $this->message->body,
                'created_at' => $this->message->created_at?->toISOString(),
                'sender' => $this->message->sender === null ? null : [
                    'public_id' => $this->message->sender->public_id,
                    'name' => $this->message->sender->name,
                    'last_name' => $this->message->sender->last_name,
                ],
            ],
        ];
    }
}
