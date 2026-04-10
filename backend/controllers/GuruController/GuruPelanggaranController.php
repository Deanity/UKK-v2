<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../utils/Response.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../../utils/PoinHelper.php";
// require_once __DIR__ . "/../../utils/Mailer.php";

class GuruPelanggaranController {

    /**
     * Memanggil daftar riwayat pelanggaran dengan penyesuaian hak akses role pengaksesnya.
     * Endpoint: GET /api/guru/pelanggaran
     */
    public static function index() {
        // Meloloskan pengguna apabila mereka divalidasi ke kelompok guru, staf bk, admin, atau siswa itu sendiri
        $payload = AuthMiddleware::auth(['bk', 'guru', 'siswa', 'admin']);

        global $pdo;

        // Mengondisikan pencarian sesuai status identifikasi dari Token
        if ($payload['role'] === 'siswa') {
            // Jika role pengakses adalah siswa, maka query diseleksi batasannya hanya pada p.id_siswa
            // milik user tersebut saja. (Siswa dilarang membaca data pelanggaran anak lain).
            $stmt = $pdo->prepare("
                SELECT 
                    p.id,
                    s.nama AS nama_siswa,
                    s.nis,
                    jp.nama_pelanggaran,
                    p.poin,
                    p.keterangan,
                    p.created_at
                FROM pelanggaran p
                JOIN siswa s ON s.id = p.id_siswa
                JOIN jenis_pelanggaran jp ON jp.id = p.id_jenis_pelanggaran
                WHERE p.deleted_at IS NULL AND p.id_siswa = ?
                ORDER BY p.created_at DESC
            ");
            $stmt->execute([$payload['id']]);
        } else {
            // Jika role pengakses berada di panggung manajemen (contohnya guru atau staf bk),
            // server membebaskan query untuk memanggil rekaman tanpa terkunci oleh satu entitas siswa.
            $stmt = $pdo->query("
                SELECT 
                    p.id,
                    s.nama AS nama_siswa,
                    s.nis,
                    jp.nama_pelanggaran,
                    p.poin,
                    p.keterangan,
                    p.created_at
                FROM pelanggaran p
                JOIN siswa s ON s.id = p.id_siswa
                JOIN jenis_pelanggaran jp ON jp.id = p.id_jenis_pelanggaran
                WHERE p.deleted_at IS NULL
                ORDER BY p.created_at DESC
            ");
        }

        // Tampilkan keluaran rekap data kepada peramban
        Response::json([
            "status" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    /**
     * Memanggil profil spesifik dari sebuah kejadian pelanggaran (informasi detail berdasar ID pencatatan).
     * Endpoint: GET /api/guru/pelanggaran/{id}
     *
     * @param mixed $id Primary key di tabel pelanggaran
     */
    public static function show($id) {
        // Karena ini informasi terperinci, kita mengunci level keamanan hanya bagi pengawas
        AuthMiddleware::auth(['bk', 'guru', 'admin']);
        global $pdo;

        // Menyusun query dengan pola relasional gabungan terhadap profil asli siswanya (s) dan tipenya (jp)
        $stmt = $pdo->prepare("
            SELECT 
                p.*,
                s.nama AS nama_siswa,
                jp.nama_pelanggaran
            FROM pelanggaran p
            JOIN siswa s ON s.id = p.id_siswa
            JOIN jenis_pelanggaran jp ON jp.id = p.id_jenis_pelanggaran
            WHERE p.id = ? AND p.deleted_at IS NULL
        ");
        $stmt->execute([$id]);

        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        // Pertahanan standar jika identitas rekod terkait hilang atau dilarikan melalui mekanisme soft-delete 
        if (!$data) {
            Response::json([
                "status" => false,
                "message" => "Data pelanggaran tidak ditemukan"
            ], 404);
        }

        // Melontarkan data sukses terekstrak
        Response::json([
            "status" => true,
            "data" => $data
        ]);
    }

    /**
     * Metode POST penciptaan dan pembukuan pelanggaran riil yang terjadi pada siswa.
     * Fitur ini tidak sekadar menambahkan insert biasa, melainkan menyertakan intervensi penghitungan total bobot poin.
     * Endpoint: POST /api/guru/pelanggaran
     */
    public static function store() {
        // Verifikator perizinan administrasi pengamanan
        AuthMiddleware::auth(['guru', 'bk', 'admin']);

        // Mengadopsi muatan mentah JSON kiriman sisi aplikasi klien
        $input = json_decode(file_get_contents("php://input"), true);

        // Skrining elemen dasar agar wajib memuat identifikasi siswa, tipe bobot masalah, plus rincian/keterangannya
        $required = ['id_siswa', 'id_jenis_pelanggaran', 'keterangan'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::json([
                    'status' => false,
                    'message' => "Field $field wajib diisi"
                ], 422);
            }
        }

        global $pdo;

        // Mencari profil target siswa tersebut demi memastikan statusnya berada pada area yang benar (aktif)
        $stmt = $pdo->prepare("
            SELECT id, nama, email, poin, total_poin
            FROM siswa
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$input['id_siswa']]);
        $siswa = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$siswa) {
            Response::json([
                'status' => false,
                'message' => 'Siswa tidak ditemukan atau sudah dihapus'
            ], 404);
        }

        // Memanggil profil jenis sanksinya dan mengekstrak rasio poin dasar untuk dikalkulasikan
        $jp = $pdo->prepare("
            SELECT nama_pelanggaran, sanksi_poin
            FROM jenis_pelanggaran
            WHERE id = ? AND deleted_at IS NULL
        ");
        $jp->execute([$input['id_jenis_pelanggaran']]);
        $jenis = $jp->fetch(PDO::FETCH_ASSOC);

        if (!$jenis) {
            Response::json([
                'status' => false,
                'message' => 'Jenis pelanggaran tidak ditemukan'
            ], 404);
        }

        // Pelaksanaan Insert / Log pencatatan secara riil atas kasus perselisihan
        $pdo->prepare("
            INSERT INTO pelanggaran
            (id_siswa, id_jenis_pelanggaran, poin, keterangan, created_at)
            VALUES (?,?,?,?,NOW())
        ")->execute([
            $input['id_siswa'],
            $input['id_jenis_pelanggaran'],
            $jenis['sanksi_poin'],
            $input['keterangan']
        ]);

        // Algoritma akumulasi poin; Menghitung laju poin aktif sekarang dan histori total
        $poinBaru = $siswa['poin'] + $jenis['sanksi_poin'];
        $totalPoinBaru = $siswa['total_poin'] + $jenis['sanksi_poin'];

        // Kebijakan limitasi batas SP (Surat Peringatan) di mana akan ada resetting peredaran setelah melewati batas poin maksimal per putaran 30
        if ($poinBaru >= 30) {
            $poinBaru = 0; // Mereset siklus perhitungan jika mencapai limit batas tembus teguran.
        }

        // Mengeksekusi reaktualisasi (Update) langsung parameter sisa sanksi terhadap target siswa bersangkutan
        $pdo->prepare("
            UPDATE siswa SET
                poin = ?,
                total_poin = ?,
                updated_at = NOW()
            WHERE id = ?
        ")->execute([
            $poinBaru,
            $totalPoinBaru,
            $siswa['id']
        ]);

        // Persetujuan akhir sukses dievaluasi dan dicatat
        Response::json([
            'status' => true,
            'message' => 'Pelanggaran berhasil dicatat'
        ], 201);
    }

    /**
     * Mekanisme modifikasi / ralat ulang pada tabel pelanggaran lampau berskala ID khusus.
     * Mengkalkulasi penyegaran bobot siswa di akhir proses pengubahan profil catatan.
     * Endpoint: PUT /api/guru/pelanggaran/{id}
     *
     * @param mixed $id Primary key untuk pencarian ID entri tabel log
     */
    public static function update($id) {
        // Meloloskan level hierarki pengurus data
        AuthMiddleware::auth(['bk', 'guru', 'admin']);

        $input = json_decode(file_get_contents("php://input"), true);

        global $pdo;

        // Mengekstrak pengidentifikasi anak yang terhubung untuk penyegaran nilai agregat (refresh poin helper)
        $cek = $pdo->prepare("SELECT id_siswa FROM pelanggaran WHERE id = ?");
        $cek->execute([$id]);
        $data = $cek->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            Response::json([
                "status" => false,
                "message" => "Data tidak ditemukan"
            ], 404);
        }

        // Melabuhkan instruksi sinkronisasi data baru seputar modifikasi identifikasi kasus atau penjelasan
        $stmt = $pdo->prepare("
            UPDATE pelanggaran SET
                id_jenis_pelanggaran = ?,
                keterangan = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $input['id_jenis_pelanggaran'],
            $input['keterangan'],
            $id
        ]);

        // Melakukan rekalkulasi utilitas bobot melalui asisten global PoinHelper, untuk merevisi tumpukan poin si anak paska operasi edit selesai
        PoinHelper::refreshPoinSiswa($data['id_siswa']);

        Response::json([
            "status" => true,
            "message" => "Pelanggaran diperbarui"
        ]);
    }

