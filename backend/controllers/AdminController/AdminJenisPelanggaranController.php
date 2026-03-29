<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../utils/Response.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";

class AdminJenisPelanggaranController {

    // GET /api/admin/jenis-pelanggaran
    public static function index() {
        AuthMiddleware::auth(['admin', 'guru', 'bk']);
        global $pdo;

        $stmt = $pdo->query("
            SELECT id, kode_pelanggaran, nama_pelanggaran, sanksi_poin, deskripsi_sanksi
            FROM jenis_pelanggaran
            WHERE deleted_at IS NULL
            ORDER BY nama_pelanggaran ASC
        ");

        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // Get /api/admin/jenis-pelanggaran/{id}
    public static function show($id) {
        AuthMiddleware::auth(['admin']);
        global $pdo;

        $stmt = $pdo->prepare("
            SELECT *
            FROM jenis_pelanggaran
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$id]);

        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            Response::json([
                "status" => false,
                "message" => "Jenis pelanggaran tidak ditemukan"
            ], 404);
        }

        Response::json([
            "status" => true,
            "data" => $data
        ]);
    }

    // POST /api/admin/jenis-pelanggaran
    public static function store() {
        AuthMiddleware::auth(['admin']);
        global $pdo;

        $input = json_decode(file_get_contents("php://input"), true);

        $required = ['kode_pelanggaran', 'nama_pelanggaran', 'sanksi_poin'];
        foreach ($required as $f) {
            if (empty($input[$f])) {
                Response::json([
                    "status" => false,
                    "message" => "Field $f wajib diisi"
                ], 422);
            }
        }

        // cek kode unik
        $check = $pdo->prepare("
            SELECT id FROM jenis_pelanggaran
            WHERE kode_pelanggaran = ? AND deleted_at IS NULL
        ");
        $check->execute([$input['kode_pelanggaran']]);

        if ($check->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Kode pelanggaran sudah digunakan"
            ], 409);
        }

        $stmt = $pdo->prepare("
            INSERT INTO jenis_pelanggaran
            (kode_pelanggaran, nama_pelanggaran, sanksi_poin, deskripsi_sanksi, created_at)
            VALUES (?,?,?,?,NOW())
        ");

        $stmt->execute([
            $input['kode_pelanggaran'],
            $input['nama_pelanggaran'],
            $input['sanksi_poin'],
            $input['deskripsi_sanksi'] ?? null
        ]);

        Response::json([
            "status" => true,
            "message" => "Jenis pelanggaran berhasil ditambahkan"
        ], 201);
    }

    // PUT /api/admin/jenis-pelanggaran/{id}
    public static function update($id) {
        AuthMiddleware::auth(['admin']);
        global $pdo;

        $input = json_decode(file_get_contents("php://input"), true);

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

    // DELETE /api/admin/jenis-pelanggaran/{id}
    public static function destroy($id) {
        AuthMiddleware::auth(['admin']);
        global $pdo;

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