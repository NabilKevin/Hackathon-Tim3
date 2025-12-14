<?php

namespace App\Http\Services;

use App\Models\VehicleTelemetry;
use App\Models\VehicleNotificationTrigger;
use App\Models\Notification;
use App\Models\Vehicle;
use App\Models\VehicleSecuritySetting;
use App\Events\VehicleRealtimeEvent;


class VehicleSecurityService
{
    /**
     * === ENTRY POINT UNTUK SEMUA EVENT IoT ===
     * Dipakai oleh:
     * - API simulate
     * - Scheduler
     * - MQTT
     * - Hardware nyata
     */
    public static function handleEvent(Vehicle $vehicle, string $event)
    {
        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $vehicle->id);
        $triggers  = VehicleNotificationTrigger::firstWhere('vehicle_id', $vehicle->id);
        $security  = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);

        if (!$telemetry || !$triggers || !$security) {
            return;
        }

        match ($event) {
            'engine_on'   => self::engineOn($vehicle, $telemetry, $triggers),
            'vibration'   => self::vibration($vehicle, $telemetry, $triggers, $security),
            'wheel_move'  => self::wheelMove($vehicle, $telemetry, $triggers, $security),
            default       => null
        };
    }

    /* ===================== EVENT HANDLERS ===================== */

    private static function engineOn($vehicle, $telemetry, $triggers)
    {
        if (!$triggers->engine_on) return;

        if ($telemetry->engine_status === true) return;

        $telemetry->update(['engine_status' => true]);

        self::notify(
            $vehicle,
            'Mesin Menyala',
            'Mesin kendaraan terdeteksi menyala.',
            'warning'
        );
    }

    private static function vibration($vehicle, $telemetry, $triggers, $security)
    {
        if (!$triggers->vibration) return;

        self::notify(
            $vehicle,
            'Getaran Terdeteksi',
            'Terdeteksi getaran mencurigakan pada kendaraan.',
            'warning'
        );

        // 🔗 AUTO CHAINING (ANTI-THEFT)
        if ($security->anti_theft_enabled) {
            self::alarmOn($vehicle, $telemetry);
        }
    }

    private static function wheelMove($vehicle, $telemetry, $triggers, $security)
    {
        if (!$triggers->wheel_move) return;

        self::notify(
            $vehicle,
            'Pergerakan Roda',
            'Roda kendaraan bergerak tanpa izin.',
            'warning'
        );

        // 🔗 AUTO CHAINING (ANTI-THEFT)
        if ($security->anti_theft_enabled) {
            self::engineOff($vehicle, $telemetry);
            self::alarmOn($vehicle, $telemetry);
        }
    }

    /* ===================== ACTIONS ===================== */

    private static function engineOff(Vehicle $vehicle, VehicleTelemetry $telemetry)
    {
        if ($telemetry->engine_status === false) return;

        $telemetry->update(['engine_status' => false]);

        self::notify(
            $vehicle,
            'Mesin Dimatikan',
            'Mesin dimatikan otomatis oleh sistem Anti-Theft.',
            'security'
        );

        event(new VehicleRealtimeEvent(
            $vehicle,
            [
                'type' => 'telemetry',
                'data' => [
                    'engine_status' => false
                ]
            ]
        ));
    }

    private static function alarmOn(Vehicle $vehicle, VehicleTelemetry $telemetry)
    {
        if ($telemetry->alarm_status === true) return;

        $telemetry->update(['alarm_status' => true]);

        self::notify(
            $vehicle,
            'Alarm Aktif',
            'Alarm diaktifkan otomatis oleh sistem Anti-Theft.',
            'security'
        );

        event(new VehicleRealtimeEvent(
            $vehicle,
            [
                'type' => 'telemetry',
                'data' => [
                    'alarm_status' => true
                ]
            ]
        ));
    }

    /* ===================== NOTIFICATION ===================== */

    private static function notify(Vehicle $vehicle, string $title, string $content, string $type)
    {
        $notification = Notification::create([
            'user_id'    => $vehicle->user_id,
            'vehicle_id' => $vehicle->id,
            'title'      => $title,
            'content'    => $content,
            'type'       => $type,
        ]);

        // REALTIME PUSH
        event(new VehicleRealtimeEvent(
            $vehicle,
            [
                'type' => 'notification',
                'data' => $notification
            ]
        ));
    }
}
