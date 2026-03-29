<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../utils/Response.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../../utils/PoinHelper.php";
// require_once __DIR__ . "/../../utils/Mailer.php";

class GuruPelanggaranController {

    // GET /api/guru/pelanggaran
    public static function index() {
        $payload = AuthMiddleware::auth(['bk', 'guru', 'siswa', 'admin']);

        global $pdo;

        // Jika role siswa: hanya tampilkan pelanggaran miliknya sendiri
        if ($payload['role'] === 'siswa') {
            $stmt = $pdo->prepare("
                SELECT 
                    p.id,
                    s.nama AS nama_siswa,
                    s.nis,
                    jp.nama_pelanggaran,
                    p.poin,
                    p.keterangan,
                    p.created_at
                FROM pelanggaran p
                JOIN siswa s ON s.id = p.id_siswa
                JOIN jenis_pelanggaran jp ON jp.id = p.id_jenis_pelanggaran
                WHERE p.deleted_at IS NULL AND p.id_siswa = ?
                ORDER BY p.created_at DESC
            ");
            $stmt->execute([$payload['id']]);
        } else {
            $stmt = $pdo->query("
                SELECT 
                    p.id,
                    s.nama AS nama_siswa,
                    s.nis,
                    jp.nama_pelanggaran,
                    p.poin,
                    p.keterangan,
                    p.created_at
                FROM pelanggaran p
                JOIN siswa s ON s.id = p.id_siswa
                JOIN jenis_pelanggaran jp ON jp.id = p.id_jenis_pelanggaran
                WHERE p.deleted_at IS NULL
                ORDER BY p.created_at DESC
            ");
        }

        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // GET /api/guru/pelanggaran/{id}
    public static function show($id) {
        AuthMiddleware::auth(['bk', 'guru', 'admin']);
        global $pdo;

        $stmt = $pdo->prepare("
            SELECT 
                p.*,
                s.nama AS nama_siswa,
                jp.nama_pelanggaran
            FROM pelanggaran p
            JOIN siswa s ON s.id = p.id_siswa
            JOIN jenis_pelanggaran jp ON jp.id = p.id_jenis_pelanggaran
            WHERE p.id = ? AND p.deleted_at IS NULL
        ");
        $stmt->execute([$id]);

        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            Response::json([
                "status" => false,
                "message" => "Data pelanggaran tidak ditemukan"
            ], 404);
        }

        Response::json([
            "status" => true,
            "data" => $data
        ]);
    }

    // POST /api/guru/pelanggaran
    public static function store() {
        AuthMiddleware::auth(['guru', 'bk', 'admin']);

        $input = json_decode(file_get_contents("php://input"), true);

        $required = ['id_siswa', 'id_jenis_pelanggaran', 'keterangan'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::json([
                    'status' => false,
                    'message' => "Field $field wajib diisi"
                ], 422);
            }
        }

        global $pdo;

        /** 🔎 Cek siswa masih ada & belum dihapus */
        $stmt = $pdo->prepare("
            SELECT id, nama, email, poin, total_poin
            FROM siswa
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$input['id_siswa']]);
        $siswa = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$siswa) {
            Response::json([
                'status' => false,
                'message' => 'Siswa tidak ditemukan atau sudah dihapus'
            ], 404);
        }

        /** 🔎 Ambil poin dari jenis pelanggaran */
        $jp = $pdo->prepare("
            SELECT nama_pelanggaran, sanksi_poin
            FROM jenis_pelanggaran
            WHERE id = ? AND deleted_at IS NULL
        ");
        $jp->execute([$input['id_jenis_pelanggaran']]);
        $jenis = $jp->fetch(PDO::FETCH_ASSOC);

        if (!$jenis) {
            Response::json([
                'status' => false,
                'message' => 'Jenis pelanggaran tidak ditemukan'
            ], 404);
        }

        /** 💾 Simpan pelanggaran */
        $pdo->prepare("
            INSERT INTO pelanggaran
            (id_siswa, id_jenis_pelanggaran, poin, keterangan, created_at)
            VALUES (?,?,?,?,NOW())
        ")->execute([
            $input['id_siswa'],
            $input['id_jenis_pelanggaran'],
            $jenis['sanksi_poin'],
            $input['keterangan']
        ]);

        $poinBaru = $siswa['poin'] + $jenis['sanksi_poin'];
        $totalPoinBaru = $siswa['total_poin'] + $jenis['sanksi_poin'];

        if ($poinBaru >= 30) {
            $poinBaru = 0; // reset poin aktif tiap mencapai 30
        }

        /** 🔄 Update siswa */
        $pdo->prepare("
            UPDATE siswa SET
                poin = ?,
                total_poin = ?,
                updated_at = NOW()
            WHERE id = ?
        ")->execute([
            $poinBaru,
            $totalPoinBaru,
            $siswa['id']
        ]);

        Response::json([
            'status' => true,
            'message' => 'Pelanggaran berhasil dicatat'
        ], 201);
    }

    // PUT /api/guru/pelanggaran/{id}
    public static function update($id) {
        AuthMiddleware::auth(['bk', 'guru', 'admin']);

        $input = json_decode(file_get_contents("php://input"), true);

        global $pdo;

        // ambil id siswa dulu
        $cek = $pdo->prepare("SELECT id_siswa FROM pelanggaran WHERE id = ?");
        $cek->execute([$id]);
        $data = $cek->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            Response::json([
                "status" => false,
                "message" => "Data tidak ditemukan"
            ], 404);
        }

        $stmt = $pdo->prepare("
            UPDATE pelanggaran SET
                id_jenis_pelanggaran = ?,
                keterangan = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $input['id_jenis_pelanggaran'],
            $input['keterangan'],
            $id
        ]);

        // 🔥 refresh poin
        PoinHelper::refreshPoinSiswa($data['id_siswa']);

        Response::json([
            "status" => true,
            "message" => "Pelanggaran diperbarui"
        ]);
    }

    // DELETE /api/guru/pelanggaran/{id}
    public static function destroy($id) {
        AuthMiddleware::auth(['bk', 'guru', 'admin']);

        global $pdo;

        // ambil id siswa
        $cek = $pdo->prepare("SELECT id_siswa FROM pelanggaran WHERE id = ?");
        $cek->execute([$id]);
        $data = $cek->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            Response::json([
                "status" => false,
                "message" => "Data tidak ditemukan"
            ], 404);
        }

        $stmt = $pdo->prepare("
            UPDATE pelanggaran SET
                deleted_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$id]);

        // 🔥 refresh poin
        PoinHelper::refreshPoinSiswa($data['id_siswa']);

        Response::json([
            "status" => true,
            "message" => "Pelanggaran dihapus"
        ]);
    }

}
