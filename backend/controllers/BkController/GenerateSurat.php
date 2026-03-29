<?php

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../utils/Response.php";
require_once __DIR__ . "/../../utils/PurePdf.php";
require_once __DIR__ . "/../../middleware/AuthMiddleware.php";

class GenerateSurat {

    // =========================================================
    // GET /api/bk/surat/panggilan/{siswa_id}
    // Surat Panggilan Orang Tua
    // =========================================================
    public static function suratPanggilan(int $siswaId): void {
        AuthMiddleware::auth(['bk', 'admin']);
        global $pdo;

        // --- Ambil data siswa ---
        $stmtSiswa = $pdo->prepare("
            SELECT id, nama, nis, kelas, jurusan, jenis_kelamin,
                   alamat, no_telp, email, poin, total_poin
            FROM siswa
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmtSiswa->execute([$siswaId]);
        $siswa = $stmtSiswa->fetch(PDO::FETCH_ASSOC);

        if (!$siswa) {
            Response::json(['status' => false, 'message' => 'Siswa tidak ditemukan'], 404);
        }

        // --- Ambil data orang tua (ambil yang pertama) ---
        $stmtOrtu = $pdo->prepare("
            SELECT nama, hubungan, telp, pekerjaan, alamat
            FROM orang_tua
            WHERE id_siswa = ?
            LIMIT 1
        ");
        $stmtOrtu->execute([$siswaId]);
        $ortu = $stmtOrtu->fetch(PDO::FETCH_ASSOC);

        // --- Ambil riwayat pelanggaran ---
        $stmtPel = $pdo->prepare("
            SELECT jp.nama_pelanggaran, p.poin, p.keterangan,
                   DATE_FORMAT(p.created_at, '%d/%m/%Y') AS tanggal
            FROM pelanggaran p
            JOIN jenis_pelanggaran jp ON jp.id = p.id_jenis_pelanggaran
            WHERE p.id_siswa = ? AND p.deleted_at IS NULL
            ORDER BY p.created_at DESC
        ");
        $stmtPel->execute([$siswaId]);
        $pelanggaran = $stmtPel->fetchAll(PDO::FETCH_ASSOC);

        // --- Generate PDF ---
        self::buildSuratPanggilan($siswa, $ortu, $pelanggaran);
    }

    // =========================================================
    // GET /api/bk/surat/pernyataan/{siswa_id}
    // Surat Pernyataan Siswa
    // =========================================================
    public static function suratPernyataan(int $siswaId): void {
        AuthMiddleware::auth(['bk', 'admin']);
        global $pdo;

        // --- Ambil data siswa ---
        $stmtSiswa = $pdo->prepare("
            SELECT id, nama, nis, kelas, jurusan, jenis_kelamin,
                   alamat, no_telp, email, poin, total_poin
            FROM siswa
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmtSiswa->execute([$siswaId]);
        $siswa = $stmtSiswa->fetch(PDO::FETCH_ASSOC);

        if (!$siswa) {
            Response::json(['status' => false, 'message' => 'Siswa tidak ditemukan'], 404);
        }

        // --- Ambil data orang tua ---
        $stmtOrtu = $pdo->prepare("
            SELECT nama, hubungan, telp, pekerjaan, alamat
            FROM orang_tua
            WHERE id_siswa = ?
            LIMIT 1
        ");
        $stmtOrtu->execute([$siswaId]);
        $ortu = $stmtOrtu->fetch(PDO::FETCH_ASSOC);

        // --- Generate PDF ---
        self::buildSuratPernyataan($siswa, $ortu);
    }

    // =========================================================
    // PRIVATE — Builder Surat Panggilan Orang Tua
    // =========================================================
    private static function buildSuratPanggilan(array $siswa, ?array $ortu, array $pelanggaran): void {
        $pdf = new PurePdf();
        $pdf->addPage();

        $tanggalHariIni = self::tanggalIndonesia(date('Y-m-d'));
        $namaOrtu       = $ortu['nama']      ?? '-';
        $marginX        = 56.69;

        // ---- KOP SURAT ----
        $imagePath = __DIR__ . '/../../public/kop_surat.jpg';
        $imgW = 481.9;    // Fit within margins
        $imgH = 80;       // Adjustable height based on aspect ratio
        
        // Coba baca dimensi dulu untuk cari rasio yang benar
        if (file_exists($imagePath)) {
            $info = @getimagesize($imagePath);
            if ($info) {
                $imgH = $imgW * $info[1] / $info[0];
            }
        }
        
        // Gambar akan digambar dengan titik awal (bottom-left)
        $imgBottomY = $pdf->getY() - $imgH;
        $pdf->image($imagePath, $marginX, $imgBottomY, $imgW, $imgH);
        
        // Pindahkan kursor ke bawah gambar
        $pdf->setY($imgBottomY - 15);

        // ---- NO, LAMP, PERIHAL ----
        $leftCol = $marginX;
        $rightCol = 350.0;
        
        $pdf->text('No.', $leftCol, PurePdf::FONT_REGULAR, 11);
        $pdf->text(': 020/SMKTI/B/I/2026', $leftCol + 45, PurePdf::FONT_REGULAR, 11);
        
        $pdf->ln(14);
        $pdf->text('Lamp.', $leftCol, PurePdf::FONT_REGULAR, 11);
        $pdf->text(': -', $leftCol + 45, PurePdf::FONT_REGULAR, 11);
        
        $pdf->ln(14);
        $pdf->text('Perihal', $leftCol, PurePdf::FONT_REGULAR, 11);
        $pdf->text(': Pemanggilan Orang Tua / Wali Siswa', $leftCol + 45, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(28);

        // ---- KEPADA BOx ----
        $pdf->text('Kepada', $leftCol, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
        $pdf->text('Yth. Bapak / Ibu Orang Tua / Wali Siswa dari :', $leftCol, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(16);
        self::printRow($pdf, 'Nama',  $siswa['nama'],  $marginX);
        self::printRow($pdf, 'NIS',   $siswa['nis'],   $marginX);
        self::printRow($pdf, 'Kelas', $siswa['kelas'] ?? '-', $marginX);
        $pdf->ln(14);
        // $pdf->text('Di -', $leftCol, PurePdf::FONT_REGULAR, 11);
        // $pdf->ln(14);
        // $pdf->text('      Tempat', $leftCol, PurePdf::FONT_REGULAR, 11);
        // $pdf->ln(24);

        // ---- PEMBUKA ----
        $pdf->text('Bersama surat ini, kami mengharapkan kehadiran Bapak / Ibu pada :', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(16);
        $pdf->text('Kedisiplinan serta Tata Tertib Sekolah.', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
        $pdf->text('Adapun Pelanggaran yang telah dilakukan adalah :', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(18);

        // ---- TABEL PELANGGARAN ----
        if (empty($pelanggaran)) {
            $pdf->text('(Tidak ada data pelanggaran)', $marginX, PurePdf::FONT_ITALIC, 11);
            $pdf->ln(18);
        } else {
            $headers   = ['No', 'Jenis Pelanggaran', 'Poin', 'Keterangan', 'Tanggal'];
            $colWidths = [25, 130, 40, 190, 80]; // total 465 pt
            $rows = [];
            foreach ($pelanggaran as $i => $p) {
                $rows[] = [
                    $i + 1,
                    $p['nama_pelanggaran'],
                    $p['poin'],
                    $p['keterangan'],
                    $p['tanggal'],
                ];
            }
            $pdf->table($headers, $rows, $colWidths);
            $pdf->ln(10);
        }

        // ---- DETAIL PANGGILAN ----
        $pdf->ln(16);
        $pdf->text('Sehubungan dengan hal tersebut, kami mengharap kehadiran Bapak/Ibu pada:', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(16);
        self::printRow($pdf, 'Tanggal', $tanggalHariIni, $marginX + 20); // TODO: dynamic later?
        self::printRow($pdf, 'Pukul',          '08.00 WITA',             $marginX + 20);
        self::printRow($pdf, 'Tempat',         'SMK TI Bali Global Denpasar', $marginX + 20);
        self::printRow($pdf, 'Keperluan',      'Masalah Disiplin Siswa', $marginX + 20);
        $pdf->ln(18);

        // ---- PENUTUP ----
        $pdf->text('Demikian surat ini kami sampaikan, besar harapan kami pertemuan ini agar tidak', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
        $pdf->text('diwakilkan. Atas perhatian dan kerjasamanya, kami ucapkan terimakasih.', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(35);

        // ---- TANDA TANGAN ----
        $leftCol  = $marginX;
        $rightCol = 330.0;
        
        $pdf->text('Mengetahui,', $leftCol, PurePdf::FONT_REGULAR, 11);
        $pdf->text('Denpasar, ' . $tanggalHariIni, $rightCol, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
        $pdf->text('Waka Kesiswaan', $leftCol, PurePdf::FONT_REGULAR, 11);
        $pdf->text('Guru BK', $rightCol, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(60);
        $pdf->text('Bagus Putu Eka Wijaya, S.Kom', $leftCol, PurePdf::FONT_BOLD, 11);
        $pdf->text('I Gusti Ayu Rinjani, M.Pd', $rightCol, PurePdf::FONT_BOLD, 11);

        $pdf->output('surat_panggilan_' . $siswa['nis'] . '.pdf');
    }

    // =========================================================
    // PRIVATE — Builder Surat Pernyataan Siswa
    // =========================================================
    private static function buildSuratPernyataan(array $siswa, ?array $ortu): void {
        $pdf = new PurePdf();
        $pdf->addPage();

        $tanggalHariIni = self::tanggalIndonesia(date('Y-m-d'));
        $namaOrtu       = $ortu['nama']      ?? '-';
        $noHp           = $ortu['telp']      ?? '-';
        $marginX        = 56.69;

        // ---- KOP SURAT ----
        $imagePath = __DIR__ . '/../../public/kop_surat.jpg';
        $imgW = 481.9;
        $imgH = 80;
        
        if (file_exists($imagePath)) {
            $info = @getimagesize($imagePath);
            if ($info) {
                $imgH = $imgW * $info[1] / $info[0];
            }
        }
        
        $imgBottomY = $pdf->getY() - $imgH;
        $pdf->image($imagePath, $marginX, $imgBottomY, $imgW, $imgH);
        
        $pdf->setY($imgBottomY - 15);

        // ---- JUDUL & HEADER SURAT ----
        $pdf->ln(10);
        $pdf->textCenter('SURAT PERMOHONAN BERHENTI', PurePdf::FONT_BOLD, 14);
        $pdf->ln(30);
        
        // ---- TANGGAL ----
        $rightCol = 415.0;
        $pdf->text('Denpasar, ' . $tanggalHariIni, $rightCol, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(24);

        // ---- KEPADA BOx ----
        $pdf->text('Kepada', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
        $pdf->text('Yth. Bapak Kepala Sekolah', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
        $pdf->text('SMK TI Bali Global Denpasar', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
        $pdf->text('Di Tempat', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(24);

        // ---- DATA ORANG TUA ----
        $pdf->text('Dengan Hormat, yang bertanda tangan dibawah ini :', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(16);
        self::printRow($pdf, 'Nama',   $namaOrtu,   $marginX);
        self::printRow($pdf, 'Alamat', $ortu['alamat'] ?? '-', $marginX);
        self::printRow($pdf, 'Telp',   $noHp,       $marginX);
        $pdf->ln(16);

        // ---- DATA SISWA ----
        $pdf->text('Dengan ini menerangkan bahwa :', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(16);
        self::printRow($pdf, 'Nama',  $siswa['nama'],  $marginX);
        self::printRow($pdf, 'Kelas', $siswa['kelas'] ?? '-', $marginX);
        $pdf->ln(16);

        // ---- ISI PERNYATAAN (PARAGRAF) ----
        $pdf->text('Menyatakan bahwa mengundurkan diri dari sekolah SMK TI Bali Global Denpasar', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
        
        $pdf->text('dikarenakan ....................................................., akan menyelesaikan administrasi sekolah.', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);

        $pdf->text('Demikian surat ini saya buat dengan sebenarnya tanpa ada paksaan apapun dan agar ', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
        $pdf->text('Bapak/Ibu maklum adanya.', $marginX, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(35);

        // ---- TANDA TANGAN ----
        $pdf->text('Hormat Kami,', $rightCol + 10, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(60);
        $pdf->text('(' . $namaOrtu . ')', $rightCol + 10, PurePdf::FONT_BOLD, 11);

        $pdf->output('surat_pernyataan_' . $siswa['nis'] . '.pdf');
    }

    // =========================================================
    // Helper: Cetak baris label: value
    // =========================================================
    private static function printRow(PurePdf $pdf, string $label, string $value, float $x): void {
        $labelW = 130; // lebar kolom label dalam pt
        $pdf->text($label, $x, PurePdf::FONT_REGULAR, 11);
        $pdf->text(': ' . $value, $x + $labelW, PurePdf::FONT_REGULAR, 11);
        $pdf->ln(14);
    }

    // =========================================================
    // Helper: Format tanggal ke bahasa Indonesia
    // =========================================================
    private static function tanggalIndonesia(string $date): string {
        $bulan = [
            1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        $ts = strtotime($date);
        return date('d', $ts) . ' ' . $bulan[(int)date('n', $ts)] . ' ' . date('Y', $ts);
    }
}
