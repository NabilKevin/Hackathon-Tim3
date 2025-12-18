<?php

namespace App\Http\Services;

use App\Events\TestEvent;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Auth;

class RealtimeService
{
    public static function send(string $message): void
    {
        broadcast(new TestEvent($message));
    }
    public static function handleEvent($vehicle)
    {
        if(!$vehicle) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vehicle not found for user'
            ], 404);
        }
        if($vehicle->telemetry->gas_level <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vehicle gas level is empty'
            ], 400);
        }

        self::sendOdometerUpdate($vehicle);

        $vehicle->location->update([
            'latitude' => $vehicle->location->latitude + (rand(-5, 5) / 100),
            'longitude' => $vehicle->location->longitude + (rand(-5, 5) / 100),
        ]);

        return response()->json([
            'status' => 'ok',
        ]);
    }
    public static function sendOdometerUpdate($vehicle): void
    {
        $odometer = rand(1, 5);

        $vehicle->update(['odometer' => $vehicle->odometer + $odometer]);

        $vehicle->telemetry->update([
            'gas_level' => $vehicle->telemetry->gas_level - (rand(1, 5+$odometer) / 10)
        ]);

        broadcast(new TestEvent("Odometer updated by {$odometer} km"));
    }
}
