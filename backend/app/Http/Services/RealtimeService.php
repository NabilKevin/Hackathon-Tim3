<?php

namespace App\Http\Services;

use App\Events\TestEvent;

class RealtimeService
{
    public static function send(string $message): void
    {
        broadcast(new TestEvent($message));
    }
}
