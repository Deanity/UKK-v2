<?php

require_once __DIR__ . "/../utils/Token.php";
require_once __DIR__ . "/../utils/Response.php";

class AuthMiddleware {

    /**
     * Memeriksa otorisasi pengguna berdasarkan token bearer yang dikirimkan melalui header.
     * Fungsi ini bertugas mencegah akses ilegal dengan memvalidasi token dan mengecek tingkatan role.
     *
     * @param array $roles Daftar array berisi nama-nama role yang diperbolehkan mengakses endpoint.
     * @return array Mengembalikan payload data profil user terkait jika token terverifikasi valid dan otoritas cocok.
     */
    public static function auth(array $roles = []) {
        // Mengambil semua header HTTP dari client request yang memanggil endpoint
        $headers = getallheaders();
        
        // Memeriksa ada tidaknya header khusus 'Authorization'. Jika tiada, berikan default string kosong
        $auth = $headers['Authorization'] ?? '';

        // Memastikan pemanggilan header Authorization eksis dan mengikuti ketentuan penamaan wajib yakni diawali 'Bearer '
        if (!$auth || !str_starts_with($auth, 'Bearer ')) {
            // Apabila absen atau strukturnya mengawur, tolak sesi dan kembalikan penolakan 401 HTTP Unauthorized
            Response::json(["status"=>false,"message"=>"Token tidak ditemukan"], 401);
        }

        // Membuang string identitas tipenya ('Bearer ') supaya bersih, menyisakan string murni token (biasanya base64)
        $token = str_replace('Bearer ', '', $auth);
        
        // Meneruskan token tersebut ke helper / utility 'Token' guna pembuktian signature atau mendecode payload
        $payload = Token::verify($token);

        // Periksa apakah payload menghasilkan output palsu/false yang artinya token sudah dimanipulasi atau daluwarsa
        if (!$payload) {
            // Batalkan perjalanan request apabila validasi Token utility mentah
            Response::json(["status"=>false,"message"=>"Token tidak valid"], 401);
        }

        // Pengecekan gerbang perizinan / autorisasi role (Peran)
        // Apabila di parameter fungsi auth($roles) disuplai jenis peranan tertentu, namum peranan user di payload tersebut tidak masuk klasifikasi
        if ($roles && !in_array($payload['role'], $roles)) {
            // Hasilkan exception penolakan akses (Forbidden Status 403), artinya token sah tetapi jabatannya tidak sah untuk aksi ini
            Response::json(["status"=>false,"message"=>"Akses ditolak"], 403);
        }

        // Jika semua tahapan di atas berhasil dilewati tanpa ter-return Response::json penolakan
        // Mengembalikan rincian payload data user agar controller selanjutnnya tahu siapa yang sedang mengeksekusi ini
        return $payload;
    }
}
