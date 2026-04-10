<?php

class Cors {

    /**
     * Mengatur regulasi keamanan Cross-Origin Resource Sharing (CORS).
     * Diperlukan saat frontend (misal React/Vue) berjalan di sebuah port yang berbeda dari server backend.
     * Middleware ini memastikan backend untuk selalu meloloskan akses data dari URL frontend tersebut agar tidak diblokir browser.
     */
    public static function handle() {
        // Menentukan alamat (origin) frontend mana saja yang sah mengakses API.
        // Pada PHP, header dengan key yang sama akan menyeleweng pada satu penetapan terakhir jika tidak dijadikan multiple value.
        header("Access-Control-Allow-Origin: http://localhost:8080");
        header("Access-Control-Allow-Origin: http://localhost:5173");
        
        // Memberikan kontrol atas metadata spesifik dari header apa saja yang bisa dititipkan klien kepada server.
        // Diperlukan agar klien bisa menempelkan header 'Content-Type' parameter JSON, atau token 'Authorization'.
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        
        // Menentukan secara eksplisit tipe operasi method HTTP yang direstui oleh server.
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        
        // Memperkenankan klien menyertakan bukti identitas pada cross-origin request berupa kuki atau header autorisasi tertentu.
        header("Access-Control-Allow-Credentials: true");

        // Menangani metode pengecekan prasyarat keamanan awal (Preflight request) dari peramban.
        // Browser secara alami akan melemparkan ping request kosong berwujud 'OPTIONS' sebelum mengeksekusi request kompleks aslinya.
        if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
            // Merespons ok dan memvalidasi akses klien secepatnya
            http_response_code(200);
            
            // Segera mematikan dan keluar dari proses script lebih jauh, dikarenakan preflight request ini
            // memang tidak dimaksudkan agar PHP mencapai fungsi database controller di antrian selanjutnya.
            exit;
        }
    }
}
