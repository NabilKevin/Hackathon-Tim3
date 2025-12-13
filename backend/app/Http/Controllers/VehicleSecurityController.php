<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleNotificationTrigger;
use App\Models\VehicleSecuritySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

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
        $user = Auth::user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);
        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);
        $notifTrigger = VehicleNotificationTrigger::firstWhere('vehicle_id', $vehicle->id);

        $data = array_merge(
            $security->toArray(),
            $notifTrigger->toArray()
        );

        return response()->json([
            'message' => 'Berhasil mendapatkan sistem keamanan kendaraan!',
            'data' => $data
        ], 200);
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
        $user = Auth::user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);

        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);
        $notifTrigger = VehicleNotificationTrigger::firstWhere('vehicle_id', $vehicle->id);

        $field = array_key_first($request->all());
        $value = $request->input($field);

        $hidden = ['id', 'vehicle_id', 'created_at', 'updated_at'];

        // Gabungkan attribute kedua model
        $securityFields = Arr::except($security->getAttributes(), $hidden);
        $notifFields = Arr::except($notifTrigger->getAttributes(), $hidden);

        // Cek field valid
        if (!array_key_exists($field, $securityFields) && !array_key_exists($field, $notifFields)) {
            return response()->json(['message' => 'Invalid field'], 422);
        }

        // Validasi nilai boolean (support "true"/"false" string)
        $boolValue = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        if ($boolValue === null) {
            return response()->json(['message' => 'Nilai harus berupa boolean'], 422);
        }

        // Tentukan target model
        $target = array_key_exists($field, $securityFields) ? $security : $notifTrigger;

        // Update langsung
        $target->update([$field => $boolValue]);

        return response()->json([
            'message' => 'Berhasil update keamanan!',
            'field' => $field,
            'value' => $boolValue
        ]);
    }

}
