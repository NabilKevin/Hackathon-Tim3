<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleNotificationTrigger;
use App\Models\VehicleSecuritySetting;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use App\Models\VehicleTelemetry;

use App\Http\Services\VehicleSecurityService;

class VehicleSecurityController extends Controller
{
    /**
     * Mendapatkan seluruh pengaturan keamanan & notifikasi kendaraan pengguna.
     *
     * Menggabungkan data dari `vehicle_security_settings` dan `vehicle_notification_triggers`.
     *
     * @authenticated
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil mendapatkan sistem keamanan kendaraan!",
     *   "data": {
     *     "anti_theft_enabled": true,
     *     "geofence_enabled": true,
     *     "geofence_radius": 500,
     *     "alarm_enabled": true,
     *     "remote_engine_cut": false,
     *     "engine_on": true,
     *     "vibration": true,
     *     "wheel_move": false
     *   }
     * }
     *
     * @response 404 scenario="Kendaraan tidak ditemukan" {
     *   "message": "Kendaraan tidak ditemukan."
     * }
     */
    public function index()
    {
        $vehicle = Vehicle::firstWhere('user_id', Auth::id());

        if (!$vehicle) {
            return response()->json(['message' => 'Kendaraan tidak ditemukan.'], 404);
        }

        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);
        $trigger  = VehicleNotificationTrigger::firstWhere('vehicle_id', $vehicle->id);

