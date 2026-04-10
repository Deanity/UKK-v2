<?php

class Token {

    // String frasa kunci rahasia mutlak (secret key) yang sangat vital dalam algoritma hashing penyegelan struktur JWT 
    private static string $secret = "dedenotwits";

    /**
     * Menciptakan (generate) wujud susunan token otentikasi standar yang meniru perilaku asli dari arsitektur JWT.
     *
     * @param array $payload Serangkaian tumpukan data profil singkat milik entitas pengguna untuk disandikan ke dalam serangkaian token.
     * @return string Mengembalikan formasi token panjang berisi komponen lengkap: header, payload, dan signature.
     */
    public static function generate(array $payload): string {
        // Mewakili spesifikasi meta JWT yang dicetak ke dalam format string aman berbasis Base64.
        // Bagian Header selalu menegaskan label algoritma teknologinya (HS256) dan konfirmasi identitas dokumenisasinya (JWT).
        $header = base64_encode(json_encode([
            "alg" => "HS256",
            "typ" => "JWT"
        ]));

        // Menerjemahkan, dan mengemas lebur array payload user dalam wujud string Base64 yang ringkas tak bermasalah dengan karakter aneh
        $body = base64_encode(json_encode($payload));

        // Menyusun pilar penjagaan integritas rentetan token, yang dijuluki Signature (tanda tangan digital)
        // Menggunakan library hash_hmac untuk melumat dan memadupadankan gabungan parameter "header.body", seraya disulut proteksi pemangkasan bersama kata kunci secret yang tak bisa diterka umum.
        $signature = hash_hmac(
            "sha256",
            "$header.$body",
            self::$secret
        );

        // Konsekuensi akhir merajut dan menggabungkan ketiga parameter di atas (Header, Payload, dan Signature) 
        // Menggunakan separator atau pemisah titik konvensional penanda JWT
        return "$header.$body.$signature";
    }

    /**
     * Menyaring validasi keabsahan integritas pada token klaim dari pengunjung yang beredar melintasi jalur API.
     *
     * @param string $token Gumpalan string JWT utuh kiriman mentah rujukan pihak frontend.
     * @return array|false Jika bersih, meluncurkan salinan data identitas aslinya. Jika palsu, lemparkan rintangan penolakan primitif tipe Boolean (false).
     */
    public static function verify(string $token): array|false {
        // Membongkar kesatuan JWT melewai separator pembelah (titik tunggal) mejadikan susunan array list mentahan.
        $parts = explode(".", $token);

        // Secara default arsitektur JWT mewajibkan eksistensi hanya 3 lapisan (Header, Payload, dan lalu Signature).
        // Kalau ternyata panjang partisi berkurang atau membengkak melebihi standar, matikan validasi secara cepat.
        if (count($parts) !== 3) {
            return false;
        }

        // Mentransisikan array komponen sisa partisi sebelumnya menuju pembagian definisi nama parameter yang spesifik
        [$header, $body, $signature] = $parts;

        // Modus pembuktian simulasi perakitan tanda tangan ulang selaras rujukan cetakan fungsi generate().
        // Percobaan ini semata-mata mencampurkan dan meng-hash header dan sekumpulan payload temuan tersebut kepada sistem secret milik ranah server lokal.
        $validSignature = hash_hmac(
            "sha256",
            "$header.$body",
            self::$secret
        );

        // Pengecekan perbandingan hash rahasia dengan membandingkan cetakan klien dengan cetakan duplikat buatan server.
        // Kita mewajibkan operator hash_equals yang tahan banting ketimbang membandingkan relasi boolean mentah ($a === $b) untuk meredam timing attack.
        // Apabila tak sama, artinya data login tersebut dirakit secara paksa/diakali tanpa sepengetahuan kode secret token utama.
        if (!hash_equals($validSignature, $signature)) {
            return false;
        }

        // Pabila sistem eksekusi luput memanggil pengusiran error dari tahapan atas, barulah payload dibongkar secara gamblang dengan mendecode string basisnya
        // Output utuhnya langsung diterjemahkan menuju hierarki penutup tipe array PHP agar kompatibel disedot oleh middleware selanjutnya.
        return json_decode(base64_decode($body), true);
    }
}
