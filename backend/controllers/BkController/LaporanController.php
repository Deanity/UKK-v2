<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../../utils/Response.php";

class LaporanController {

    // GET /api/bk/laporan
    public static function index() {
        AuthMiddleware::auth(['admin', 'bk']);

        global $pdo;

        // Join ke tabel surat dan siswa
        $stmt = $pdo->query("
            SELECT l.id, l.jenis_laporan, l.keterangan, l.created_at,
                   s.nomor_surat, s.jenis_surat, s.tanggal_surat,
                   si.nama as nama_siswa, si.id as id_siswa
            FROM laporan l
            JOIN surat s ON l.id_surat = s.id
            JOIN siswa si ON s.id_siswa = si.id
            WHERE l.deleted_at IS NULL AND s.deleted_at IS NULL AND si.deleted_at IS NULL
            ORDER BY l.created_at DESC
        ");

        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // GET /api/bk/laporan/{id}
    public static function show($id) {
        AuthMiddleware::auth(['admin', 'bk']);

        global $pdo;

        $stmt = $pdo->prepare("
             SELECT l.id, l.id_surat, l.jenis_laporan, l.keterangan, l.created_at,
                   s.nomor_surat, s.jenis_surat, s.tanggal_surat,
                   si.nama as nama_siswa, si.id as id_siswa
            FROM laporan l
            JOIN surat s ON l.id_surat = s.id
            JOIN siswa si ON s.id_siswa = si.id
            WHERE l.id = ? AND l.deleted_at IS NULL
        ");
        $stmt->execute([$id]);
        $laporan = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$laporan) {
            Response::json([
                "status" => false,
                "message" => "Laporan tidak ditemukan"
            ], 404);
        }

        Response::json([
            "status" => true,
            "data" => $laporan
        ]);
    }

    // POST /api/bk/laporan
    public static function store() {
        AuthMiddleware::auth(['admin', 'bk']);

        $input = json_decode(file_get_contents("php://input"), true);

        if (!isset($input['id_surat'], $input['jenis_laporan'], $input['keterangan'])) {
            Response::json([
                "status" => false,
                "message" => "Data tidak lengkap"
            ], 422);
        }

        global $pdo;

        // Pastikan surat yang dirujuk ada
        $cek = $pdo->prepare("SELECT id FROM surat WHERE id = ? AND deleted_at IS NULL");
        $cek->execute([$input['id_surat']]);
        if (!$cek->fetch()) {
             Response::json([
                "status" => false,
                "message" => "Surat rujukan tidak ditemukan"
            ], 404);
        }

        $stmt = $pdo->prepare("
            INSERT INTO laporan 
            (id_surat, jenis_laporan, keterangan, created_at)
            VALUES (?, ?, ?, NOW())
        ");

        $stmt->execute([
            $input['id_surat'],
            $input['jenis_laporan'],
            $input['keterangan']
        ]);

        $id = $pdo->lastInsertId();

        Response::json([
            "status" => true,
            "message" => "Laporan berhasil ditambahkan",
            "data" => [
                "id" => $id
            ]
        ], 201);
    }

    // PUT /api/bk/laporan/{id}
    public static function update($id) {
        AuthMiddleware::auth(['admin', 'bk']);

        $input = json_decode(file_get_contents("php://input"), true);

        global $pdo;

        $cek = $pdo->prepare("SELECT id FROM laporan WHERE id = ? AND deleted_at IS NULL");
        $cek->execute([$id]);

        if (!$cek->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Laporan tidak ditemukan"
            ], 404);
        }

        // Jika user mengupdate id_surat, pastikan surat itu ada
        if (isset($input['id_surat'])) {
             $cekSurat = $pdo->prepare("SELECT id FROM surat WHERE id = ? AND deleted_at IS NULL");
             $cekSurat->execute([$input['id_surat']]);
             if (!$cekSurat->fetch()) {
                  Response::json([
                     "status" => false,
                     "message" => "Surat rujukan tidak valid"
                 ], 404);
             }
        }

        // Ambil data lama jika field tidak dikirim
        $getOld = $pdo->prepare("SELECT * FROM laporan WHERE id = ?");
        $getOld->execute([$id]);
        $oldData = $getOld->fetch(PDO::FETCH_ASSOC);

        $id_surat = $input['id_surat'] ?? $oldData['id_surat'];
        $jenis_laporan = $input['jenis_laporan'] ?? $oldData['jenis_laporan'];
        $keterangan = $input['keterangan'] ?? $oldData['keterangan'];


        $stmt = $pdo->prepare("
            UPDATE laporan SET
                id_surat = ?,
                jenis_laporan = ?,
                keterangan = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $id_surat,
            $jenis_laporan,
            $keterangan,
            $id
        ]);

        Response::json([
            "status" => true,
            "message" => "Laporan berhasil diperbarui"
        ]);
    }

    // DELETE /api/bk/laporan/{id}
    public static function destroy($id) {
        AuthMiddleware::auth(['admin', 'bk']);

        global $pdo;

        $stmt = $pdo->prepare("UPDATE laporan SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            Response::json([
                "status" => true,
                "message" => "Laporan berhasil dihapus"
            ]);
        } else {
            Response::json([
                "status" => false,
                "message" => "Laporan tidak ditemukan atau sudah dihapus"
            ], 404);
        }
    }
}
