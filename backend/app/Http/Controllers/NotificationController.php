<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    /**
     * Mendapatkan daftar notifikasi pengguna yang sedang login.
     *
     * Mengembalikan semua notifikasi atau difilter berdasarkan tipe.
     *
     * @queryParam type string optional Tipe notifikasi: 'security', 'service', 'system', 'warning'. Jika tidak diisi, kembalikan semua. Example: service
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil mendapatkan notifikasi!",
     *   "data": [
     *     {
     *       "id": 1,
     *       "user_id": 1,
     *       "title": "Servis Mendekat",
     *       "content": "Kendaraan Anda perlu servis oli mesin.",
     *       "type": "service",
     *       "is_read": false,
     *       "created_at": "2025-12-06T10:00:00.000000Z",
     *       "updated_at": "2025-12-06T10:00:00.000000Z"
     *     }
     *   ]
     * }
     */
    public function index(Request $request)
    {
        $type = $request->query('type', 'all');

        $validTypes = ['security', 'service', 'system', 'warning','device'];
        if ($type !== 'all' && !in_array($type, $validTypes)) {
            return response()->json([
                'message' => 'Tipe notifikasi tidak valid.'
            ], 422);
        }

        $query = Notification::where('user_id', Auth::id());

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        $notifications = $query->latest()->get();

        $notifications = $notifications->map(function($notification) {
            $notification['excerpt'] = Str::limit($notification->content, 60, '...');
            $notification['time'] = $notification->created_at->diffForHumans();
            return $notification;
        });

        return response()->json([
            'message' => 'Berhasil mendapatkan notifikasi!',
            'data' => NotificationResource::collection($notifications)
        ], 200);
    }

    /**
     * Menampilkan detail notifikasi berdasarkan ID.
     *
     * Hanya notifikasi milik pengguna yang sedang login yang dapat dilihat.
     *
     * @urlParam id integer required ID notifikasi. Example: 1
     *
     * @response 200 scenario="Berhasil" {
     *   "message": "Berhasil mendapatkan notifikasi!",
     *   "data": {
     *     "id": 1,
     *     "user_id": 1,
     *     "title": "Servis Mendekat",
     *     "content": "Kendaraan Anda perlu servis oli mesin.",
     *     "type": "service",
     *     "is_read": false,
     *     "created_at": "2025-12-06T10:00:00.000000Z",
     *     "updated_at": "2025-12-06T10:00:00.000000Z"
     *   }
     * }
     *
     * @response 404 scenario="Notifikasi tidak ditemukan" {
     *   "message": "Notifikasi tidak ditemukan!"
     * }
     *
     * @response 403 scenario="Akses ditolak" {
     *   "message": "Bukan notifikasi milik Anda!"
     * }
     */
    public function show($id)
    {
        $user = Auth::user();
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'message' => 'Notifikasi tidak ditemukan!'
            ], 404);
        }

        if ($notification->user_id !== $user->id) {
            return response()->json([
                'message' => 'Bukan notifikasi milik Anda!'
            ], 403);
        }

        return response()->json([
            'message' => 'Berhasil mendapatkan notifikasi!',
            'data' => $notification
        ], 200);
    }

   public function latest(Request $request)
{
    $type  = $request->query('type', 'all');
    $limit = $request->query('limit', 1);
    
    $validTypes = ['security', 'service', 'system', 'warning', 'device'];
    if ($type !== 'all' && !in_array($type, $validTypes)) {
        return response()->json([
            'message' => 'Tipe notifikasi tidak valid.'
        ], 422);
    }

    $query = Notification::where('user_id', Auth::id())
        ->orderBy('created_at', 'desc');

    if ($type !== 'all') {
        $query->where('type', $type);
    }

    $notifications = $query
        ->limit((int) $limit)
        ->get();

    return response()->json([
        'message' => 'Berhasil mendapatkan notifikasi terkini!',
        'data' => NotificationResource::collection($notifications)
    ]);
}
public function markAsRead($id)
{
    $notification = Notification::where('id', $id)
        ->where('user_id', Auth::id())
        ->first();

    if (!$notification) {
        return response()->json([
            'message' => 'Notifikasi tidak ditemukan!'
        ], 404);
    }

    $notification->update([
        'is_read' => true
    ]);

    return response()->json([
        'message' => 'Notifikasi berhasil ditandai sebagai dibaca.'
    ]);
}
 public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('is_read', 0)
            ->count();

        return response()->json([
            'count' => $count
        ]);
    }
public function markAllAsRead()
{
    Notification::where('user_id', Auth::id())
        ->where('is_read', false)
        ->update(['is_read' => true]);

    return response()->json([
        'message' => 'Semua notifikasi ditandai sebagai dibaca.'
    ]);
}


}