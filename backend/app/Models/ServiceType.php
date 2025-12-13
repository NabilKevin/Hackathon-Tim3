<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceType extends Model
{
    protected $guarded = ['id'];
    protected $table = 'service_types';
    public $timestamps = false;
}
