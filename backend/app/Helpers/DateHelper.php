<?php

if (!function_exists('formatIndonesianDate')) {
    /**
     * Mengubah tanggal dari format YYYY-MM-DD menjadi format Indonesia: "12 Desember 2025"
     *
     * @param string $dateString Tanggal dalam format 'Y-m-d' (contoh: '2025-12-12')
     * @return string|null Format tanggal Indonesia, atau null jika input tidak valid
     */
    function formatIndonesianDate(string $dateString): ?string
    {
        if (!$dateString) {
            return null;
        }

        // Daftar bulan dalam Bahasa Indonesia
        $bulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        // Validasi dan parse tanggal
        $date = \DateTime::createFromFormat('Y-m-d', $dateString);

        if (!$date || $date->format('Y-m-d') !== $dateString) {
            return null; // Format tidak valid
        }

        $day = (int) $date->format('d');
        $month = (int) $date->format('m');
        $year = (int) $date->format('Y');

        return "{$day} {$bulan[$month]} {$year}";
    }
}