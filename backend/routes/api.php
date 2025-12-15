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

Route::middleware('guest')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('realtime/demo', [RealtimeController::class, 'demo']);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::post('users/push-token', [AuthController::class, 'savePushToken']);

    Route::post('logout', [AuthController::class, 'logout']);
    Route::put('update-profile', [AuthController::class, 'update']);

    Route::prefix('notifications')->middleware('auth:sanctum')->group(function () {

        Route::get('/latest', [NotificationController::class, 'latest']);
         Route::get('unread-count', [NotificationController::class, 'unreadCount']);

        Route::get('/', [NotificationController::class, 'index']);
        Route::get('{id}', [NotificationController::class, 'show']);

        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
       
    });




    Route::middleware(hasNoVehicle::class)->group(function () {
        Route::post('vehicles', [VehicleController::class, 'store']);
    });

    Route::middleware(hasVehicle::class)->group(function () {

        Route::prefix('vehicles')->group(function () {

            // Vehicle core
            Route::put('/', [VehicleController::class, 'update']);
            Route::get('status', [VehicleController::class, 'vehicleStatus']);
            Route::get('detail', [VehicleController::class, 'vehicleDetail']);

            // IoT / Telemetry
            Route::get('telemetry', [VehicleController::class, 'telemetry']);
            // Route::post('pair-device', [VehicleController::class, 'pairDevice']);

            // Security
            Route::get('security', [VehicleSecurityController::class, 'index']);
            Route::post('security/toggle', [VehicleSecurityController::class, 'toggleSecurity']);

            // 🚗 VEHICLE ACTIONS
            Route::post('alarm/on', [VehicleSecurityController::class, 'alarmOn']);
            Route::post('alarm/off', [VehicleSecurityController::class, 'alarmOff']);
            Route::post('engine/off', [VehicleSecurityController::class, 'engineOff']);
            Route::post('engine/on', [VehicleSecurityController::class, 'engineOn']);
            // IoT Event Simulation
            Route::post('simulate-event', [VehicleSecurityController::class, 'simulateEvent']);
        });

        Route::prefix('services')->group(function () {
            Route::get('schedules', [ServiceController::class, 'serviceSchedules']);
            Route::get('/', [ServiceController::class, 'serviceHistories']);
            Route::get('{id}', [ServiceController::class, 'serviceHistory']);
            Route::post('/', [ServiceController::class, 'store']);
        });

        // Device heartbeat
        Route::post('devices/ping', [DeviceController::class, 'ping']);
        Route::post('devices/status', [DeviceController::class, 'status']);
    });
});
