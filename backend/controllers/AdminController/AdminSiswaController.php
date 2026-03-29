<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../../utils/Response.php";

class AdminSiswaController {

    // GET /api/admin/siswa
    public static function index() {
        AuthMiddleware::auth(['admin', 'guru', 'bk']);

        global $pdo;
        $stmt = $pdo->query("
            SELECT id, nama, username, nis, kelas, jurusan, jenis_kelamin, email, poin, total_poin
            FROM siswa
            WHERE deleted_at IS NULL
            ORDER BY nama ASC
        ");

        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }


    // GET /api/admin/siswa/{id}
    public static function show($id) {
        AuthMiddleware::auth(['admin']);

        global $pdo;

        // ambil data siswa
        $stmt = $pdo->prepare("
            SELECT id, username, nama, nis, kelas, jurusan,
                jenis_kelamin, alamat, no_telp, email,
                poin, total_poin
            FROM siswa
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$id]);
        $siswa = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$siswa) {
            Response::json([
                "status" => false,
                "message" => "Siswa tidak ditemukan"
            ], 404);
        }

        // ambil data orang tua (ayah & ibu)
        $ortuStmt = $pdo->prepare("
            SELECT id, nama, hubungan, telp, pekerjaan, alamat
            FROM orang_tua
            WHERE id_siswa = ? AND deleted_at IS NULL
            ORDER BY hubungan ASC
        ");
        $ortuStmt->execute([$id]);
        $orangTua = $ortuStmt->fetchAll(PDO::FETCH_ASSOC);

        // gabungkan
        $siswa['orang_tua'] = $orangTua;

        Response::json([
            "status" => true,
            "data" => $siswa
        ]);
    }

    // POST /api/admin/siswa
    public static function storeWithParents() {
        AuthMiddleware::auth(['admin']);

        $input = json_decode(file_get_contents("php://input"), true);

        if (!isset($input['siswa'], $input['orang_tua'])) {
            Response::json([
                "status" => false,
                "message" => "Payload tidak lengkap"
            ], 422);
        }

        global $pdo;

        try {
            $pdo->beginTransaction();

            $s = $input['siswa'];

            $stmt = $pdo->prepare("
                INSERT INTO siswa 
                (username, password, nama, nis, kelas, jurusan, jenis_kelamin, alamat, no_telp, email, poin, total_poin, created_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,0,0,NOW())
            ");

            $stmt->execute([
                $s['username'],
                password_hash($s['password'], PASSWORD_DEFAULT),
                $s['nama'],
                $s['nis'],
                $s['kelas'],
                $s['jurusan'],
                $s['jenis_kelamin'],
                $s['alamat'],
                $s['no_telp'],
                $s['email']
            ]);

            $idSiswa = $pdo->lastInsertId();

            $stmtParent = $pdo->prepare("
                INSERT INTO orang_tua
                (id_siswa, nama, hubungan, telp, pekerjaan, alamat, created_at)
                VALUES (?,?,?,?,?,?,NOW())
            ");

            foreach ($input['orang_tua'] as $ortu) {
                $stmtParent->execute([
                    $idSiswa,
                    $ortu['nama'],
                    $ortu['hubungan'], // ayah / ibu
                    $ortu['telp'] ?? null,
                    $ortu['pekerjaan'] ?? null,
                    $ortu['alamat'] ?? null
                ]);
            }

            $pdo->commit();

            Response::json([
                "status" => true,
                "message" => "Siswa & orang tua berhasil ditambahkan"
            ], 201);

        } catch (Exception $e) {
            $pdo->rollBack();
            Response::json([
                "status" => false,
                "message" => $e->getMessage()
            ], 500);
        }
    }

    // PUT /api/admin/siswa/{id}
    public static function update($id) {
        AuthMiddleware::auth(['admin']);

        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input) {
            Response::json([
                "status" => false,
                "message" => "Invalid JSON"
            ], 400);
        }

        global $pdo;

        // 🔍 cek siswa
        $cek = $pdo->prepare("SELECT id FROM siswa WHERE id = ? AND deleted_at IS NULL");
        $cek->execute([$id]);

        if (!$cek->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Siswa tidak ditemukan"
            ], 404);
        }

        // 🔄 update siswa
        $stmt = $pdo->prepare("
            UPDATE siswa SET
                username = ?,
                nama = ?,
                nis = ?,
                kelas = ?,
                jurusan = ?,
                jenis_kelamin = ?,
                alamat = ?,
                no_telp = ?,
                email = ?,
                poin = ?,
                total_poin = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $input['username'],
            $input['nama'],
            $input['nis'],
            $input['kelas'],
            $input['jurusan'],
            $input['jenis_kelamin'],
            $input['alamat'],
            $input['no_telp'],
            $input['email'],
            $input['poin'],
            $input['total_poin'],
            $id
        ]);

        // 👨‍👩‍👧 UPDATE / INSERT ORANG TUA
        if (!empty($input['orang_tua']) && is_array($input['orang_tua'])) {
            foreach ($input['orang_tua'] as $ot) {

                $cekOt = $pdo->prepare("
                    SELECT id FROM orang_tua
                    WHERE id_siswa = ? AND hubungan = ? AND deleted_at IS NULL
                ");
                $cekOt->execute([$id, $ot['hubungan']]);
                $exist = $cekOt->fetch(PDO::FETCH_ASSOC);

                if ($exist) {
                    // UPDATE
                    $updateOt = $pdo->prepare("
                        UPDATE orang_tua SET
                            nama = ?,
                            telp = ?,
                            pekerjaan = ?,
                            alamat = ?,
                            updated_at = NOW()
                        WHERE id = ?
                    ");
                    $updateOt->execute([
                        $ot['nama'],
                        $ot['telp'],
                        $ot['pekerjaan'],
                        $ot['alamat'],
                        $exist['id']
                    ]);
                } else {
                    // INSERT
                    $insertOt = $pdo->prepare("
                        INSERT INTO orang_tua
                        (id_siswa, nama, hubungan, telp, pekerjaan, alamat, created_at)
                        VALUES (?,?,?,?,?,?,NOW())
                    ");
                    $insertOt->execute([
                        $id,
                        $ot['nama'],
                        $ot['hubungan'],
                        $ot['telp'],
                        $ot['pekerjaan'],
                        $ot['alamat']
                    ]);
                }
            }
        }

        Response::json([
            "status" => true,
            "message" => "Data siswa berhasil diperbarui"
        ]);
    }

    // DELETE /api/admin/siswa/{id}
    public static function destroy($id) {
        AuthMiddleware::auth(['admin']);

        global $pdo;

        // 🔍 cek siswa
        $cek = $pdo->prepare("
            SELECT id FROM siswa
            WHERE id = ? AND deleted_at IS NULL
        ");
        $cek->execute([$id]);

        if (!$cek->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Siswa tidak ditemukan"
            ], 404);
        }

        // 🧩 mulai transaksi (biar aman)
        $pdo->beginTransaction();

        try {
            // soft delete siswa
            $stmt = $pdo->prepare("
                UPDATE siswa
                SET deleted_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$id]);

            // soft delete orang tua terkait
            $stmtOt = $pdo->prepare("
                UPDATE orang_tua
                SET deleted_at = NOW()
                WHERE id_siswa = ?
            ");
            $stmtOt->execute([$id]);

            $pdo->commit();

            Response::json([
                "status" => true,
                "message" => "Siswa berhasil dihapus"
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();

            Response::json([
                "status" => false,
                "message" => "Gagal menghapus siswa"
            ], 500);
        }
    }

}
