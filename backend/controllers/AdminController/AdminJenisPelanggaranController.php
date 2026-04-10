<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../utils/Response.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";

class AdminJenisPelanggaranController {

    /**
     * Mengambil daftar semua jenis pelanggaran yang tersedia.
     * Endpoint: GET /api/admin/jenis-pelanggaran
     */
    public static function index() {
        // Autentikasi untuk memeriksa akses admin, guru, atau petugas bk
        AuthMiddleware::auth(['admin', 'guru', 'bk']);
        global $pdo;

        // Mengeksekusi query mengambil koleksi jenis pelanggaran yang masih relevan (belum di-soft delete)
        $stmt = $pdo->query("
            SELECT id, kode_pelanggaran, nama_pelanggaran, sanksi_poin, deskripsi_sanksi
            FROM jenis_pelanggaran
            WHERE deleted_at IS NULL
            ORDER BY nama_pelanggaran ASC
        ");

        // Kirim response status true dan array datanya dalam bentuk JSON
        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    /**
     * Membaca informasi detail satu jenis pelanggaran berdasarkan ID parameternya.
     * Endpoint: GET /api/admin/jenis-pelanggaran/{id}
     *
     * @param mixed $id Primary key jenis_pelanggaran
     */
    public static function show($id) {
        // Khusus untuk endpoint ini dibatasi murni pada admin
        AuthMiddleware::auth(['admin']);
        global $pdo;

        // Menyiapkan pencarian objek pada tabel yang sesuai 
        $stmt = $pdo->prepare("
            SELECT *
            FROM jenis_pelanggaran
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$id]);

        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        // Apabila ID tidak terdeteksi, lemparkan error data not found (HTTP 404)
        if (!$data) {
            Response::json([
                "status" => false,
                "message" => "Jenis pelanggaran tidak ditemukan"
            ], 404);
        }

        // Jika berhasil ditemukan, kembalikan isinya
        Response::json([
            "status" => true,
            "data" => $data
        ]);
    }

    /**
     * Mendaftarkan jenis pelanggaran / aturan poin sanksi baru ke dalam sistem.
     * Endpoint: POST /api/admin/jenis-pelanggaran
     */
    public static function store() {
        // Cek otorisasi otentik ke level admin
        AuthMiddleware::auth(['admin']);
        global $pdo;

        // Membuka muatan payload raw input menjadi bentuk deretan array asosiatif
        $input = json_decode(file_get_contents("php://input"), true);

        // Pemastian kolom wajib terpenuhi keberadaannya
        $required = ['kode_pelanggaran', 'nama_pelanggaran', 'sanksi_poin'];
        foreach ($required as $f) {
            if (empty($input[$f])) {
                Response::json([
                    "status" => false,
                    "message" => "Field $f wajib diisi"
                ], 422);
            }
        }

        // Cek secara eksklusif agar atribut kode_pelanggaran tidak mengalami duplikasi tabrakan
        $check = $pdo->prepare("
            SELECT id FROM jenis_pelanggaran
            WHERE kode_pelanggaran = ? AND deleted_at IS NULL
        ");
        $check->execute([$input['kode_pelanggaran']]);

        // Lemparkan komplain sistem jika kode sudah diregistrasi sebelumnya (HTTP 409)
        if ($check->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Kode pelanggaran sudah digunakan"
            ], 409);
        }

        // Eksekusi insert model record baru sesuai porsi tabelnya
        $stmt = $pdo->prepare("
            INSERT INTO jenis_pelanggaran
            (kode_pelanggaran, nama_pelanggaran, sanksi_poin, deskripsi_sanksi, created_at)
            VALUES (?,?,?,?,NOW())
        ");

        $stmt->execute([
            $input['kode_pelanggaran'],
            $input['nama_pelanggaran'],
            $input['sanksi_poin'],
            // Jika payload deskripsi dikosongkan, beri nilai penutup standard NULL
            $input['deskripsi_sanksi'] ?? null
        ]);

        // Respons created 201 sukses
        Response::json([
            "status" => true,
            "message" => "Jenis pelanggaran berhasil ditambahkan"
        ], 201);
    }

    /**
     * Memperbarui detail atribut suatu jenis pelanggaran atau revisi poin sanksinya.
     * Endpoint: PUT /api/admin/jenis-pelanggaran/{id}
     *
     * @param mixed $id Indikator spesifik objek mana yang ter-revisi
     */
    public static function update($id) {
        // Harus lewat otorisasi role admin
        AuthMiddleware::auth(['admin']);
        global $pdo;

        $input = json_decode(file_get_contents("php://input"), true);

        // Skema perubahan yang dimuat, membatasi modifikasi pada kode_pelanggaran dan menyunting sisanya
        $stmt = $pdo->prepare("
            UPDATE jenis_pelanggaran SET
                nama_pelanggaran = ?,
                sanksi_poin = ?,
                deskripsi_sanksi = ?,
                updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        ");

        $stmt->execute([
            $input['nama_pelanggaran'],
            $input['sanksi_poin'],
            $input['deskripsi_sanksi'] ?? null,
            $id
        ]);

        Response::json([
            "status" => true,
            "message" => "Jenis pelanggaran berhasil diperbarui"
        ]);
    }

    /**
     * Mensimulasikan pemusnahan pencatatan jenis pelanggaran (soft delete pattern).
     * Endpoint: DELETE /api/admin/jenis-pelanggaran/{id}
     *
     * @param mixed $id Indikator ID tabel yang dieksekusi
     */
    public static function destroy($id) {
        // Limitasi spesifik hak akses hanya pada level administrator
        AuthMiddleware::auth(['admin']);
        global $pdo;

        // Implementasi soft deletion untuk menghindarkan error relasional pada riwayat pelanggaran sebelumnya
        $stmt = $pdo->prepare("
            UPDATE jenis_pelanggaran
            SET deleted_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$id]);

        Response::json([
            "status" => true,
            "message" => "Jenis pelanggaran berhasil dihapus"
        ]);
    }

}