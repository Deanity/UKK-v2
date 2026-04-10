<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../utils/Response.php";

class UserController {

    /**
     * Memanggil profil detail dari entitas user yang saat ini sedang aktif (login).
     * Terintegrasi dengan otorisasi JWT untuk mendeteksi siapa pemilik token tersebut.
     */
    public static function me() {
        // Melakukan dekripsi dan memverifikasi token terlebih dulu menggunakan middleware
        $payload = AuthMiddleware::auth();

        global $pdo;

        /* ========= GURU ========= */
        // Blok spesifik untuk menangani skenario apabila tipe pengguna adalah administrator atau guru biasa
        if ($payload['type'] === 'guru') {

            // Menyiapkan kueri ekstraksi profil terbatas agar password hash tidak ikut ditarik ke klien
            $stmt = $pdo->prepare("
                SELECT id, nama, username, email, role
                FROM guru
                WHERE id = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$payload['id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Sebagai pertahanan jika token valid tetapi datanya secara misterius lenyap (atau ter-soft delete) di database
            if (!$user) {
                Response::json([
                    "status" => false,
                    "message" => "User tidak ditemukan"
                ], 404);
            }

            // Laporan keberhasilan dengan membalikkan data untuk Guru / Admin
            Response::json([
                "status" => true,
                "user" => $user
            ]);
        }

        /* ========= SISWA ========= */
        // Menangani skenario otentikasi mandiri apabila tipe pemegang sesi merupakan siswa
        if ($payload['type'] === 'siswa') {
            
            // Pengambilan data profil siswa dieksekusi dengan pendekatan agragat dinamis MySQL JSON
            // Ini membantu memaketkan data dari tabel anak (orang_tua) ke dalam satu list array native langsung
            // supaya terhindar dari pemanggilan kueri majemuk dua kali melalui PHP
            $stmt = $pdo->prepare("
                SELECT 
                    s.*,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'nama', o.nama,
                            'hubungan', o.hubungan,
                            'telp', o.telp,
                            'pekerjaan', o.pekerjaan,
                            'alamat', o.alamat
                        )
                    ) AS orang_tua
                FROM siswa s
                LEFT JOIN orang_tua o ON o.id_siswa = s.id AND o.deleted_at IS NULL
                WHERE s.id = ?
                GROUP BY s.id
            ");
            $stmt->execute([$payload['id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Perlu menerjemahkan string hasil return dari MySQL JSON_ARRAYAGG() menjadi array primitif 
            // PHP yang sah via json_decode() agar struktur respons dari endpoint merespons dengan hierarki objektif yang rapi.
            $user['orang_tua'] = json_decode($user['orang_tua'], true);

            // Finalisasi untuk profil identifikasi tipe akun SISWA
            Response::json([
                "status" => true,
                "user" => $user
            ]);
        }

        // Sebagai fallback mutlak jika hasil inspeksi token mencurigakan (tidak dikenali klasifikasinya)
        Response::json([
            "status" => false,
            "message" => "User tidak ditemukan"
        ], 404);
    }
}
