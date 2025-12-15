<?php

namespace App\Http\Controllers;

use App\Models\DevicePairingLog;
use App\Models\ServiceSchedule;
use App\Models\ServiceType;
use App\Models\Vehicle;
use App\Models\VehicleLocation;
use App\Models\VehicleNotificationTrigger;
use App\Models\VehicleSecuritySetting;
use App\Models\VehicleTelemetry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    private function uploadFile($file, $userId)
    {
        $timestamp = now()->format('YmdHis');
        $extension = $file->getClientOriginalExtension();
        $fileName = "vehicle_{$userId}_{$timestamp}.{$extension}";
        return $file->storeAs('vehicles', $fileName, 'public');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'brand' => 'required|string',
            'transmission' => 'required|string',
            'year' => 'required|integer|min:1900|max:' . now()->year,
            'plate_number' => 'required|unique:vehicles,plate_number',
            'gas_type' => 'required|string',
            'machine_capacity' => 'required|string',
            'photo' => 'required|image|mimes:jpg,png,jpeg,webp|max:2048',
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid field',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $data = $validator->validated();

        /** 
         * ==============================
         * TRANSACTION DATABASE ONLY
         * ==============================
         */
        DB::beginTransaction();

        try {
            $photoPath = $this->uploadFile($request->file('photo'), $user->id);

            $vehicle = Vehicle::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'brand' => $data['brand'],
                'year' => $data['year'],
                'plate_number' => $data['plate_number'],
                'photo_path' => $photoPath,
            ]);

            VehicleTelemetry::create([
                'vehicle_id' => $vehicle->id,
                'odometer' => 0,
                'accumulator' => 12.6,
                'transmission' => $data['transmission'],
                'gas_level' => 100,
                'gas_type' => $data['gas_type'],
                'machine_capacity' => $data['machine_capacity'],
            ]);

            VehicleSecuritySetting::create([
                'vehicle_id' => $vehicle->id,
                'anti_theft_enabled' => false,
                'alarm_enabled' => false,
                'remote_engine_cut' => false,
            ]);

            VehicleNotificationTrigger::create([
                'vehicle_id' => $vehicle->id
            ]);

            VehicleLocation::create([
                'vehicle_id' => $vehicle->id,
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
            ]);

            ServiceType::where('category', 'required')
                ->each(function ($service) use ($vehicle, $user) {
                    ServiceSchedule::create([
                        'user_id' => $user->id,
                        'vehicle_id' => $vehicle->id,
                        'service_type_id' => $service->id,
                        'km_target' => $service->interval_km,
                        'date_target' => Carbon::now()
                            ->addDays($service->interval_km / 50)
                            ->toDateString(),
                    ]);
                });

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat kendaraan',
                'error' => $e->getMessage()
            ], 500);
        }

        /**
         * ==============================
         * NOTIFICATION (OUTSIDE TRANSACTION)
         * ==============================
         */

        createNotification(
            $user->id,
            $vehicle->id,
            'Kendaraan berhasil ditambahkan',
            'Silakan hubungkan perangkat untuk mengaktifkan fitur keamanan.',
            'system'
        );

        

        return response()->json([
            'message' => 'Berhasil membuat kendaraan',
            'vehicle_id' => $vehicle->id
        ], 201);
    }


    /**
     * VEHICLE STATUS (DASHBOARD + IOT READY)
     */
    public function vehicleStatus()
    {
        $user = Auth::user();
        $vehicle = Vehicle::where('user_id', $user->id)
            ->with(['telemetry', 'location', 'security'])
            ->first();

        if (!$vehicle) {
            return response()->json([
                'message' => 'Kendaraan belum tersedia'
            ], 404);
        }

        $deviceConnected = DevicePairingLog::where('vehicle_id', $vehicle->id)
            ->where('action', 'paired')
            ->exists();

        if (!$deviceConnected) {
            return response()->json([
                'message' => 'Device belum terhubung'
            ], 409);
        }

        return response()->json([
            'message' => 'Berhasil mendapatkan status kendaraan',
            'data' => [
                'vehicle' => [
                    'name' => "{$vehicle->brand} {$vehicle->name}",
                    'latitude' => $vehicle->location->latitude,
                    'longitude' => $vehicle->location->longitude,
                ],
                'telemetry' => [
                    'odometer' => $vehicle->telemetry->odometer,
                    'rpm' => rand(800, 3000), // simulasi
                    'battery' => $vehicle->telemetry->accumulator,
                    'fuel' => $vehicle->telemetry->gas_level,
                    'engine_status' => $vehicle->telemetry->engine_status,
                    'alarm_status' => $vehicle->telemetry->alarm_status,

                ],
                'security' => [
                    'alarm_enabled' => (bool) $vehicle->security->alarm_enabled,
                    'remote_engine_cut' => (bool) $vehicle->security->remote_engine_cut,
                    'anti_theft_enabled' => (bool) $vehicle->security->anti_theft_enabled,
                ]
            ]
        ]);
    }

    /**
     * VEHICLE DETAIL (PROFILE + DEVICE)
     */
    public function vehicleDetail()
    {
        $user = Auth::user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);

        if (!$vehicle) {
            return response()->json(['message' => 'Kendaraan tidak ditemukan'], 404);
        }

        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $vehicle->id);
        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);

        $deviceConnected = DevicePairingLog::where('vehicle_id', $vehicle->id)
            ->where('action', 'paired')
            ->exists();

        return response()->json([
            'message' => 'Berhasil mendapatkan detail kendaraan',
            'data' => [
                'name' => "{$vehicle->brand} {$vehicle->name}",
                'plate_number' => $vehicle->plate_number,
                'year' => $vehicle->year,
                'odometer' => $telemetry->odometer,
                'transmission' => $telemetry->transmission,
                'gas_type' => $telemetry->gas_type,
                'machine_capacity' => $telemetry->machine_capacity,
                'gps' => $deviceConnected,
                'obd' => $deviceConnected,
            ]
        ]);
    }

    public function telemetry()
    {
        $vehicle = Vehicle::firstWhere('user_id', Auth::id());

        if (!$vehicle) {
            return response()->json(['message' => 'Kendaraan tidak ditemukan'], 404);
        }

        return response()->json([
            'engine_status' => $vehicle->telemetry->engine_status,
            'alarm_status'  => $vehicle->telemetry->alarm_status,
            'updated_at'    => $vehicle->telemetry->updated_at
        ]);
    }

    public function pairDevice(Request $request)
    {
        $request->validate([
            'device_id' => 'required|string'
        ]);

        $vehicle = Vehicle::firstWhere('user_id', Auth::id());

        $vehicle->update([
            'device_id' => $request->device_id,
            'device_connected_at' => now()
        ]);

        return response()->json([
            'message' => 'Device berhasil terhubung'
        ]);
    }
}
