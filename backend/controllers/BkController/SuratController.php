<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../../utils/Response.php";

class SuratController {

    // GET /api/bk/surat
    public static function index() {
        AuthMiddleware::auth(['admin', 'bk']);

        global $pdo;

        // Join dengan tabel siswa untuk mendapatkan nama dan NIS
        // Menggunakan LEFT JOIN agar jika siswa terhapus (soft delete), data history surat tetap menampilkan data yang masih ada jika diperlukan, atau inner join. Kita pakai INNER JOIN yang ignore deleted_at siswa dulu.
        $stmt = $pdo->query("
            SELECT s.id, s.jenis_surat, s.nomor_surat, s.tanggal_surat, 
                   s.keterangan, s.created_by, s.created_at,
                   si.nama as nama_siswa, si.nis as nis_siswa
            FROM surat s
            JOIN siswa si ON s.id_siswa = si.id
            WHERE s.deleted_at IS NULL
            ORDER BY s.created_at DESC
        ");

        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // GET /api/bk/surat/{id}
    public static function show($id) {
        AuthMiddleware::auth(['admin', 'bk']);

        global $pdo;

        $stmt = $pdo->prepare("
            SELECT s.id, s.jenis_surat, s.nomor_surat, s.tanggal_surat, 
                   s.keterangan, s.created_by, s.created_at, s.id_siswa,
                   si.nama as nama_siswa, si.nis as nis_siswa
            FROM surat s
            JOIN siswa si ON s.id_siswa = si.id
            WHERE s.id = ? AND s.deleted_at IS NULL
        ");
        $stmt->execute([$id]);
        $surat = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$surat) {
            Response::json([
                "status" => false,
                "message" => "Surat tidak ditemukan"
            ], 404);
        }

        Response::json([
            "status" => true,
            "data" => $surat
        ]);
    }

    // POST /api/bk/surat
    public static function store() {
        AuthMiddleware::auth(['admin', 'bk']);

        $input = json_decode(file_get_contents("php://input"), true);

        if (!isset($input['id_siswa'], $input['jenis_surat'], $input['nomor_surat'], $input['tanggal_surat'])) {
            Response::json([
                "status" => false,
                "message" => "Data tidak lengkap"
            ], 422);
        }

        global $pdo;

        // Ambil nama pembuat surat dari JWT (Assuming middleware decodes and puts it globally or we can just pass via request, but let's just use username from token context if available, otherwise frontend payload)
        // Kita menggunakan created_by dari payload frontend saja untuk saat ini
        $createdBy = $input['created_by'] ?? 'Sistem';

        $stmt = $pdo->prepare("
            INSERT INTO surat 
            (jenis_surat, nomor_surat, tanggal_surat, id_siswa, keterangan, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");

        $stmt->execute([
            $input['jenis_surat'],
            $input['nomor_surat'],
            $input['tanggal_surat'],
            $input['id_siswa'],
            $input['keterangan'] ?? null,
            $createdBy
        ]);

        $id = $pdo->lastInsertId();

        Response::json([
            "status" => true,
            "message" => "Riwayat Surat berhasil ditambahkan",
            "data" => [
                "id" => $id
            ]
        ], 201);
    }

    // PUT /api/bk/surat/{id}
    public static function update($id) {
        AuthMiddleware::auth(['admin', 'bk']);

        $input = json_decode(file_get_contents("php://input"), true);

        global $pdo;

        $cek = $pdo->prepare("SELECT id FROM surat WHERE id = ? AND deleted_at IS NULL");
        $cek->execute([$id]);

        if (!$cek->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Surat tidak ditemukan"
            ], 404);
        }

        $stmt = $pdo->prepare("
            UPDATE surat SET
                jenis_surat = ?,
                nomor_surat = ?,
                tanggal_surat = ?,
                id_siswa = ?,
                keterangan = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $input['jenis_surat'],
            $input['nomor_surat'],
            $input['tanggal_surat'],
            $input['id_siswa'],
            $input['keterangan'] ?? null,
            $id
        ]);

        Response::json([
            "status" => true,
            "message" => "Data Surat berhasil diperbarui"
        ]);
    }

    // DELETE /api/bk/surat/{id}
    public static function destroy($id) {
        AuthMiddleware::auth(['admin', 'bk']);

        global $pdo;

        // Cek dulu apakah ada laporan yang merujuk ke surat ini
        $cekLaporan = $pdo->prepare("SELECT id FROM laporan WHERE id_surat = ? AND deleted_at IS NULL");
        $cekLaporan->execute([$id]);
        if ($cekLaporan->fetch()) {
             Response::json([
                "status" => false,
                "message" => "Surat tidak bisa dihapus karena memiliki riwayat laporan tindak lanjut."
            ], 400);
        }

        $stmt = $pdo->prepare("UPDATE surat SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            Response::json([
                "status" => true,
                "message" => "Surat berhasil dihapus"
            ]);
        } else {
            Response::json([
                "status" => false,
                "message" => "Surat tidak ditemukan atau sudah dihapus"
            ], 404);
        }
    }
}
