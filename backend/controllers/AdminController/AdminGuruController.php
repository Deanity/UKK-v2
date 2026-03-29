<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../utils/Response.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";

class AdminGuruController {

    // GET /api/admin/guru
    public static function index() {
        AuthMiddleware::auth(['admin']);
        global $pdo;

        $stmt = $pdo->query("
            SELECT id, nama, username, kode_guru, jenis_kelamin, email, role
            FROM guru
            WHERE deleted_at IS NULL
            ORDER BY nama ASC
        ");

        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // GET /api/admin/guru/{id}
    public static function show($id) {
        AuthMiddleware::auth(['admin']);
        global $pdo;

        $stmt = $pdo->prepare("
            SELECT *
            FROM guru
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$id]);

        $guru = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$guru) {
            Response::json([
                "status" => false,
                "message" => "Guru tidak ditemukan"
            ], 404);
        }

        Response::json([
            "status" => true,
            "data" => $guru
        ]);
    }

    // POST /api/admin/guru
    public static function store() {
        AuthMiddleware::auth(['admin']);
        global $pdo;

        $input = json_decode(file_get_contents("php://input"), true);

        $required = ['username','password','nama','kode_guru','jenis_kelamin','email','role'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::json([
                    "status" => false,
                    "message" => "Field $field wajib diisi"
                ], 422);
            }
        }

        // cek username unik
        $check = $pdo->prepare("SELECT id FROM guru WHERE username = ? AND deleted_at IS NULL");
        $check->execute([$input['username']]);
        $hashedPassword = password_hash($input['password'], PASSWORD_BCRYPT);

        if ($check->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Username sudah digunakan"
            ], 409);
        }

        $stmt = $pdo->prepare("
            INSERT INTO guru
            (username, password, nama, kode_guru, jenis_kelamin, email, role, created_at)
            VALUES (?,?,?,?,?,?,?,NOW())
        ");

        $stmt->execute([
            $input['username'],
            $hashedPassword, // nanti bisa di hash
            $input['nama'],
            $input['kode_guru'],
            $input['jenis_kelamin'],
            $input['email'],
            $input['role']
        ]);

        Response::json([
            "status" => true,
            "message" => "Guru berhasil ditambahkan"
        ], 201);
    }

    // PUT /api/admin/guru/{id}
    public static function update($id) {
        AuthMiddleware::auth(['admin']);
        global $pdo;

        $input = json_decode(file_get_contents("php://input"), true);

        $stmt = $pdo->prepare("
            UPDATE guru SET
                nama = ?,
                kode_guru = ?,
                jenis_kelamin = ?,
                email = ?,
                role = ?,
                updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        ");

        $stmt->execute([
            $input['nama'],
            $input['kode_guru'],
            $input['jenis_kelamin'],
            $input['email'],
            $input['role'],
            $id
        ]);

        Response::json([
            "status" => true,
            "message" => "Data guru berhasil diperbarui"
        ]);
    }

    // DELETE /api/admin/guru/{id}
    public static function destroy($id) {
        AuthMiddleware::auth(['admin']);
        global $pdo;

        $stmt = $pdo->prepare("
            UPDATE guru SET deleted_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$id]);

        Response::json([
            "status" => true,
            "message" => "Guru berhasil dihapus"
        ]);
    }
}
