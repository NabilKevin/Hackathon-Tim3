<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicle_telemetries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('odometer')->nullable();
            $table->float('accumulator')->nullable(); // biasanya voltase aki
            $table->string('transmission')->nullable();
            $table->float('gas_level')->nullable();
            $table->string('gas_type')->nullable();
            $table->string('machine_capacity')->nullable();
            $table->boolean('engine_status')->boolean();
            $table->boolean('alarm_status')->boolean();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_telemetries');
    }
};
