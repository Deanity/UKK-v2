<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../../utils/Response.php";

class AdminSiswaController {

    /**
     * Menampilkan daftar semua siswa yang aktif.
     * Endpoint: GET /api/admin/siswa
     */
    public static function index() {
        // Autentikasi untuk admin, guru, dan guru bk
        AuthMiddleware::auth(['admin', 'guru', 'bk']);

        global $pdo;

        // Mengeksekusi query untuk mengambil data siswa yang belum dihapus (deleted_at IS NULL)
        // Data diurutkan berdasarkan nama secara ascending (alfabetis A-Z)
        $stmt = $pdo->query("
            SELECT id, nama, username, nis, kelas, jurusan, jenis_kelamin, email, poin, total_poin
            FROM siswa
            WHERE deleted_at IS NULL
            ORDER BY nama ASC
        ");

        // Mengirimkan respons berupa JSON dengan status sukses dan data array dari siswa
        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    /**
     * Menampilkan detail dari seorang siswa berdasarkan ID, beserta data orang tuanya.
     * Endpoint: GET /api/admin/siswa/{id}
     *
     * @param mixed $id ID siswa
     */
    public static function show($id) {
        // Cek autentikasi khusus tipe pengguna admin
        AuthMiddleware::auth(['admin']);

        global $pdo;

        // Mengambil profil data siswa berdasarkan parameter ID yang belum dihapus
        $stmt = $pdo->prepare("
            SELECT id, username, nama, nis, kelas, jurusan,
                jenis_kelamin, alamat, no_telp, email,
                poin, total_poin
            FROM siswa
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$id]);
        $siswa = $stmt->fetch(PDO::FETCH_ASSOC);

        // Jika siswa tidak ada, kembalikan response error 404
        if (!$siswa) {
            Response::json([
                "status" => false,
                "message" => "Siswa tidak ditemukan"
            ], 404);
        }

        // Mengambil data lengkap orang tua (seperti ayah, ibu) yang berelasi dengan id siswa ini
        $ortuStmt = $pdo->prepare("
            SELECT id, nama, hubungan, telp, pekerjaan, tempat_lahir, tanggal_lahir, alamat
            FROM orang_tua
            WHERE id_siswa = ? AND deleted_at IS NULL
            ORDER BY hubungan ASC
        ");
        $ortuStmt->execute([$id]);
        $orangTua = $ortuStmt->fetchAll(PDO::FETCH_ASSOC);

        // Menggabungkan data orang tua sebagai property array ('orang_tua') di data siswa
        $siswa['orang_tua'] = $orangTua;

        // Mengembalikan response detail siswa
        Response::json([
            "status" => true,
            "data" => $siswa
        ]);
    }

    /**
     * Menambahkan data siswa baru ke database sekaligus dengan data orang tuanya.
     * Endpoint: POST /api/admin/siswa
     */
    public static function storeWithParents() {
        // Autentikasi untuk otorisasi akses admin saja
        AuthMiddleware::auth(['admin']);

        // Menerima input dari pengguna (payload di body) sebagai array JSON
        $input = json_decode(file_get_contents("php://input"), true);

        // Memastikan payload mengandung data utama 'siswa' dan object array 'orang_tua'
        if (!isset($input['siswa'], $input['orang_tua'])) {
            Response::json([
                "status" => false,
                "message" => "Payload tidak lengkap"
            ], 422);
        }

        global $pdo;

        try {
            // Memulai block database transaction untuk menjaga keutuhan 2 tabel saat dieksekusi
            $pdo->beginTransaction();

            $s = $input['siswa'];

            // Query insert data utama ke tabel siswa
            $stmt = $pdo->prepare("
                INSERT INTO siswa 
                (username, password, nama, nis, kelas, jurusan, jenis_kelamin, alamat, no_telp, email, poin, total_poin, created_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,0,0,NOW())
            ");

            // Mengeksekusi query dan melakukan hashing pada password agar tidak terlihat telanjang (raw)
            $stmt->execute([
                $s['username'],
                password_hash($s['password'], PASSWORD_DEFAULT),
                $s['nama'],
                $s['nis'],
                $s['kelas'],
                $s['jurusan'],
                $s['jenis_kelamin'],
                $s['alamat'],
                $s['no_telp'],
                $s['email']
            ]);

            // Mendapatkan id siswa yang baru saja terbuat
            $idSiswa = $pdo->lastInsertId();

            // Menyiapkan query untuk melakukan insert iteratif orang tua sesuai jumlah object dalam array orang_tua
            $stmtParent = $pdo->prepare("
                INSERT INTO orang_tua
                (id_siswa, nama, hubungan, telp, pekerjaan, tempat_lahir, tanggal_lahir, alamat, created_at)
                VALUES (?,?,?,?,?,?,?,?,NOW())
            ");

            // Melakukan foreach/looping array untuk di insert menjadi anak relasi siswa
            foreach ($input['orang_tua'] as $ortu) {
                $stmtParent->execute([
                    $idSiswa,
                    $ortu['nama'],
                    $ortu['hubungan'], // menentukan ini ayah, ibu, atau wali
                    $ortu['telp'] ?? null,
                    $ortu['pekerjaan'] ?? null,
                    !empty($ortu['tempat_lahir']) ? $ortu['tempat_lahir'] : null,
                    !empty($ortu['tanggal_lahir']) ? $ortu['tanggal_lahir'] : null,
                    $ortu['alamat'] ?? null
                ]);
            }

            // Menerapkan komit transaksi secara final atau permanen jika seluruh perintah berhasil (tanpa error)
            $pdo->commit();

            // Mengembalikan status sukses 201 Created
            Response::json([
                "status" => true,
                "message" => "Siswa & orang tua berhasil ditambahkan"
            ], 201);

        } catch (Throwable $e) {
            // Membatalkan atau rollback keseluruhan manipulasi saat terjadi error pada salah satu record
            if ($pdo->inTransaction()) $pdo->rollBack();
            Response::json([
                "status" => false,
                "message" => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Memperbarui profil profil siswa dan juga melakukan perbaruan data orang tuanya.
     * Fitur update untuk orang tua menangani mode Update, Create baru, dan juga Soft Delete.
     * Endpoint: PUT /api/admin/siswa/{id}
     *
     * @param mixed $id ID Siwa yang mau diperbarui
     */
    public static function update($id) {
        // Cek otorisasi agar hanya administrator yang bisa masuk
        AuthMiddleware::auth(['admin']);

        // Menerima input body
        $input = json_decode(file_get_contents("php://input"), true);

        // Jika invalid JSON
        if (!$input) {
            Response::json([
                "status" => false,
                "message" => "Invalid JSON"
            ], 400);
        }

        global $pdo;

        // Mengecek apakah data siswa berdasarkan ID itu memang tersedia
        $cek = $pdo->prepare("SELECT id FROM siswa WHERE id = ? AND deleted_at IS NULL");
        $cek->execute([$id]);

        if (!$cek->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Siswa tidak ditemukan"
            ], 404);
        }

        // Melakukan update pada profil utama siswa
        $stmt = $pdo->prepare("
            UPDATE siswa SET
                username = ?,
                nama = ?,
                nis = ?,
                kelas = ?,
                jurusan = ?,
                jenis_kelamin = ?,
                alamat = ?,
                no_telp = ?,
                email = ?,
                poin = ?,
                total_poin = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $input['username'],
            $input['nama'],
            $input['nis'],
            $input['kelas'],
            $input['jurusan'],
            $input['jenis_kelamin'],
            $input['alamat'],
            $input['no_telp'],
            $input['email'],
            $input['poin'],
            $input['total_poin'],
            $id
        ]);
                
        // Eksekusi proses Update, Insert, atau Delete yang kondisional pada tabel ORANG TUA
        if (isset($input['orang_tua']) && is_array($input['orang_tua'])) {
            // Buffer untuk menyimpan jenis hubungan (ayah / ibu) yang baru saja dikirim via request
            $hubunganSent = [];
            foreach ($input['orang_tua'] as $ot) {
                $hubunganSent[] = $ot['hubungan'];

                // Mencari apakah orang tua dengan status dan siswa ini sudah ada secara existing
                $cekOt = $pdo->prepare("
                    SELECT id FROM orang_tua
                    WHERE id_siswa = ? AND hubungan = ? AND deleted_at IS NULL
                ");
                $cekOt->execute([$id, $ot['hubungan']]);
                $exist = $cekOt->fetch(PDO::FETCH_ASSOC);

                if ($exist) {
                    // Update bila data orang tua eksisting sudah ada dengan ID nya
                    $updateOt = $pdo->prepare("
                        UPDATE orang_tua SET
                            nama = ?,
                            telp = ?,
                            pekerjaan = ?,
                            tempat_lahir = ?,
                            tanggal_lahir = ?,
                            alamat = ?,
                            updated_at = NOW()
                        WHERE id = ?
                    ");
                    $updateOt->execute([
                        $ot['nama'],
                        $ot['telp'],
                        $ot['pekerjaan'],
                        !empty($ot['tempat_lahir']) ? $ot['tempat_lahir'] : null,
                        !empty($ot['tanggal_lahir']) ? $ot['tanggal_lahir'] : null,
                        $ot['alamat'],
                        $exist['id']
                    ]);
                } else {
                    // Insert baru jika ID orang tua tersebut belum ada di profil anak tersebut
                    $insertOt = $pdo->prepare("
                        INSERT INTO orang_tua
                        (id_siswa, nama, hubungan, telp, pekerjaan, tempat_lahir, tanggal_lahir, alamat, created_at)
                        VALUES (?,?,?,?,?,?,?,?,NOW())
                    ");
                    $insertOt->execute([
                        $id,
                        $ot['nama'],
                        $ot['hubungan'],
                        $ot['telp'],
                        $ot['pekerjaan'],
                        !empty($ot['tempat_lahir']) ? $ot['tempat_lahir'] : null,
                        !empty($ot['tanggal_lahir']) ? $ot['tanggal_lahir'] : null,
                        $ot['alamat']
                    ]);
                }
            }

            // Hapus soft-delete baris orang tua pada tabel yang namanya dihapus dari frontend request form list
            if (empty($hubunganSent)) {
                // Menghapus seluruh kaitan orang tuanya
                $deleteEverything = $pdo->prepare("UPDATE orang_tua SET deleted_at = NOW() WHERE id_siswa = ? AND deleted_at IS NULL");
                $deleteEverything->execute([$id]);
            } else {
                // Menghapus data spesifik di luar 'hubungan' (ayah/ibu) yang dikirim
                $placeholders = implode(',', array_fill(0, count($hubunganSent), '?'));
                $deleteOthers = $pdo->prepare("
                    UPDATE orang_tua SET deleted_at = NOW() 
                    WHERE id_siswa = ? AND hubungan NOT IN ($placeholders) AND deleted_at IS NULL
                ");
                $deleteOthers->execute(array_merge([$id], $hubunganSent));
            }
        }

        // Kembalikan Response Sukses ke Klien
        Response::json([
            "status" => true,
            "message" => "Data siswa berhasil diperbarui"
        ]);
    }

    /**
     * Menghapus salah satu data siswa secara aman memakai Soft Delete.
     * Akan otomatis men-soft delete data orang tua yang terafiliasi dengan siswa ini.
     * Endpoint: DELETE /api/admin/siswa/{id}
     *
     * @param mixed $id ID siswa
     */
    public static function destroy($id) {
        // Cek hanya otorisasi admin
        AuthMiddleware::auth(['admin']);

        global $pdo;

        // Mengecek apakah data siswa itu memang masih ada / belum di soft delete sebelumnya
        $cek = $pdo->prepare("
            SELECT id FROM siswa
            WHERE id = ? AND deleted_at IS NULL
        ");
        $cek->execute([$id]);

        if (!$cek->fetch()) {
            Response::json([
                "status" => false,
                "message" => "Siswa tidak ditemukan"
            ], 404);
        }

        // Jalankan Database Transaction untuk menjaga relasional record
        $pdo->beginTransaction();

        try {
            // Melabeli data siswa dengan timestamp pada soft delete (deleted_at)
            $stmt = $pdo->prepare("
                UPDATE siswa
                SET deleted_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$id]);

            // Menjalankan hal yang sama dengan me-soft delete semua row orang tuanya yang terkait
            $stmtOt = $pdo->prepare("
                UPDATE orang_tua
                SET deleted_at = NOW()
                WHERE id_siswa = ?
            ");
            $stmtOt->execute([$id]);

            $pdo->commit();

            Response::json([
                "status" => true,
                "message" => "Siswa berhasil dihapus"
            ]);
        } catch (Exception $e) {
            // Error handling dengan pembatalan database transaction
            $pdo->rollBack();

            Response::json([
                "status" => false,
                "message" => "Gagal menghapus siswa"
            ], 500);
        }
    }

}
