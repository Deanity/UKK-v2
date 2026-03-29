<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../utils/Response.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";

class AdminOrangTuaController {

    // GET /api/admin/siswa/{id}/orangtua
    public static function indexBySiswa($id_siswa) {
        AuthMiddleware::auth(['admin']);

        global $pdo;
        $stmt = $pdo->prepare("
            SELECT id, nama, hubungan, telp, pekerjaan, alamat
            FROM orang_tua
            WHERE id_siswa = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$id_siswa]);

        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // POST /api/admin/siswa/{id}/orangtua
    public static function store($id_siswa) {
        AuthMiddleware::auth(['admin']);

        $input = json_decode(file_get_contents("php://input"), true);

        $required = ['nama', 'hubungan'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::json([
                    "status" => false,
                    "message" => "Field $field wajib diisi"
                ], 422);
            }
        }

        // validasi hubungan
        if (!in_array($input['hubungan'], ['ayah', 'ibu'])) {
            Response::json([
                "status" => false,
                "message" => "Hubungan harus ayah atau ibu"
            ], 422);
        }

        global $pdo;

        // Cegah duplikat ayah/ibu
        $cek = $pdo->prepare("
            SELECT id FROM orang_tua
            WHERE id_siswa = ? AND hubungan = ? AND deleted_at IS NULL
        ");
        $cek->execute([$id_siswa, $input['hubungan']]);

        if ($cek->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Data {$input['hubungan']} sudah ada"
            ], 409);
        }

        $stmt = $pdo->prepare("
            INSERT INTO orang_tua
            (id_siswa, nama, hubungan, telp, pekerjaan, alamat, created_at)
            VALUES (?,?,?,?,?,?,NOW())
        ");

        $stmt->execute([
            $id_siswa,
            $input['nama'],
            $input['hubungan'],
            $input['telp'] ?? null,
            $input['pekerjaan'] ?? null,
            $input['alamat'] ?? null
        ]);

        Response::json([
            "status" => true,
            "message" => "Orang tua berhasil ditambahkan"
        ], 201);
    }

    // PUT /api/admin/orangtua/{id}
    public static function update($id) {
        AuthMiddleware::auth(['admin']);

        $input = json_decode(file_get_contents("php://input"), true);

        global $pdo;
        $stmt = $pdo->prepare("
            UPDATE orang_tua SET
                nama = ?,
                telp = ?,
                pekerjaan = ?,
                alamat = ?,
                updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        ");

        $stmt->execute([
            $input['nama'],
            $input['telp'],
            $input['pekerjaan'],
            $input['alamat'],
            $id
        ]);

        Response::json([
            "status" => true,
            "message" => "Data orang tua berhasil diperbarui"
        ]);
    }

    // DELETE /api/admin/orangtua/{id}
    public static function destroy($id) {
        AuthMiddleware::auth(['admin']);

        global $pdo;
        $stmt = $pdo->prepare("
            UPDATE orang_tua SET deleted_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$id]);

        Response::json([
            "status" => true,
            "message" => "Data orang tua berhasil dihapus"
        ]);
    }
}
