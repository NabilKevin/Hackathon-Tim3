<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Vehicle;
use App\Http\Services\VehicleSecurityService;

class SimulateVehicleEvent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vehicle:simulate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto simulate vehicle IoT events';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $vehicles = Vehicle::with([
            'notificationTrigger',
            'securitySetting'
        ])->get();

        if ($vehicles->isEmpty()) {
            $this->info('No vehicles found');
            return;
        }

        foreach ($vehicles as $vehicle) {

            // Anti-theft must be enabled
            if (!$vehicle->securitySetting?->anti_theft_enabled) {
                continue;
            }

            $triggers = $vehicle->notificationTrigger;
            if (!$triggers) {
                continue;
            }

            $events = [];

            if ($triggers->engine_on)   $events[] = 'engine_on';
            if ($triggers->vibration)   $events[] = 'vibration';
            if ($triggers->wheel_move)  $events[] = 'wheel_move';

            if (empty($events)) {
                continue;
            }

            // 40% probability (realistic IoT noise)
            if (rand(1, 100) <= 10) {
                $event = $events[array_rand($events)];

                VehicleSecurityService::handleEvent($vehicle, $event);

                $this->info("Simulated {$event} for vehicle #{$vehicle->id}");
            }
        }
    }

}
