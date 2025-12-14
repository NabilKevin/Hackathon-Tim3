<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Vehicle;

class VehicleRealtimeEvent
{
    use SerializesModels;

    public function __construct(
        public Vehicle $vehicle,
        public array $payload
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('vehicle.' . $this->vehicle->id);
    }

    public function broadcastAs(): string
    {
        return 'vehicle.event';
    }
}
