<?php

namespace Database\Seeders;

use App\Models\ServiceType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        ServiceType::create([
            'name' => 'Oli Mesin',
            'interval_km' => 2500
        ]);
        ServiceType::create([
            'name' => 'Oli Gear',
            'interval_km' => 4500
        ]);
        ServiceType::create([
            'name' => 'Rutin',
            'interval_km' => 40000
        ]);
        ServiceType::create([
            'name' => 'Lainnya',
            'category' => 'optional'
        ]);
    }
}   