        return response()->json([
            'message' => 'Berhasil mendapatkan sistem keamanan kendaraan!',
            'data' => array_merge(
                $security->only([
                    'anti_theft_enabled',
                    'geofence_enabled',
                    'geofence_radius',
                    'alarm_enabled',
                    'remote_engine_cut'
                ]),
                $trigger->only([
                    'engine_on',
                    'vibration',
                    'wheel_move'
                ])
            )
        ]);
    }

    /**
     * Mengaktifkan/menonaktifkan satu fitur keamanan atau notifikasi.
     *
     * Kirim **satu field boolean** dalam body request.
     *
     * @authenticated
     *
     * @bodyParam anti_theft_enabled boolean optional Aktifkan mode anti-maling. Example: true
     * @bodyParam geofence_enabled boolean optional Aktifkan geofencing. Example: true
     * @bodyParam alarm_enabled boolean optional Aktifkan alarm. Example: true
     * @bodyParam remote_engine_cut boolean optional Aktifkan remote engine cut. Example: false
     * @bodyParam engine_on boolean optional Notifikasi saat mesin menyala. Example: true
     * @bodyParam vibration boolean optional Notifikasi saat terdeteksi getaran. Example: true
     * @bodyParam wheel_move boolean optional Notifikasi saat roda bergerak. Example: false
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil update keamanan!",
     *   "data": {
     *     "anti_theft_enabled": true,
     *     "geofence_enabled": true,
     *     "geofence_radius": 500,
     *     "alarm_enabled": true,
     *     "remote_engine_cut": false,
     *     "engine_on": true,
     *     "vibration": true,
     *     "wheel_move": false
     *   }
     * }
     *
     * @response 404 scenario="Kendaraan tidak ditemukan" {
     *   "message": "Kendaraan tidak ditemukan."
     * }
     *
     * @response 422 scenario="Field tidak valid" {
     *   "message": "Field tidak diizinkan untuk diubah."
     * }
     *
     * @response 422 scenario="Lebih dari satu field" {
     *   "message": "Hanya satu field yang boleh diupdate sekaligus."
     * }
     */
    public function toggleSecurity(Request $request)
    {
        $vehicle = Vehicle::firstWhere('user_id', Auth::id());

        if (!$vehicle) {
            return response()->json(['message' => 'Kendaraan tidak ditemukan'], 404);
        }

        // Pastikan hanya 1 field
        if (count($request->all()) !== 1) {
            return response()->json([
                'message' => 'Hanya satu field yang boleh diupdate'
            ], 422);
        }

        $field = array_key_first($request->all());
        $value = filter_var($request->input($field), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        if ($value === null) {
            return response()->json(['message' => 'Nilai harus boolean'], 422);
        }

        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);
        $trigger  = VehicleNotificationTrigger::firstWhere('vehicle_id', $vehicle->id);

        /* ================= UPDATE SETTING ================= */

        if ($security->isFillable($field)) {
            $security->update([$field => $value]);

            // === Aksi langsung (IoT Simulation) ===
            if ($field === 'remote_engine_cut' && $value === true) {
                VehicleSecurityService::handleEvent($vehicle, 'wheel_move');
            }

            if ($field === 'alarm_enabled' && $value === true) {
                VehicleSecurityService::handleEvent($vehicle, 'vibration');
            }
        } elseif ($trigger->isFillable($field)) {
            $trigger->update([$field => $value]);
        } else {
            return response()->json(['message' => 'Field tidak valid'], 422);
        }

        return response()->json([
            'message' => 'Keamanan berhasil diperbarui',
            'field'   => $field,
            'value'   => $value
        ]);
    }

    public function simulateEvent(Request $request)
    {
        $request->validate([
            'event' => 'required|in:engine_on,vibration,wheel_move'
        ]);

        $vehicle = Vehicle::firstWhere('user_id', Auth::id());

        if (!$vehicle) {
            return response()->json(['message' => 'Kendaraan tidak ditemukan'], 404);
        }

        VehicleSecurityService::handleEvent($vehicle, $request->event);

        return response()->json([
            'message' => 'Event berhasil disimulasikan',
            'event' => $request->event
        ]);
    }

    public function alarmOn(Request $request)
    {
        $vehicle = Vehicle::where('user_id', $request->user()->id)->firstOrFail();
        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);
        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $vehicle->id);

        if (!$security || !$security->anti_theft_enabled) {
            return response()->json([
                'message' => 'Anti-Theft belum diaktifkan'
            ], 403);
        }

        $triggers = VehicleNotificationTrigger::firstWhere('vehicle_id', $vehicle->id);

       
        if ($triggers->vibration === 0) {
            return response()->json([
                'message' => 'Trigger notifikasi vibration belum diaktifkan'
            ], 404);
        }



        VehicleSecurityService::handleEvent($vehicle, 'vibration');

        return response()->json([
            'message' => 'Alarm berhasil diaktifkan'
        ]);
    }

    public function alarmOff(Request $request)
    {
        $vehicle = Vehicle::where('user_id', $request->user()->id)->firstOrFail();
        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $vehicle->id);
        $user = Auth::id();

        $telemetry->update(['alarm_status' => false]);

        createNotification(
            $request->user()->id,
            $vehicle->id,
            'Alarm Berhasil di matikan',
            'Alarm Berhasil dimatikan di kendaraan Anda.',
            'system'
        );
        return response()->json([
            'message' => 'Alarm berhasil dimatikan'
        ]);
    }

    public function engineOff(Request $request)
    {
        $vehicle = Vehicle::where('user_id', $request->user()->id)->firstOrFail();

        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);
        if (!$security || !$security->anti_theft_enabled) {
            return response()->json([
                'message' => 'Anti-Theft belum diaktifkan'
            ], 403);
        }

        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $vehicle->id);
        if (!$telemetry) {
            return response()->json([
                'message' => 'Telemetry kendaraan tidak ditemukan'
            ], 404);
        }

        VehicleSecurityService::engineOff($vehicle, $telemetry);

        return response()->json([
            'message' => 'Mesin berhasil dimatikan'
        ]);
    }

    public function engineOn(Request $request)
    {
        $vehicle = Vehicle::where('user_id', $request->user()->id)->firstOrFail();

        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);
        if (!$security || !$security->anti_theft_enabled) {
            return response()->json([
                'message' => 'Anti-Theft belum diaktifkan'
            ], 403);
        }

        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $vehicle->id);
        if (!$telemetry) {
            return response()->json([
                'message' => 'Telemetry kendaraan tidak ditemukan'
            ], 404);
        }

        $triggers = VehicleNotificationTrigger::firstWhere('vehicle_id', $vehicle->id);
        if ($triggers->engine_on === 0) {
            return response()->json([
                'message' => 'Trigger notifikasi mesin menyala belum diaktifkan'
            ], 404);
        }

        // PANGGIL SERVICE (LANGSUNG)
        VehicleSecurityService::engineOn($vehicle, $telemetry, $triggers);

        return response()->json([
            'message' => 'Mesin berhasil dinyalakan'
        ]);
    }
}
