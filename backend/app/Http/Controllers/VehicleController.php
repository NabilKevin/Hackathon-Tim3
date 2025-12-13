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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    private function uploadFile($file, $userId)
    {
        $timestamp = now()->format('YmdHis');
        $extension = $file->getClientOriginalExtension();
        $fileName = "vehicle_{$userId}_{$timestamp}.{$extension}";
        $path = $file->storeAs('vehicles', $fileName, 'public');
        return $path;
    }

    /**
     * Membuat kendaraan baru untuk pengguna yang sedang login.
     *
     * Membuat entri kendaraan lengkap dengan telemetri awal, pengaturan keamanan,
     * lokasi awal, dan jadwal servis otomatis untuk tipe servis wajib.
     *
     * @authenticated
     *
     * @bodyParam name string required Nama kendaraan (misal: "Jazz"). Example: Jazz
     * @bodyParam brand string required Merek kendaraan. Example: Honda
     * @bodyParam transmission string required Jenis transmisi. Example: Automatic
     * @bodyParam year integer required Tahun produksi (1900–tahun ini). Example: 2020
     * @bodyParam plate_number string required Nomor plat unik. Example: B1234ABC
     * @bodyParam gas_type string required Jenis bahan bakar. Example: Pertamax
     * @bodyParam machine_capacity string required Kapasitas mesin/muatan. Example: 1500 cc
     * @bodyParam photo file required Foto kendaraan (jpg, png, jpeg, webp, max 2MB).
     * @bodyParam latitude number required Koordinat lintang (antara -90 dan 90). Example: -6.2741
     * @bodyParam longitude number required Koordinat bujur (antara -180 dan 180). Example: 106.8500
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil membuat kendaraan!"
     * }
     *
     * @response 422 scenario="Validasi gagal" {
     *   "message": "Invalid field",
     *   "errors": {
     *     "plate_number": ["The plate number has already been taken."]
     *   }
     * }
     */
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
            'latitude' => 'required|numeric|min:-180|max:180',
            'longitude' => 'required|numeric|min:-90|max:90',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => 'Invalid field',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $user = $request->user();

        $path = $this->uploadFile($request->file('photo'), $user->id);
        
        $vehicle = Vehicle::create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'brand' => $data['brand'],
            'year' => $data['year'],
            'plate_number' => $data['plate_number'],
            'photo_path' => $path
        ]);

        VehicleTelemetry::create([
            'vehicle_id' => $vehicle->id,
            'odometer' => 0,
            'accumulator' => 0,
            'transmission' => $data['transmission'],
            'gas_level' => 100,
            'gas_type' => $data['gas_type'],
            'machine_capacity' => $data['machine_capacity']
        ]);

        VehicleNotificationTrigger::create([
            'vehicle_id' => $vehicle->id
        ]);

        VehicleSecuritySetting::create([
            'vehicle_id' => $vehicle->id
        ]);

        ServiceType::where('category', 'required')->get()->map(function($service) use($vehicle, $user) {
            ServiceSchedule::create([
                'user_id' => $user->id,
                'vehicle_id' => $vehicle->id,
                'service_type_id' => $service->id,
                'km_target' => $service->interval_km,
                'date_target' => Carbon::now()->addDays($service->interval_km/50)->toDateString()
            ]);
        });

        VehicleLocation::create([
            'vehicle_id' => $vehicle->id,
            'longitude' => $data['longitude'],
            'latitude' => $data['latitude']
        ]);

        createNotification($user->id, $vehicle->id, 'Berhasil membuat kendaraan!', "Kendaraan $vehicle->name dengan plat nomor $vehicle->plate_number telah berhasil dibuat! Silakan pasangkan perangkat pelacak untuk memulai pemantauan.", 'system');
        
        return response()->json([
            'message' => 'Berhasil membuat kendaraan!'
        ], 200);
    }

    /**
     * Memperbarui data kendaraan yang sudah ada.
     *
     * Hanya field yang dikirim yang akan diupdate. Foto bersifat opsional.
     *
     * @authenticated
     *
     * @urlParam id integer required ID kendaraan. Example: 1
     *
     * @bodyParam name string optional Nama kendaraan. Example: Jazz
     * @bodyParam brand string optional Merek kendaraan. Example: Honda
     * @bodyParam transmission string optional Jenis transmisi. Example: Automatic
     * @bodyParam year integer optional Tahun produksi. Example: 2020
     * @bodyParam plate_number string optional Nomor plat (harus unik). Example: B1234ABC
     * @bodyParam gas_type string optional Jenis bahan bakar. Example: Pertamax
     * @bodyParam machine_capacity string optional Kapasitas mesin/muatan. Example: 1500 cc
     * @bodyParam photo file optional Foto kendaraan (jpg, png, jpeg, webp, max 2MB).
     * @bodyParam latitude number optional Koordinat lintang. Example: -6.2741
     * @bodyParam longitude number optional Koordinat bujur. Example: 106.8500
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil update kendaraan!",
     *   "vehicle": {
     *     "id": 1,
     *     "user_id": 1,
     *     "name": "Jazz",
     *     "brand": "Honda",
     *     "year": 2020,
     *     "plate_number": "B1234ABC",
     *     "photo_path": "vehicles/vehicle_1_20251206100000.jpg",
     *     "created_at": "2025-12-06T10:00:00.000000Z",
     *     "updated_at": "2025-12-06T10:05:00.000000Z"
     *   }
     * }
     *
     * @response 404 scenario="Kendaraan tidak ditemukan" {
     *   "message": "Kendaraan tidak ditemukan!"
     * }
     *
     * @response 422 scenario="Validasi gagal" {
     *   "message": "Invalid field",
     *   "errors": {
     *     "plate_number": ["The plate number has already been taken."]
     *   }
     * }
     */
    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json([
                'message' => 'Kendaraan tidak ditemukan!'
            ], 404);
        }

        // Validasi
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string',
            'brand' => 'sometimes|string',
            'transmission' => 'sometimes|string',
            'year' => 'sometimes|integer|min:1900|max:' . now()->year,
            'plate_number' => 'sometimes|unique:vehicles,plate_number,' . $id,
            'gas_type' => 'sometimes|string',
            'machine_capacity' => 'sometimes|string',
            'photo' => 'sometimes|image|mimes:jpg,png,jpeg,webp|max:2048',
            'longitude' => 'sometimes|numeric|min:-180|max:180',
            'latitude' => 'sometimes|numeric|min:-90|max:90',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid field',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $user = $request->user();

        // Handle upload foto
        $path = $vehicle->photo_path; // pertahankan foto lama jika tidak diupload
        if ($request->hasFile('photo')) {
            $path = $this->uploadFile($request->file('photo'), $user->id);
        }

        // Update kendaraan
        $vehicle->update([
            // 'user_id' => $user->id, // ⚠️ HAPUS jika tidak boleh ubah kepemilikan
            'name' => $data['name'] ?? $vehicle->name,
            'brand' => $data['brand'] ?? $vehicle->brand,
            'year' => $data['year'] ?? $vehicle->year,
            'plate_number' => $data['plate_number'] ?? $vehicle->plate_number,
            'photo_path' => $path,
        ]);

        // Update atau buat telemetri
        $telemetry = VehicleTelemetry::firstWhere(['vehicle_id' => $vehicle->id]);

        $telemetry->update(
            [
                'transmission' => $data['transmission'] ?? $telemetry->transmission,
                'gas_type' => $data['gas_type'] ?? $telemetry->gas_type,
                'machine_capacity' => $data['machine_capacity'] ?? $telemetry->machine_capacity
            ]
        );

        // Update atau buat lokasi
        if (isset($data['longitude']) && isset($data['latitude'])) {
            VehicleLocation::firstWhere(['vehicle_id' => $vehicle->id])->update(
                [
                    'longitude' => $data['longitude'],
                    'latitude' => $data['latitude']
                ]
            );
        }

        // Buat notifikasi
        createNotification(
            $user->id,
            $vehicle->id,
            'Berhasil memperbarui kendaraan!',
            "Kendaraan {$vehicle->name} dengan plat nomor {$vehicle->plate_number} telah berhasil diperbarui.",
            'system'
        );

        return response()->json([
            'message' => 'Berhasil update kendaraan!',
            'vehicle' => $vehicle->fresh()
        ], 200);
    }

    /**
     * Mendapatkan status kendaraan untuk dashboard.
     *
     * Menampilkan data real-time seperti odometer, kondisi mesin, dll.
     *
     * @authenticated
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil mendapatkan status kendaraan!",
     *   "data": {
     *     "odometer": 15000,
     *     "engine": "1.200",
     *     "accumulator": 12.5,
     *     "diagnosis": "Normal",
     *     "gas_level": 75,
     *     "alarm_enabled": true,
     *     "remote_engine_cut": false
     *   }
     * }
     */
    public function vehicleStatus()
    {
        $user = Auth::user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);
        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $vehicle->id);
        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);

        return response()->json([
            'message' => 'Berhasil mendapatkan status kendaraan!',
            'data' => [
                'odometer' => $telemetry->odometer,
                'engine' => 1200,
                'accumulator' => $telemetry->accumulator,
                'diagnosis' => 'Normal',
                'gas_level' => $telemetry->gas_level,
                'alarm_enabled' => $security->alarm_enabled === 1 ? true : false,
                'remote_engine_cut' => $security->remote_engine_cut === 1 ? true : false,
            ]
        ], 200);
    }

    /**
     * Mendapatkan detail lengkap kendaraan.
     *
     * Termasuk info perangkat (OBD, GPS) yang terpasang.
     *
     * @authenticated
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil mendapatkan detail kendaraan!",
     *   "data": {
     *     "name": "HondaJazz",
     *     "plate_number": "B1234ABC",
     *     "year": 2020,
     *     "odometer": 15000,
     *     "transmission": "Automatic",
     *     "gas_type": "Pertamax",
     *     "machine_capacity": "1500 cc",
     *     "gps": true,
     *     "obd": true
     *   }
     * }
     */
    public function vehicleDetail()
    {
        $user = Auth::user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);
        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $vehicle->id);
        $security = VehicleSecuritySetting::firstWhere('vehicle_id', $vehicle->id);
        $device = DevicePairingLog::where('vehicle_id', $vehicle->id)->firstWhere('action', 'paired');

        return response()->json([
            'message' => 'Berhasil mendapatkan detail kendaraan!',
            'data' => [
                'name' => $vehicle->brand . $vehicle->name,
                'plate_number' => $vehicle->plate_number,
                'year' => $vehicle->year,
                'odometer' => $telemetry->odometer,
                'transmission' => $telemetry->transmission,
                'gas_type' => $telemetry->gas_type,
                'machine_capacity' => $telemetry->machine_capacity,
                'gps' => $security->geofence_enabled === 1 ? true : false,
                'obd' => $device ? true : false
            ]
        ], 200);
    }
}
