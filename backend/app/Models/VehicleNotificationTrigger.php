<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleNotificationTrigger extends Model
{
    protected $guarded = ['id'];

    protected $hidden = [
        'id',
        'vehicle_id',
        'created_at',
        'updated_at',
    ];

}
