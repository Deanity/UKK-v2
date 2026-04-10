<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../utils/Response.php";
require_once __DIR__ . "/../utils/Token.php";

class AuthController {

    /**
     * Memproses autentikasi login pengguna.
     * Fungsi ini akan mengecek kredensial (username dan password) secara bergantian
     * ke dalam tabel guru dan tabel siswa untuk menentukan hak akses otoritas server.
     * Jika sukses, akan memproduksi JWT token sebagai tiket masuk rahasia.
     */
    public static function login() {
        // Menerima data payload dari sisi frontend dalam format baris balok JSON
        $input = json_decode(file_get_contents("php://input"), true);

        // Jika form kosong melompong atau JSON mengalami kerusakan susunan
        if (!$input) {
            Response::json(["status"=>false,"message"=>"Invalid JSON"], 400);
        }

        // Mengekstrak username dan sandi dari payload secara aman (disematkan string kosong jika ditiadakan isinya)
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        // Melakukan validasi pengisian wajib di atas parameter kedua form krusial login
        if (!$username || !$password) {
            Response::json(["status"=>false,"message"=>"Username dan password wajib diisi"], 422);
        }

        global $pdo;

        /* ========= CEK KE TABEL GURU ========= */
        // Menyiapkan pencarian username secara terenkapsulasi pada tabel guru
        $stmt = $pdo->prepare("SELECT * FROM guru WHERE username=? AND deleted_at IS NULL");
        $stmt->execute([$username]);
        $guru = $stmt->fetch(PDO::FETCH_ASSOC);

        // Memvalidasi sinkronisasi sandi menggunakan parameter verifikasi bawaan hash PHP
        if ($guru && password_verify($password, $guru['password'])) {
            // Apabila kata sandi tersertifikasi benar, program memformulasikan struktur token JWT
            $token = Token::generate([
                "id"   => $guru['id'],
                "role" => $guru['role'], // Menampung parameter kewenangan staf (admin, guru, bk)
                "type" => "guru"
            ]);

            // Mengirim balik struktur persetujuan login berisi payload token beserta salinan data umum diri pengakses
            Response::json([
                "status" => true,
                "message" => "Login berhasil",
                "token" => $token,
                "user" => [
                    "id" => $guru['id'],
                    "nama" => $guru['nama'],
                    "username" => $guru['username'],
                    "email" => $guru['email'],
                    "role" => $guru['role'],
                    "type" => "guru"
                ]
            ]);
        }

        /* ========= CEK KE TABEL SISWA ========= */
        // Andaikata pencarian tabel guru dimentahkan ketidakcocokan, sistem secara mekanis beralih seleksi tabel siswa
        $stmt = $pdo->prepare("SELECT * FROM siswa WHERE username=? AND deleted_at IS NULL");
        $stmt->execute([$username]);
        $siswa = $stmt->fetch(PDO::FETCH_ASSOC);
    
        // Proses validasi pencocokan sandi tersandi mirip seperti langkah verifikator level guru di awal
        if ($siswa && password_verify($password, $siswa['password'])) {
            // Pencetakan spesifikasi JWT milik sang siswa khusus
            $token = Token::generate([
                "id"   => $siswa['id'],
                "role" => "siswa",
                "type" => "siswa"
            ]);

            // Transmisi respon positif yang akhirnya akan ditanggapi aksi penataan window oleh React frontend browser
            Response::json([
                "status" => true,
                "message" => "Login berhasil",
                "token" => $token,
                "user" => [
                    "id" => $siswa['id'],
                    "nama" => $siswa['nama'],
                    "username" => $siswa['username'],
                    "email" => $siswa['email'],
                    "role" => "siswa",
                    "type" => "siswa"
                ]
            ]);
        }

        // Tembakan respons penolak tungkas jika tak satupun dari tabel guru maupun siswa mengakui kata sandi atau keberadaan rasio username-nya 
        Response::json([
            "status" => false,
            "message" => "Username atau password salah"
        ], 401);
    }

    /**
     * Memproses perintah terminasi riwayat sesi atau fase keluar otomatis sistemisasi.
     * Mengingat arsitektur otentikasi di aplikasi ini dibangun dengan konsep 'stateless JWT', eksekusi backend direkayasa cukup ringan dan tanpa relasi database.
     */
    public static function logout() {
        // Dalam filosofi server tanpa state (stateless JWT), hanya sang klien (frontend app) saja yang punya andil nyata  
        // mengekskusi kewajiban bersih menyimpan, dan ini cukup digamit memusnahkan riwayat token di storage mereka sendiri.
        // Karena itu blok backend melulu menyuplai pengiriman balasan pertanda sinyal instruksinya ditangkap sistem secara sukses dan formal.
        Response::json([
            "status" => true,
            "message" => "Logout berhasil"
        ]);
    }
}
