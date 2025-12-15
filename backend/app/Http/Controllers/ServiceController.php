<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceSchedule;
use App\Models\ServiceType;
use App\Models\Vehicle;
use App\Models\VehicleTelemetry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    /**
     * Mendapatkan riwayat servis pengguna yang sedang login.
     *
     * Mengembalikan semua riwayat servis, atau difilter berdasarkan tipe servis.
     *
     * @authenticated
     *
     * @queryParam type string optional Nama tipe servis (misal: "Oli Mesin"). Jika tidak diisi, kembalikan semua. Example: Oli Mesin
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil mendapatkan riwayat servis!",
     *   "data": [
     *     {
     *       "name": "Oli Mesin",
     *       "km": 15000,
     *       "total": 250000,
     *       "date": "2025-12-01"
     *     }
     *   ]
     * }
     *
     * @response 422 scenario="Tipe servis tidak valid" {
     *   "message": "Tipe service tidak valid."
     * }
     */
    public function serviceHistories(Request $request)
    {
        $type = $request->query('type', 'all');

        $validTypes = ServiceType::firstWhere('name', $type);
        if ($type !== 'all' && $validTypes) {
            return response()->json([
                'message' => 'Tipe service tidak valid.'
            ], 422);
        }

        $user = $request->user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);
        $query = Service::with('serviceType')->where('vehicle_id', $vehicle->id);

        if ($type !== 'all') {
            $query->where('type', $validTypes->id);
        }

        $services = $query->where('created_at', '>=', Carbon::now()->subMonths(3)->toDateString())->latest()->get();

        return response()->json([
            'message' => 'Berhasil mendapatkan riwayat servis!',
            'data' => $services->map(function($service) {
                return [
                    "id" => $service->id,
                    "title" => $service->serviceType->name,
                    "price" => $service->total,
                    "km" => $service->km,
                    "date" => $service->date,
                    "icon" => "tools",
                    "category" => $service->serviceType->name,
                    "note" => $service->description,
                ];
            })
        ], 200);
    }

    /**
     * Menampilkan detail riwayat servis berdasarkan ID.
     *
     * Hanya riwayat servis milik kendaraan pengguna yang sedang login yang dapat dilihat.
     *
     * @authenticated
     *
     * @urlParam id integer required ID riwayat servis. Example: 1
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil mendapatkan riwayat servis!",
     *   "data": {
     *     "id": 1,
     *     "service_type_id": 2,
     *     "vehicle_id": 5,
     *     "date": "2025-12-01",
     *     "km": 15000,
     *     "description": "Ganti oli mesin",
     *     "total": 250000,
     *     "created_at": "2025-12-01T10:00:00.000000Z",
     *     "updated_at": "2025-12-01T10:00:00.000000Z"
     *   }
     * }
     *
     * @response 404 scenario="Tidak ditemukan" {
     *   "message": "Riwayat servis tidak ditemukan!"
     * }
     *
     * @response 403 scenario="Akses ditolak" {
     *   "message": "Bukan riwayat servis milik Anda!"
     * }
     */
    public function serviceHistory($id)
    {
        $user = Auth::user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);
        $service = Service::find($id);

        if (!$service) {
            // Cek apakah servis benar-benar tidak ada, atau milik orang lain
            return response()->json([
                'message' => 'Riwayat servis tidak ditemukan!'
            ], 404);
        }
        if ($service->vehicle_id !== $vehicle->id) {
            return response()->json([
                'message' => 'Bukan riwayat servis milik Anda!'
            ], 403);
        }

        return response()->json([
            'message' => 'Berhasil mendapatkan riwayat servis!',
            'data' => $service
        ], 200);
    }

    /**
     * Mendapatkan jadwal servis yang akan datang.
     *
     * Mengembalikan daftar jadwal servis dengan estimasi sisa km.
     *
     * @authenticated
     *
     * @queryParam type string optional Nama tipe servis. Example: Oli Mesin
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil mendapatkan jadwal servis!",
     *   "data": [
     *     {
     *       "name": "Oli Mesin",
     *       "km_target": 2500,
     *       "date_target": "2026-01-15",
     *       "created_at": "2025-12-01T10:00:00.000000Z"
     *     }
     *   ]
     * }
     *
     * @response 422 scenario="Tipe servis tidak valid" {
     *   "message": "Tipe service tidak valid."
     * }
     */
    public function serviceSchedules(Request $request)
    {
        $type = $request->query('type', 'all');

        $validTypes = ServiceType::firstWhere('name', $type);
        if ($type !== 'all' && $validTypes) {
            return response()->json([
                'message' => 'Tipe service tidak valid.'
            ], 422);
        }

        $user = $request->user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);
        $query = ServiceSchedule::with('serviceType')->where('vehicle_id', $vehicle->id);

        if ($type !== 'all') {
            $query->where('type', $validTypes->id);
        }

        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $vehicle->id);
        // $services = Service::where('vehicle_id', $vehicle->id)->get();
        $serviceSchedule = $query->latest()->get()->map(function($schedule) use($telemetry) {
            $kmRemaining = $schedule->km_target - $telemetry->odometer;
            return [
                "id" => $schedule->id,
                "title" => $schedule->serviceType->name,
                "km" => $kmRemaining > 0 ? $kmRemaining : 0,
                "date" => $schedule->date_target,
                "icon" => "tools",
                "category" => $schedule->serviceType->name,
            ];
        });

        return response()->json([
            'message' => 'Berhasil mendapatkan jadwal servis!',
            'data' => $serviceSchedule
        ], 200);
    }

    /**
     * Menambahkan riwayat servis baru.
     *
     * Mencatat servis yang telah dilakukan dan memperbarui jadwal servis berikutnya (jika tipe wajib).
     *
     * @authenticated
     *
     * @bodyParam service_type_id integer required ID tipe servis. Example: 2
     * @bodyParam date string required Tanggal servis (format: YYYY-MM-DD). Example: 2025-12-01
     * @bodyParam km integer required km saat servis. Example: 15000
     * @bodyParam description string required Deskripsi servis. Example: Ganti oli mesin Shell
     * @bodyParam total integer required Total biaya servis. Example: 250000
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil menambah servis!",
     *   "data": {
     *     "service_type_id": 2,
     *     "vehicle_id": 5,
     *     "date": "2025-12-01",
     *     "km": 15000,
     *     "description": "Ganti oli mesin Shell",
     *     "total": 250000,
     *     "created_at": "2025-12-01T10:00:00.000000Z",
     *     "updated_at": "2025-12-01T10:00:00.000000Z"
     *   }
     * }
     *
     * @response 422 scenario="Validasi gagal" {
     *   "message": "Invalid field",
     *   "errors": {
     *     "km": ["The km must be at least 0."]
     *   }
     * }
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_type_id' => 'required|integer|exists:service_types,id',
            'date' => 'required|date',
            'km' => 'required|integer|min:0',
            'description' => 'required',
            'total' => 'required|integer|min:0',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => 'Invalid field',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        $user = $request->user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);

        $data['vehicle_id'] = $vehicle->id;
        $data['date'] = Carbon::parse($data['date'])->toDateString();

        $service = Service::create($data);

        $serviceSchedule = ServiceSchedule::where('vehicle_id', $data['vehicle_id'])->firstWhere('service_type_id', $data['service_type_id']);
        $serviceType = ServiceType::find($data['service_type_id']);

        $date = formatIndonesianDate($data['date']);
        $odometer = $data['km'] + $serviceType->interval_km;

        if($serviceType->category === 'required') {
            $estimatedDate = Carbon::now()->addDays($serviceType->interval_km/50)->toDateString();
            $serviceSchedule->update([
                'status' => 'pending',
                'km_target' => $serviceType->interval_km + $odometer,
                'date_target' => $estimatedDate
            ]);
            $estimatedDate = formatIndonesianDate($estimatedDate);

            $message = "Kamu telah servis $serviceType->name pada tanggal $date, servis lagi saat odometer mu mencapai $odometer KM yaa! estimasi tanggal $estimatedDate";
        } else {
            $message = "Kamu telah servis $serviceType->name pada tanggal $date";
        }
        
        $s = Service::where('vehicle_id',$vehicle->id)->max('km');
        $telemetry = VehicleTelemetry::firstWhere('vehicle_id', $data['vehicle_id']);
        if($s > $telemetry->odometer) {
            $telemetry->update([
                'odometer' => $s
            ]);
        }

        createNotification($user->id, $vehicle->id, $serviceType->name, $message, 'service');

        return response()->json([
            'message' => 'Berhasil menambah servis!',
            'data' => $service
        ], 200);
    }

    public function serviceTypes()
    {
        return response()->json([
            'message' => 'Berhasil mendapatkan tipe servis!',
            'data' => ServiceType::all()
        ], 200);
    }
}
