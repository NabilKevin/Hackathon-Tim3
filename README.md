# SinyalRoda 🚀
*Solusi all-in-one untuk keamanan, tracking, monitoring, dan perawatan kendaraan bermotor – khususnya motor listrik di Indonesia.*
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat&logo=laravel&logoColor=white)](https://laravel.com/)
## 👥 Tim Pengembang
| Nama                    | Peran                          |
|-------------------------|--------------------------------|
| Nur Hadi                | Project Manager & UI/UX Designer |
| Nabil Kevin Ramadhan    | Backend Developer              |
| Ricky Darmawan          | Frontend Developer             |

## 📖 Tentang SinyalRoda
## Deskripsi Tentang SinyalRoda

**SinyalRoda** adalah aplikasi mobile berbasis IoT yang memberikan solusi lengkap untuk **keamanan & monitoring kendaraan modern**, sangat relevan dengan perkembangan industri otomotif – terutama kendaraan listrik (EV) di Indonesia.
**Sinyal Roda** adalah sebuah aplikasi pemantauan dan manajemen operasional untuk kendaraan roda dua (terutama motor) yang dirancang untuk membantu pengguna dalam mendapatkan informasi kondisi kendaraan secara real-time dan lebih terstruktur. Aplikasi ini memungkinkan pengguna untuk mencatat, memonitor, dan menerima pengingat mengenai perawatan berkala seperti servis, penggantian oli, dan komponen penting lainnya. Dengan adanya sistem notifikasi dan pencatatan otomatis, pengguna tidak lagi perlu mengingat manual jadwal perawatan, sehingga risiko kerusakan akibat keterlambatan servis dapat diminimalisir.

## ⚡ Latar Belakang Masalah
Selain itu, **Sinyal Roda** juga menyediakan fitur pencatatan sederhana terkait riwayat perawatan kendaraan, biaya servis. Dengan teknologi web dan mobile yang terintegrasi, proyek ini bertujuan memberikan kemudahan bagi pemilik kendaraan roda dua dalam menjaga performa kendaraan tetap optimal dan aman digunakan.Dan juga Aplikasi ini memiliki fitur tambahan untuk keamanan kendaraan, seperti fitur engine-lock, alarm, getaran, dan juga pelacakan lokasi terkini kendaraan. Aplikasi ini diharapkan dapat meningkatkan kesadaran pemeliharaan mandiri dan membantu pengguna dalam membuat keputusan yang lebih tepat terkait perawatan kendaraan mereka dan membantu pengguna untuk memiliki kontrol lebih pada kendaraan nya dan meminimalisir pencurian.

## Latar Belakang Masalah

Indonesia memiliki lebih dari **125 juta sepeda motor** (data Korlantas Polri) – terbesar di Asia Tenggara. Sayangnya, sistem keamanan dan monitoring masih sangat terbatas:

Indonesia memiliki lebih dari **125 juta sepeda motor** (data Korlantas Polri) 

**SinyalRoda hadir sebagai solusi satu atap (all-in-one).**

## ✨ Fitur Utama
## Fitur Utama

- 🔒 **Smart Security** – Alarm anti-maling, immobilizer digital, notifikasi jika motor digerakkan tanpa izin
- 🔒 **Smart Security** – Alarm anti-maling, Fitur Matikan Mesin dari Smartphone, notifikasi jika motor digerakkan tanpa izin
- 🛰️ **Real-time GPS Tracking** – Lacak posisi kendaraan kapan saja
- 📊 **Vehicle Health Monitoring** – Status baterai, suhu mesin, tekanan ban, voltase (khususnya untuk motor listrik)
- 📊 **Vehicle Health Monitoring** – Status aki/baterai, bensin, Odometer, voltase (khususnya untuk motor listrik)
- 🚨 **Geo-fencing** – Peringatan jika kendaraan keluar dari zona aman
- 🛠️ **Smart Service Reminder** – Pengingat jadwal servis otomatis + riwayat perawatan
- 📱 **IoT Integration** – Terhubung langsung dengan modul OBD/IoT di kendaraan
- 🌙 **Dark Mode & UI Modern** – Desain ramah pengguna, clean, dan responsif
## 🛠 Teknologi yang Digunakan
| Layer               | Teknologi                              | Keterangan                                    |
|---------------------|----------------------------------------|-----------------------------------------------|
| Mobile Frontend     | React Native                           | Cross-platform (Android & iOS)                |
| Backend API         | Laravel (PHP)                          | RESTful API, autentikasi Sanctum               |
| Database            | MySQL                                  | Struktur data relasional                      |
| IoT / Device Layer  | Modul OBD custom (BLE/WiFi) – simulasi | Mengirim data sensor dalam format JSON        |
| Cloud Hosting       | Vercel / Netlify (Frontend)<br>Laravel Vapor / VPS (Backend) | Skalabel & serverless-ready |
## 🚀 Cara Menjalankan Proyek (Development)
### Prasyarat
- Node.js ≥ 18
- PHP ≥ 8.1
- Composer
- MySQL
- Expo CLI (untuk React Native)
### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host 0.0.0.0

Langkah Instalasi
cd backend
composer install
cp .env.example .env


Buka .env dan atur konfigurasi database:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1      # Sesuaikan IP jika menggunakan device fisik
DB_PORT=3306
DB_DATABASE=sinyalroda
DB_USERNAME=root
DB_PASSWORD=secret


Generate app key:

php artisan key:generate


Migrasi dan seed database:

php artisan migrate --seed


Jalankan server:

php artisan serve


Server akan berjalan di: http://127.0.0.1(IP Komputer):8000

⚠️ Jika menggunakan device fisik untuk testing, pastikan IP backend dan device sama dalam jaringan lokal. Misal:

DB_HOST=192.168.1.100
BASE_URL=http://192.168.1.100:8000/api

3. Frontend (React Native + Expo)
Prasyarat

Node.js ≥ 18

npm atau yarn

Expo CLI

npm install -g expo-cli


Download Expo Go di Android/iOS untuk testing device fisik

Langkah Instalasi
cd frontend
npm install


Buka file frontend/services/api.ts dan pastikan BASE_URL sesuai dengan IP backend, misal:

export const BASE_URL = "http://192.168.1.100:8000/api";


Jalankan aplikasi:

npm start


Akan terbuka Metro Bundler. Scan QR di Expo Go untuk membuka di device fisik atau jalankan di emulator.

4. Build APK Android (Production)

Login ke Expo

npx expo login


Konfigurasi EAS Build

eas build:configure


Pilih platform: Android

Ini akan membuat file eas.json otomatis

Build APK

eas build -p android --profile production


Tunggu proses selesai. Link download APK akan muncul di dashboard Expo: https://expo.dev/accounts/<username>/projects/sinyalroda-app/builds

⚠️ Pastikan backend tetap berjalan saat testing aplikasi mobile, terutama untuk fetch data real-time.
