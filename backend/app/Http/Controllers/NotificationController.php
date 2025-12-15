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

        $validTypes = ['security', 'service', 'system', 'warning'];
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
    $userId = Auth::id();
    $limit = (int) $request->query('limit', 1);

    // Ambil notifikasi terbaru (prioritaskan unread)
    $notifications = Notification::where('user_id', $userId)
        ->orderBy('is_read', 'asc') // unread dulu
        ->latest()
        ->take($limit)
        ->get()
        ->map(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->title,
                'content' => $notification->content,
                'excerpt' => Str::limit($notification->content, 60, '...'),
                'type' => $notification->type,
                'is_read' => $notification->is_read,
                'created_at' => $notification->created_at,
            ];
        });

    $hasUnread = Notification::where('user_id', $userId)
        ->where('is_read', false)
        ->exists();

    return response()->json([
        'message' => 'Berhasil mendapatkan notifikasi terkini!',
        'data' => [
            'has_unread' => $hasUnread,
            'notifications' => $notifications
        ]
    ], 200);
}


}