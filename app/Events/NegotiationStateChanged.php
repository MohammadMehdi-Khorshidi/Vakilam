<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NegotiationStateChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $negotiationPublicId,
        public readonly string $change,
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PresenceChannel("negotiation.{$this->negotiationPublicId}")];
    }

    public function broadcastAs(): string
    {
        return 'negotiation.state.changed';
    }

    public function broadcastWith(): array
    {
        return ['change' => $this->change];
    }
}
