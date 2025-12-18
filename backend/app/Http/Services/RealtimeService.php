<?php

namespace App\Http\Services;

use App\Events\TestEvent;
use App\Models\ServiceType;
use App\Models\User;
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
        $user = User::find($vehicle->user_id);
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
        if($vehicle->telemetry->gas_level <= 15) {
            createNotification(
                $user->id,
                $vehicle->id,
                'Pengingat bensin!',
                "Jangan lupa untuk isi bensin!",
                'system'
            );
        }

        self::sendOdometerUpdate($vehicle);

        $vehicle->location->update([
            'latitude' => $vehicle->location->latitude + (rand(-5, 5) / 100),
            'longitude' => $vehicle->location->longitude + (rand(-5, 5) / 100),
        ]);

        if ($vehicle->last_notified_service + 200 >= $vehicle->telemetry->odometer) {
            ServiceType::where('category', 'required')->get()->map(function($service) use($vehicle, $user) {
                createNotification($user->id, $vehicle->id, 'Pengigat service!', "Jangan lupa untuk servis $service->name, $service->km_target km lagi!", 'service');
            });

            $vehicle->update(['last_notified_service' => $vehicle->telemetry->odometer]);
        }

        return response()->json([
            'status' => 'ok',
        ]);
    }
    public static function sendOdometerUpdate($vehicle): void
    {
        $odometer = rand(1, 3);

        $vehicle->telemetry->update([
            'gas_level' => $vehicle->telemetry->gas_level - (rand(1, 3+$odometer) / 10),
            'odometer' => $vehicle->telemetry->odometer + $odometer
        ]);

        broadcast(new TestEvent("Odometer updated by {$odometer} km"));
    }
}
