<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\VehicleSecurityController;
use App\Http\Middleware\hasNoVehicle;
use App\Http\Middleware\hasVehicle;
use Illuminate\Http\Request;
use App\Http\Controllers\DeviceController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RealtimeController;
// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::middleware('guest')->group(function() {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('realtime/demo', [RealtimeController::class, 'demo']);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::post('logout', [AuthController::class, 'logout']);
    Route::put('update-profile', [AuthController::class, 'update']);

    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('{id}', [NotificationController::class, 'show']);
        Route::get('/notifications/latest', [NotificationController::class, 'latest']);
    });

    Route::middleware(hasNoVehicle::class)->group(function () {
        Route::post('vehicles', [VehicleController::class, 'store']);
    });
    
    Route::middleware(hasVehicle::class)->group(function() {
        Route::prefix('vehicles')->group(function() {
            Route::put('/', [VehicleController::class, 'update']);
            Route::put('{id}/updateOdometer', [VehicleController::class, 'updateOdometer']);
            Route::get('status', [VehicleController::class, 'vehicleStatus']);
            Route::get('detail', [VehicleController::class, 'vehicleDetail']);

            // IoT / Telemetry
            Route::get('telemetry', [VehicleController::class, 'telemetry']);
            // Route::post('pair-device', [VehicleController::class, 'pairDevice']);

            // Security
            Route::get('security', [VehicleSecurityController::class, 'index']);
            Route::post('security', [VehicleSecurityController::class, 'toggleSecurity']);

            // IoT Event Simulation
            Route::post('simulate-event', [VehicleSecurityController::class, 'simulateEvent']);
        });

        Route::prefix('services')->group(function () {
            Route::get('schedules', [ServiceController::class, 'serviceSchedules']);
            Route::get('/', [ServiceController::class, 'serviceHistories']);
            Route::get('/types', [ServiceController::class, 'serviceTypes']);
            Route::get('{id}', [ServiceController::class, 'serviceHistory']);
            Route::post('/', [ServiceController::class, 'store']);
        });

        // Device heartbeat
        Route::post('devices/ping', [DeviceController::class, 'ping']);
        Route::post('devices/status', [DeviceController::class, 'status']);
    });
});