<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $guarded = ['id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    public function device()
    {
        return $this->belongsTo(Device::class, 'device_id', 'id');
    }
    public function telemetry()
    {
        return $this->hasOne(VehicleTelemetry::class, 'vehicle_id', 'id');
    }
    public function geofences()
    {
        return $this->hasMany(VehicleGeofence::class, 'vehicle_id', 'id');
    }
    public function locations()
    {
        return $this->hasMany(VehicleLocation::class, 'vehicle_id', 'id');
    }
    public function security()
    {
        return $this->hasOne(VehicleSecuritySetting::class, 'vehicle_id', 'id');
    }
    public function notification_trigger()
    {
        return $this->hasOne(VehicleNotificationTrigger::class, 'vehicle_id', 'id');
    }
    public function service_schedules()
    {
        return $this->hasMany(ServiceSchedule::class, 'vehicle_id', 'id');
    }
    public function services()
    {
        return $this->hasMany(Service::class, 'vehicle_id', 'id');
    }
}
