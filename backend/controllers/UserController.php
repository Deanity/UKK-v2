<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../utils/Response.php";

class UserController {

    public static function me() {
        $payload = AuthMiddleware::auth();

        global $pdo;

        /* ========= GURU ========= */
        if ($payload['type'] === 'guru') {

            $stmt = $pdo->prepare("
                SELECT id, nama, username, email, role
                FROM guru
                WHERE id = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$payload['id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::json([
                    "status" => false,
                    "message" => "User tidak ditemukan"
                ], 404);
            }

            Response::json([
                "status" => true,
                "user" => $user
            ]);
        }

        /* ========= SISWA ========= */
        if ($payload['type'] === 'siswa') {
            $stmt = $pdo->prepare("
                SELECT 
                    s.*,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'nama', o.nama,
                            'hubungan', o.hubungan,
                            'telp', o.telp,
                            'pekerjaan', o.pekerjaan,
                            'alamat', o.alamat
                        )
                    ) AS orang_tua
                FROM siswa s
                LEFT JOIN orang_tua o ON o.id_siswa = s.id AND o.deleted_at IS NULL
                WHERE s.id = ?
                GROUP BY s.id
            ");
            $stmt->execute([$payload['id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            $user['orang_tua'] = json_decode($user['orang_tua'], true);

            Response::json([
                "status" => true,
                "user" => $user
            ]);
        }

        Response::json([
            "status" => false,
            "message" => "User tidak ditemukan"
        ], 404);
    }
}
