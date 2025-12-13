<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\VehicleSecurityController;
use App\Http\Middleware\hasNoVehicle;
use App\Http\Middleware\hasVehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::middleware('guest')->group(function() {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

Route::middleware('auth:sanctum')->group(function() {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::put('update-profile', [AuthController::class, 'update']);

    Route::prefix('notifications')->group(function() {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('{id}', [NotificationController::class, 'show']);
    });

    Route::middleware(hasNoVehicle::class)->group(function() {
        Route::post('vehicles', [VehicleController::class, 'store']);
    });
    
    Route::middleware(hasVehicle::class)->group(function() {
        Route::prefix('vehicles')->group(function() {
            Route::put('/', [VehicleController::class, 'update']);
            Route::get('status', [VehicleController::class, 'vehicleStatus']);
            Route::get('detail', [VehicleController::class, 'vehicleDetail']);
            
            Route::get('security', [VehicleSecurityController::class, 'index']);
            Route::post('security', [VehicleSecurityController::class, 'toggleSecurity']);
        });

        Route::prefix('services')->group(function() {
            Route::get('schedules', [ServiceController::class, 'serviceSchedules']);
            
            Route::get('/', [ServiceController::class, 'serviceHistories']);
            Route::get('{id}', [ServiceController::class, 'serviceHistory']);
            Route::post('/', [ServiceController::class, 'store']);
        });
    });
});