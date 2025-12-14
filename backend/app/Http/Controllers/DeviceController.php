<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\DevicePairingLog;
use App\Models\Device;
use App\Models\VehicleTelemetry;

class DeviceController extends Controller
{
    public function ping(Request $request)
{
    $request->validate([
        'device_serial_number' => 'required|string'
    ]);

    $user = $request->user();

    $vehicle = Vehicle::where('user_id', $user->id)->first();
    if (!$vehicle) {
        return response()->json([
            'message' => 'User has no vehicle'
        ], 403);
    }

    // Vehicle sudah punya device?
    if ($vehicle->device_id) {
        return response()->json([
            'message' => 'Vehicle already paired with a device'
        ], 409);
    }

    $device = Device::where('device_serial_number', $request->device_serial_number)->first();

    // Device sudah dipakai user lain?
    if ($device && $device->paired) {
        return response()->json([
            'message' => 'Device already paired'
        ], 409);
    }

    // Create jika belum ada
    if (!$device) {
        $device = Device::create([
            'device_serial_number' => $request->device_serial_number,
            'device_name' => 'IoT Tracker',
            'device_model' => 'Unknown',
            'device_type' => 'GPS',
            'connection_type' => 'WiFi',
            'paired' => false,
        ]);
    }

    // Pairing
    $device->update([
        'paired' => true,
        'paired_at' => now(),
    ]);

    $vehicle->update([
        'device_id' => $device->id
    ]);

    DevicePairingLog::create([
        'device_id' => $device->id,
        'vehicle_id' => $vehicle->id,
        'user_id' => $user->id,
        'action' => 'paired'
    ]);

    VehicleTelemetry::create([
        'vehicle_id' => $vehicle->id,
        'odometer' => rand(10000, 30000)
    ]);

    return response()->json([
        'message' => 'Device paired successfully',
        'device' => $device
    ]);
}

public function status(Request $request)
{
    $user = $request->user();

    $vehicle = Vehicle::where('user_id', $user->id)
        ->with('device')
        ->first();

    // User belum punya kendaraan
    if (!$vehicle) {
        return response()->json([
            'device_connected' => false,
            'message' => 'User has no vehicle'
        ]);
    }

    // Kendaraan belum dipasangkan device
    if (!$vehicle->device) {
        return response()->json([
            'device_connected' => false,
            'message' => 'Vehicle has no device paired'
        ]);
    }

    // Sudah punya device
    return response()->json([
        'device_connected' => true,
        'device' => [
            'id' => $vehicle->device->id,
            'device_serial_number' => $vehicle->device->device_serial_number,
            'device_name' => $vehicle->device->device_name,
            'device_model' => $vehicle->device->device_model,
            'device_type' => $vehicle->device->device_type,
            'paired_at' => $vehicle->device->paired_at,
        ]
    ]);
}



}
