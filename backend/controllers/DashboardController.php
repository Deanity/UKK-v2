<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../utils/Response.php";
require_once __DIR__ . "/../middleware/AuthMiddleware.php";

class DashboardController {

    /**
     * Memanggil ringkasan statistik dasar untuk ditampilkan pada halaman awal dashboard.
     * Endpoint: GET /api/dashboard
     */
    public static function index() {
        // Melakukan validasi hak akses untuk memastikan hanya peran terkait yang bisa melihat rekapitulasi data ini
        AuthMiddleware::auth(['admin', 'guru', 'bk']);

        global $pdo;

        try {
            // Hitung total seluruh siswa berstatus aktif (yang belum di-soft delete)
            $stmtSiswa = $pdo->query("SELECT COUNT(*) as total FROM siswa WHERE deleted_at IS NULL");
            $totalSiswa = $stmtSiswa->fetch(PDO::FETCH_ASSOC)['total'];

            // Hitung kumulatif total kasus pelanggaran tercatat sejauh ini yang masih relevan/valid
            $stmtPelanggaran = $pdo->query("SELECT COUNT(*) as total FROM pelanggaran WHERE deleted_at IS NULL");
            $totalPelanggaran = $stmtPelanggaran->fetch(PDO::FETCH_ASSOC)['total'];

            // Hitung jumlah pengajar atau guru berstatus aktif di dalam sistem
            $stmtGuru = $pdo->query("SELECT COUNT(*) as total FROM guru WHERE deleted_at IS NULL");
            $totalGuru = $stmtGuru->fetch(PDO::FETCH_ASSOC)['total'];

            // Satukan ketiga metrik hasil perhitungan di atas menjadi wadah objek/array tunggal
            Response::json([
                "status" => true,
                "data" => [
                    "total_siswa" => (int)$totalSiswa,
                    "total_pelanggaran" => (int)$totalPelanggaran,
                    "total_guru" => (int)$totalGuru
                ]
            ]);

        } catch (Exception $e) {
            // Penanganan bila terdeteksi kegagalan pada barisan query server di atas
            Response::json([
                "status" => false,
                "message" => "Terjadi kesalahan saat mengambil statistik dashboard: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil kompilasi grafik jumlah pelanggaran yang dikelompokkan berdasarkan setiap bulannya.
     * Biasanya diimplementasikan sebagai plot acuan untuk grafik naik/turun di dashboard UI.
     * Endpoint: GET /api/dashboard/pelanggaran-per-bulan
     */
    public static function pelanggaranPerBulan() {
        // Memastikan permohonan bersumber dari staf sekolah berotentikasi sah
        AuthMiddleware::auth(['admin', 'guru', 'bk']);

        global $pdo;

        try {
            // Mengambil fungsi bawaan pemformatan tanggal pada SQL untuk memisahkan Tahun dan Bulan saja (YYYY-MM),
            // kemudian mengelompokkannya (GROUP BY) untuk dihitung per kelompok periodenya, lalu menyortirnya menaik (bulan terlama ke terbaru)
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

            // Meneruskan format array data kumpulan periode bulanan beserta nilai totalnya ke klien front-end
            Response::json([
                "status" => true,
                "data" => $data
            ]);

        } catch (Exception $e) {
            // Beri tahu antarmuka apabila proses agregasi data charting bermasalah atau terputus
            Response::json([
                "status" => false,
                "message" => "Terjadi kesalahan saat mengambil data chart: " . $e->getMessage()
            ], 500);
        }
    }
}
