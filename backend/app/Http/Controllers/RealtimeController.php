<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\RealtimeService;

class RealtimeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function demo(Request $request)
    {
        RealtimeService::send(
            $request->input('message', 'HELLO FROM SERVICE')
        );

        return response()->json([
            'status' => 'ok',
            'message' => 'Event broadcasted'
        ]);
    }
}
