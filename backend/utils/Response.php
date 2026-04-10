<?php

class Response {

    /**
     * Memformulasikan data dasar berbentuk array PHP secara seragam ke dalam format string JSON baku.
     * Fungsi utilitas sentral ini merupakan pintu gerbang keluar terakhir di backend untuk melayani klien.
     *
     * @param mixed $data Himpunan atau paket kumpulan data dalam bentuk array PHP (misal detail tabel maupun error singkat).
     * @param int $status Identitas kode numerik standar HTTP (cth: 200, 404, 500). Default tersetel optimal di 200 (OK).
     */
    public static function json($data, int $status = 200) {
        // Melaporkan keadaan validasi eksekusi web server melalui penempatan kode status bawaan
        http_response_code($status);
        
        // Membubuhi konfigurasi tipe output wajib di bagian Header
        // Tujuannya memberitahukan ke peramban depan atau platform pemanggil (seperti React) bahwa tipe muatan paket ini adalah murni sebuah kumpulan objek dan bukan skema html biasa
        header("Content-Type: application/json");
        
        // Mentranskripsi data array PHP asli menjadi gubahan string JSON, lalu dieksekusi mencetaknya ke body respon
        echo json_encode($data);
        
        // Mematikan sisa antrean perjalanan logika program dengan paksa di baris ini
        // Tindakan preventif ini sangat esensial guna menjamin struktur JSON terakhir barusan selalu tetap kaku dan tidak bisa tercemar spasi kosong atau error logic file php dari bawahnya.
        exit;
    }
}
