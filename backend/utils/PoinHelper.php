<?php

class PoinHelper {

    public static function refreshPoinSiswa($id_siswa) {
        global $pdo;

        // total poin dari pelanggaran aktif
        $stmt = $pdo->prepare("
            SELECT COALESCE(SUM(jp.sanksi_poin), 0) as total
            FROM pelanggaran p
            JOIN jenis_pelanggaran jp ON jp.id = p.id_jenis_pelanggaran
            WHERE p.id_siswa = ?
            AND p.deleted_at IS NULL
        ");
        $stmt->execute([$id_siswa]);
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // update ke tabel siswa
        $update = $pdo->prepare("
            UPDATE siswa SET
                total_poin = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $update->execute([$total, $id_siswa]);
    }
}
