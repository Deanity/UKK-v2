<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../utils/Response.php";
require_once __DIR__ . "/../middleware/AuthMiddleware.php";

class DashboardController {

    // GET /api/dashboard
    public static function index() {
        AuthMiddleware::auth(['admin', 'guru', 'bk']); // Adjust roles as necessary

        global $pdo;

        try {
            // Count total students (not soft deleted)
            $stmtSiswa = $pdo->query("SELECT COUNT(*) as total FROM siswa WHERE deleted_at IS NULL");
            $totalSiswa = $stmtSiswa->fetch(PDO::FETCH_ASSOC)['total'];

            // Count total violations (not soft deleted)
            $stmtPelanggaran = $pdo->query("SELECT COUNT(*) as total FROM pelanggaran WHERE deleted_at IS NULL");
            $totalPelanggaran = $stmtPelanggaran->fetch(PDO::FETCH_ASSOC)['total'];

            // Count total teachers (not soft deleted)
            $stmtGuru = $pdo->query("SELECT COUNT(*) as total FROM guru WHERE deleted_at IS NULL");
            $totalGuru = $stmtGuru->fetch(PDO::FETCH_ASSOC)['total'];

            Response::json([
                "status" => true,
                "data" => [
                    "total_siswa" => (int)$totalSiswa,
                    "total_pelanggaran" => (int)$totalPelanggaran,
                    "total_guru" => (int)$totalGuru
                ]
            ]);

        } catch (Exception $e) {
            Response::json([
                "status" => false,
                "message" => "Terjadi kesalahan saat mengambil statistik dashboard: " . $e->getMessage()
            ], 500);
        }
    }

    // GET /api/dashboard/pelanggaran-per-bulan
    public static function pelanggaranPerBulan() {
        AuthMiddleware::auth(['admin', 'guru', 'bk']);

        global $pdo;

        try {
            $stmt = $pdo->query("
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as bulan,
                    COUNT(*) as total
                FROM pelanggaran
                WHERE deleted_at IS NULL
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY bulan ASC
            ");
            
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json([
                "status" => true,
                "data" => $data
            ]);

        } catch (Exception $e) {
            Response::json([
                "status" => false,
                "message" => "Terjadi kesalahan saat mengambil data chart: " . $e->getMessage()
            ], 500);
        }
    }
}
