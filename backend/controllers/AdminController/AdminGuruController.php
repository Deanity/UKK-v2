<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../utils/Response.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";

class AdminGuruController {

    /**
     * Mengambil daftar semua guru.
     * Endpoint: GET /api/admin/guru
     */
    public static function index() {
        // Memastikan bahwa hanya user dengan role 'admin' yang dapat mengakses endpoint ini
        AuthMiddleware::auth(['admin']);
        global $pdo;

        // Mengeksekusi query untuk mengambil data guru, kecuali yang sudah dihapus (deleted_at IS NULL)
        // Data diurutkan berdasarkan nama secara ascending (A-Z)
        $stmt = $pdo->query("
            SELECT id, nama, username, kode_guru, jenis_kelamin, email, role
            FROM guru
            WHERE deleted_at IS NULL
            ORDER BY nama ASC
        ");

        // Mengembalikan response JSON berisi status berhasil dan daftar data guru
        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    /**
     * Mengambil detail satu data guru berdasarkan ID.
     * Endpoint: GET /api/admin/guru/{id}
     *
     * @param int|string $id ID guru
     */
    public static function show($id) {
        // Cek otorisasi agar hanya admin yang bisa mengakses
        AuthMiddleware::auth(['admin']);
        global $pdo;

        // Menyiapkan query untuk mengambil data guru spesifik yang belum dihapus
        $stmt = $pdo->prepare("
            SELECT *
            FROM guru
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$id]);

        // Mengambil (fetch) hasil query dalam bentuk associative array
        $guru = $stmt->fetch(PDO::FETCH_ASSOC);

        // Jika data guru tidak ditemukan, kembalikan respons error 404 (Not Found)
        if (!$guru) {
            Response::json([
                "status" => false,
                "message" => "Guru tidak ditemukan"
            ], 404);
        }

        // Jika data ditemukan, kembalikan data tersebut
        Response::json([
            "status" => true,
            "data" => $guru
        ]);
    }

    /**
     * Menambah data guru baru ke dalam database.
     * Endpoint: POST /api/admin/guru
     */
    public static function store() {
        // Cek otorisasi agar hanya admin yang berhak membuat data guru baru
        AuthMiddleware::auth(['admin']);
        global $pdo;

        // Mengambil body request raw berbentuk JSON lalu mengubahnya menjadi array/associative PHP
        $input = json_decode(file_get_contents("php://input"), true);

        // Deklarasi kolom apa saja yang wajib diisi oleh pengguna pada payload request
        $required = ['username','password','nama','kode_guru','jenis_kelamin','email','role'];
        
        // Looping untuk memvalidasi apakah ada field wajib yang terlewat atau kosong
        foreach ($required as $field) {
            if (empty($input[$field])) {
                // Jika ada yang kosong, hentikan proses dan kembalikan error 422 (Unprocessable Entity)
                Response::json([
                    "status" => false,
                    "message" => "Field $field wajib diisi"
                ], 422);
            }
        }

        // Cek apakah username yang diinput sudah dipakai/ada di database untuk mencegah duplikasi
        $check = $pdo->prepare("SELECT id FROM guru WHERE username = ? AND deleted_at IS NULL");
        $check->execute([$input['username']]);
        
        // Melakukan proses hashing password menggunakan algoritma bcrypt demi keamanan (tidak disimpan raw)
        $hashedPassword = password_hash($input['password'], PASSWORD_BCRYPT);

        // Jika query menemukan hasil (username sudah ada), kembalikan respons error 409 (Conflict)
        if ($check->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Username sudah digunakan"
            ], 409);
        }

        // Menyiapkan query panjang untuk mendaftarkan data guru baru ke dalam tabel guru
        $stmt = $pdo->prepare("
            INSERT INTO guru
            (username, password, nama, kode_guru, jenis_kelamin, email, role, created_at)
            VALUES (?,?,?,?,?,?,?,NOW())
        ");

        // Mengeksekusi query dengan mengirimkan parameter-parameter aman untuk mencegah SQL injection
        $stmt->execute([
            $input['username'],
            $hashedPassword, // Menggunakan password yang sudah di-hash
            $input['nama'],
            $input['kode_guru'],
            $input['jenis_kelamin'],
            $input['email'],
            $input['role']
        ]);

        // Mengembalikan respons indikator kalau proses create sukses (HTTP 201 Created)
        Response::json([
            "status" => true,
            "message" => "Guru berhasil ditambahkan"
        ], 201);
    }

    /**
     * Memperbarui data guru yang sudah ada, termasuk username.
     * Endpoint: PUT /api/admin/guru/{id}
     *
     * @param int|string $id ID guru yang akan diedit
     */
    public static function update($id) {
        // Cek kembali otorisasi admin
        AuthMiddleware::auth(['admin']);
        global $pdo;

        // Decode data JSON dari body request
        $input = json_decode(file_get_contents("php://input"), true);

        // Validasi field wajib
        $required = ['username', 'nama', 'kode_guru', 'jenis_kelamin', 'email', 'role'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::json([
                    "status" => false,
                    "message" => "Field $field wajib diisi"
                ], 422);
            }
        }

        // Cek apakah username baru sudah dipakai guru lain (selain guru yang sedang diedit)
        $checkUsername = $pdo->prepare("
            SELECT id FROM guru
            WHERE username = ? AND id != ? AND deleted_at IS NULL
        ");
        $checkUsername->execute([$input['username'], $id]);
        if ($checkUsername->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Username sudah digunakan oleh guru lain"
            ], 409);
        }

        // Menyiapkan query update termasuk username
        $stmt = $pdo->prepare("
            UPDATE guru SET
                username = ?,
                nama = ?,
                kode_guru = ?,
                jenis_kelamin = ?,
                email = ?,
                role = ?,
                updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        ");

        // Eksekusi query
        $stmt->execute([
            $input['username'],
            $input['nama'],
            $input['kode_guru'],
            $input['jenis_kelamin'],
            $input['email'],
            $input['role'],
            $id
        ]);

        // Kembalikan respons sukses
        Response::json([
            "status" => true,
            "message" => "Data guru berhasil diperbarui"
        ]);
    }

    /**
     * Menghapus data guru (Implementasi Soft Delete).
     * Endpoint: DELETE /api/admin/guru/{id}
     *
     * @param int|string $id ID guru yang akan dihapus
     */
    public static function destroy($id) {
        // Memastikan yang eksekusi adalah admin
        AuthMiddleware::auth(['admin']);
        global $pdo;

        // Alih-alih menghapus data permanen menggunakan DELETE FROM, query ini melakukan UPDATE
        // Hanya mengisi kolom `deleted_at` dengan timestamps saat ini (Soft Delete).
        // Fungsi ini berguna agar tabel guru dipertahankan dan terhindar dari broken relation (Foreign Key Error).
        $stmt = $pdo->prepare("
            UPDATE guru SET deleted_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([$id]);

        // Mengirimkan konfirmasi bahwa data sukses dihapus
        Response::json([
            "status" => true,
            "message" => "Guru berhasil dihapus"
        ]);
    }
}
