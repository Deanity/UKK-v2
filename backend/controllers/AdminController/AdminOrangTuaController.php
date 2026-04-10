<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../utils/Response.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";

class AdminOrangTuaController {

    /**
     * Mengambil daftar orang tua (ayah/ibu) yang terhubung dengan satu siswa spesifik.
     * Endpoint: GET /api/admin/siswa/{id}/orangtua
     *
     * @param mixed $id_siswa ID siswa yang orang tuanya ingin dicari
     */
    public static function indexBySiswa($id_siswa) {
        // Cek otorisasi untuk pengguna dengan level admin
        AuthMiddleware::auth(['admin']);

        global $pdo;

        // Mengeksekusi pencarian data orang_tua berdasarkan foreign key id_siswa
        // Mengabaikan data orang_tua yang statusnya soft-deleted
        $stmt = $pdo->prepare("
            SELECT id, nama, hubungan, telp, pekerjaan, tanggal_lahir, tempat_lahir, alamat
            FROM orang_tua
            WHERE id_siswa = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$id_siswa]);

        // Mengembalikan list data orang tua hasil query berbentuk JSON
        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    /**
     * Menambahkan data orang tua baru ke database melalui input form spesifik tunggal.
     * Endpoint: POST /api/admin/siswa/{id}/orangtua
     *
     * @param mixed $id_siswa ID siswa penerima data relasi baru
     */
    public static function store($id_siswa) {
        // Proteksi route khusus admin
        AuthMiddleware::auth(['admin']);

        // Mengkonversi payload request JSON menjadi associative array PHP
        $input = json_decode(file_get_contents("php://input"), true);

        // Validasi ketersediaan inputan wajib pada nama dan hubungan
        $required = ['nama', 'hubungan'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                // Menghasilkan balikan 422 jika input krusial diabaikan atau kosong
                Response::json([
                    "status" => false,
                    "message" => "Field $field wajib diisi"
                ], 422);
            }
        }

        // Memvalidasi hubungan agar hanya bisa diisi dengan nilai 'ayah' atau 'ibu'
        // Jika tidak sesuai kriteria aslinya, maka segera tolak requestnya
        if (!in_array($input['hubungan'], ['ayah', 'ibu'])) {
            Response::json([
                "status" => false,
                "message" => "Hubungan harus ayah atau ibu"
            ], 422);
        }

        global $pdo;

        // Mengecek database, apakah pada id_siswa terkait sudah terdaftar data dengan tipe hubungan ini
        // Contoh: mencegah ditambahkan profil 'ayah' jika sebelumnya sudah ada pendaftaran tipe 'ayah' untuk siswa ini
        $cek = $pdo->prepare("
            SELECT id FROM orang_tua
            WHERE id_siswa = ? AND hubungan = ? AND deleted_at IS NULL
        ");
        $cek->execute([$id_siswa, $input['hubungan']]);

        // Beri tahu klien bahwa double tuple atau relasi ganda (ayah double / ibu duplikat) ditolak
        if ($cek->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Data {$input['hubungan']} sudah ada"
            ], 409);
        }

        // Persiapan eksekusi query SQL menyimpan profil orang tua (create)
        $stmt = $pdo->prepare("
            INSERT INTO orang_tua
            (id_siswa, nama, hubungan, telp, pekerjaan, tanggal_lahir, tempat_lahir, alamat, created_at)
            VALUES (?,?,?,?,?,?,?,?,NOW())
        ");

        // Proses pelampiran parameter dan mengantisipasi opsional input lewat operator fallback (null checking)
        $stmt->execute([
            $id_siswa,
            $input['nama'],
            $input['hubungan'],
            $input['telp'] ?? null,
            $input['pekerjaan'] ?? null,
            $input['tanggal_lahir'] ?? null,
            $input['tempat_lahir'] ?? null,
            $input['alamat'] ?? null
        ]);

        // Memberikan respon status HTTP 201 menandakan objek model berhasil dibuat
        Response::json([
            "status" => true,
            "message" => "Orang tua berhasil ditambahkan"
        ], 201);
    }

    /**
     * Memperbarui komponen profil seorang orang tua dari record-nya yang sudah terdaftar.
     * Endpoint: PUT /api/admin/orangtua/{id}
     *
     * @param mixed $id Primary key ID tabel orang_tua
     */
    public static function update($id) {
        // Harus ada izin administrator
        AuthMiddleware::auth(['admin']);

        // Menerjemahkan body request (payload kiriman) front-end
        $input = json_decode(file_get_contents("php://input"), true);

        global $pdo;
        
        // Mempersiapkan struktur statement pembaruan data wali/orang tua 
        // Abaikan kolom kunci (Foreign Key ID anak, relasi status), berikan perpanjangan fokus pada identitas profil
        $stmt = $pdo->prepare("
            UPDATE orang_tua SET
                nama = ?,
                telp = ?,
                pekerjaan = ?,
                tanggal_lahir = ?,
                tempat_lahir = ?,
                alamat = ?,
                updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        ");

        // Parameter eksekusi di supply dari value input atau kembalikan ke nullish handling bila di tiadakan payloadnya
        $stmt->execute([
            $input['nama'],
            $input['telp'] ?? null,
            $input['pekerjaan'] ?? null,
            $input['tanggal_lahir'] ?? null,
            $input['tempat_lahir'] ?? null,
            $input['alamat'] ?? null,
            $id
        ]);

        // Konfirmasikan kepada si pengeksekusi jika operasional penyimpanan tuntas dan sempurna
        Response::json([
            "status" => true,
            "message" => "Data orang tua berhasil diperbarui"
        ]);
    }

    /**
     * Menghapus salah satu data orang tua lepas.
     * Aksi ini hanya akan menghapus object baris ini dan terisolir tidak mempengaruhi profil induk siswa-nya.
     * Endpoint: DELETE /api/admin/orangtua/{id}
     *
     * @param mixed $id Primary key ID yang disorot untuk penghapusan
     */
    public static function destroy($id) {
        // Cek kembali kualifikasi autentikasi middleware
        AuthMiddleware::auth(['admin']);

        global $pdo;

        // Implementasi Soft Delete yang umum dipakai agar metadata log terekam
        // Menggeser limit waktu pada atribut kolom (deleted_at) dengan setting time saat ini.
        $stmt = $pdo->prepare("
            UPDATE orang_tua SET deleted_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$id]);

        // Menyampaikan message balasan pasca penghapusan berhasil
        Response::json([
            "status" => true,
            "message" => "Data orang tua berhasil dihapus"
        ]);
    }
}
