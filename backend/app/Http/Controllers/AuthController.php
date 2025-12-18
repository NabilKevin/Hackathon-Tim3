<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    private function uploadFile($file, $userId)
    {
        $timestamp = now()->format('YmdHis');
        $extension = $file->getClientOriginalExtension();
        $fileName = "users_{$userId}_{$timestamp}.{$extension}";
        return $file->storeAs('users', $fileName, 'public');
    }
    /**
     * Login pengguna dan dapatkan token akses.
     *
     * Endpoint ini memungkinkan pengguna masuk dengan email dan password.
     * Jika kredensial valid, sistem mengembalikan token akses (Bearer Token)
     * yang digunakan untuk autentikasi di endpoint lain.
     *
     * @bodyParam email string required Email pengguna. Example: user@example.com
     * @bodyParam password string required Password pengguna. Example: secret123
     *
     * @response 200 scenario="Berhasil login" {
     *   "message": "Berhasil Login!",
     *   "token": "1|abcdefghijklmnopqrstuvwxyz1234567890",
     *   "user": {
     *     "id": 1,
     *     "username": "johndoe",
     *     "email": "johndoe@example.com",
     *     "created_at": "2025-12-01T10:00:00.000000Z",
     *     "updated_at": "2025-12-01T10:00:00.000000Z"
     *   }
     * }
     *
     * @response 422 scenario="Validasi gagal" {
     *   "message": "Kolom tidak valid",
     *   "errors": {
     *     "email": ["The email field is required."]
     *   }
     * }
     *
     * @response 401 scenario="Kredensial salah" {
     *   "message": "Email atau password salah!"
     * }
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Kolom tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        if (!Auth::attempt($data)) {
            return response()->json([
                'message' => 'Email atau password salah!'
            ], 401);
        }

        $user = User::firstWhere('email', $data['email']);
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => 'Berhasil Login!',
            'token' => $token,
            'user' => $user
        ], 200);
    }

//     public function savePushToken(Request $request)
// {
//     $request->validate([
//         'expo_push_token' => 'required|string'
//     ]);

//     $request->user()->update([
//         'expo_push_token' => $request->expo_push_token
//     ]);

//     return response()->json([
//         'message' => 'Push token saved'
//     ]);
// }


    /**
     * Logout pengguna.
     *
     * Menghancurkan sesi pengguna. Untuk aplikasi berbasis token (SPA),
     * Anda sebaiknya juga menghapus token di sisi klien.
     *
     * @authenticated
     *
     * @response 200 scenario="Berhasil logout" {
     *   "message": "Berhasil Logout!"
     * }
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Berhasil Logout!'
        ], 200);
    }

    /**
     * Mendaftarkan pengguna baru.
     *
     * Membuat akun pengguna baru. Username dan email harus unik.
     *
     * @bodyParam username string required Minimal 4 karakter, unik. Example: johndoe
     * @bodyParam email string required Format email valid, unik. Example: johndoe@example.com
     * @bodyParam password string required Minimal 8 karakter. Example: securepassword123
     * @bodyParam password_confirmation string required Harus sama dengan password. Example: securepassword123
     *
     * @response 200 scenario="Registrasi berhasil" {
     *   "message": "Register berhasil!",
     *   "user": {
     *     "id": 2,
     *     "username": "janedoe",
     *     "email": "janedoe@example.com",
     *     "created_at": "2025-12-06T12:00:00.000000Z",
     *     "updated_at": "2025-12-06T12:00:00.000000Z"
     *   }
     * }
     *
     * @response 422 scenario="Validasi gagal" {
     *   "message": "Kolom tidak valid",
     *   "errors": {
     *     "email": ["The email has already been taken."]
     *   }
     * }
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|min:4|unique:users,username',
            'email' => 'required|email:dns|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Kolom tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['password'] = bcrypt($data['password']);
        
        $user = User::create($data);

        return response()->json([
            'message' => 'Register berhasil! silahkan login',
            'user' => $user
        ], 200);
    }

    /**
     * Memperbarui profil pengguna yang sedang login.
     *
     * Mengizinkan pengguna mengubah username, email, atau password.
     * Hanya field yang dikirim yang akan diupdate.
     * Jika mengganti password, pastikan kirim `password_confirmation`.
     *
     * @authenticated
     *
     * @bodyParam username string optional Jika diubah, harus unik dan minimal 4 karakter. Example: johndoe_new
     * @bodyParam email string optional Jika diubah, harus berupa email unik. Example: newemail@example.com
     * @bodyParam password string optional Minimal 8 karakter. Example: newpassword123
     * @bodyParam password_confirmation string optional Harus cocok dengan password. Example: newpassword123
     *
     * @response 200 scenario="Update berhasil" {
     *   "message": "Berhasil update user!",
     *   "user": {
     *     "id": 1,
     *     "username": "johndoe_new",
     *     "email": "newemail@example.com",
     *     "created_at": "2025-12-01T10:00:00.000000Z",
     *     "updated_at": "2025-12-06T14:30:00.000000Z"
     *   }
     * }
     *
     * @response 422 scenario="Validasi gagal" {
     *   "message": "Kolom tidak valid",
     *   "errors": {
     *     "username": ["The username has already been taken."]
     *   }
     * }
     */
    public function update(Request $request)
    {
        $user = $request->user();
        $rule = [
            'username' => 'sometimes|min:4|unique:users,username,' . $user->id ,
            'email' => 'sometimes|email:dns|unique:users,email,' . $user->id ,
            'password' => 'sometimes|string|min:8|confirmed',
            'current_password' => 'sometimes|string|required_with:password',
            'image' => 'sometimes|image|mimes:jpg,png,jpeg,webp|max:2048',
        ];
        $validator = Validator::make($request->all(), $rule);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Kolom tidak valid',
                'errors' => $validator->errors(),
                'data' => $request->all(),
                's' => $request->file('image')
            ], 422);
        }

        $data = $validator->validated();
        $user = $request->user();
        
        if (isset($data['password'])) {

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Kolom tidak valid',
                    'errors' => [
                        'current_password' => ['Password lama tidak sesuai.']
                    ]
                ], 422);
            }
            $data['password'] = bcrypt($data['password']);
        }

        if(isset($data['image'])) {
            $filePath = $this->uploadFile($data['image'], $user->id);
            $data['image'] = $filePath;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Berhasil update user!',
            'user' => $user
        ], 200);
    }
}