    /**
     * Membatalkan catatan tindakan kesalahan milik anak (pengurangan jejak noda hukuman lewat Soft-Delete).
     * Endpoint: DELETE /api/guru/pelanggaran/{id}
     *
     * @param mixed $id Penanda primary di daftar perlakuan insiden pelanggaran
     */
    public static function destroy($id) {
        AuthMiddleware::auth(['bk', 'guru', 'admin']);

        global $pdo;

        // Identifikasi dini parameter referensi murid, diamankan untuk reaktualisasi histori poinnya setelah barisan datanya tersisih nanti
        $cek = $pdo->prepare("SELECT id_siswa FROM pelanggaran WHERE id = ?");
        $cek->execute([$id]);
        $data = $cek->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            Response::json([
                "status" => false,
                "message" => "Data tidak ditemukan"
            ], 404);
        }

        // Tembakan perintah Update konversi (meninggalkan mode rekayasa hard delete alias DELETE FROM) guna menjaga kelengkapan historikal baris
        $stmt = $pdo->prepare("
            UPDATE pelanggaran SET
                deleted_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$id]);

        // Memicu helper kelas eksternal sebagai penyegar kalkulasi poin agar kembali seimbang sedia kala usai pinaltinya dibatalkan secara teknis 
        PoinHelper::refreshPoinSiswa($data['id_siswa']);

        Response::json([
            "status" => true,
            "message" => "Pelanggaran dihapus"
        ]);
    }

}
