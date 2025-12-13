<?php

namespace App\Http\Middleware;

use App\Models\Vehicle;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class hasNoVehicle
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $vehicle = Vehicle::firstWhere('user_id', $user->id);
        if(!$vehicle) {
            return $next($request);
        }
        return response()->json([
            'message' => 'Kamu telah memiliki kendaraan!'
        ], 403);
    }
}
