<?php

class PoinHelper {

    /**
     * Memperbarui kalkulasi akumulasi poin pada seorang siswa secara utuh bergantung pada seluruh sejarah datanya yang masih sah.
     * Logika di class helper ini begitu vital untuk menambal nilai poin histori bilamana sewaktu-waktu
     * terdapat manipulasi dari guru, entah sebuah data pelanggaran yang diedit tipe bobot sanksinya
     * ataupun data kelalaian masa lalu yang diampuni (di-soft-delete/dihapus sistemnya).
     *
     * @param mixed $id_siswa Angka unik/ID dari siswa bersangkutan yang mau dibereskan sinkronisasi saldonya.
     */
    public static function refreshPoinSiswa($id_siswa) {
        global $pdo;

        // Mengeksekusi penarikan penjumlahan (SUM) dari seluruh besaran bobot pinalti milik si anak.
        // Konsepnya adalah melakukan relasi (JOIN) dari entri log kejadian si anak (tabel pelanggaran) ke buku aturan aslinya (jenis_pelanggaran)
        // Guna menginspeksi seberapa saklek poin yang perlu disumbangkan tiap baris insiden.
        // Fungsi pembawaan COALESCE diinstruksikan supaya apabila query ternyata kosong melompong (si anak suci tanpa masalah), nilai dibungkus ke angka bulat 0.
        $stmt = $pdo->prepare("
            SELECT COALESCE(SUM(jp.sanksi_poin), 0) as total
            FROM pelanggaran p
            JOIN jenis_pelanggaran jp ON jp.id = p.id_jenis_pelanggaran
            WHERE p.id_siswa = ?
            AND p.deleted_at IS NULL
        ");
        $stmt->execute([$id_siswa]);
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Meneruskan dan meniban parameter parameter total_poin di tabel asli siswa tersebut dengan hasil rekap akurat di atas tadi,
        // hal ini menjamin rasio yang ada tidak pernah patah perhitungan di waktu selanjutnya.
        $update = $pdo->prepare("
            UPDATE siswa SET
                total_poin = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $update->execute([$total, $id_siswa]);
    }
}
