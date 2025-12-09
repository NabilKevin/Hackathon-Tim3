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

**SinyalRoda** adalah aplikasi mobile berbasis IoT yang memberikan solusi lengkap untuk **keamanan & monitoring kendaraan modern**, sangat relevan dengan perkembangan industri otomotif – terutama kendaraan listrik (EV) di Indonesia.

## ⚡ Latar Belakang Masalah

Indonesia memiliki lebih dari **125 juta sepeda motor** (data Korlantas Polri) – terbesar di Asia Tenggara. Sayangnya, sistem keamanan dan monitoring masih sangat terbatas:

| Masalah                              | Dampak                                                                 |
|--------------------------------------|------------------------------------------------------------------------|
| Tingginya kasus pencurian motor      | Terjadi setiap hari di hampir seluruh wilayah Indonesia               |
| Fitur keamanan motor masih mekanis  | Mudah dibobol                                                          |
| Tidak ada tracking real-time         | Sulit menemukan kendaraan jika hilang                                  |
| Minim monitoring baterai & sensor    | Pengguna tidak tahu kondisi kesehatan kendaraan                        |
| Lupa jadwal servis & riwayat perawatan | Biaya perbaikan membengkak karena kerusakan tidak terdeteksi dini      |
| Belum ada platform all-in-one        | Pengguna harus pakai banyak aplikasi terpisah                          |

**SinyalRoda hadir sebagai solusi satu atap (all-in-one).**

## ✨ Fitur Utama

- 🔒 **Smart Security** – Alarm anti-maling, immobilizer digital, notifikasi jika motor digerakkan tanpa izin
- 🛰️ **Real-time GPS Tracking** – Lacak posisi kendaraan kapan saja
- 📊 **Vehicle Health Monitoring** – Status baterai, suhu mesin, tekanan ban, voltase (khususnya untuk motor listrik)
- 🚨 **Geo-fencing** – Peringatan jika kendaraan keluar dari zona aman
- 🛠️ **Smart Service Reminder** – Pengingat jadwal servis otomatis + riwayat perawatan
- 📱 **IoT Integration** – Terhubung langsung dengan modul OBD/IoT di kendaraan
- 🌙 **Dark Mode & UI Modern** – Desain ramah pengguna, clean, dan responsif

## 🛠 Teknologi yang Digunakan

| Layer               | Teknologi                              | Keterangan                                    |
|---------------------|----------------------------------------|-----------------------------------------------|
| Mobile Frontend     | React Native                           | Cross-platform (Android & iOS)                |
| Backend API         | Laravel (PHP)                          | RESTful API, autentikasi JWT                  |
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
php artisan serve
