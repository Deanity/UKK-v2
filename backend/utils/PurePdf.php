<?php

/**
 * PurePdf — Generator PDF murni PHP tanpa library eksternal
 * Mendukung: teks, tabel sederhana, garis, format A4
 */
class PurePdf {

    private array $objects   = [];
    private array $pages     = [];
    private int   $objCount  = 0;
    private float $pageW     = 595.28;  // A4 portrait width  (pt)
    private float $pageH     = 841.89;  // A4 portrait height (pt)
    private float $margin    = 56.69;   // ~2 cm dalam pt
    private float $curY      = 0;
    private array $streams   = [];      // stream per halaman
    private int   $curPage   = 0;
    private array $images    = [];      // array of embedded images

    // Font yang tersedia di PDF tanpa embed (14 standard fonts)
    const FONT_REGULAR = 'Times-Roman';
    const FONT_BOLD    = 'Times-Bold';
    const FONT_ITALIC  = 'Times-Italic';

    // Konversi mm ke pt
    private function mm(float $mm): float {
        return $mm * 2.8346;
    }

    // --- Halaman ---

    public function addPage(): void {
        $this->curPage++;
        $this->streams[$this->curPage] = '';
        $this->curY = $this->pageH - $this->margin;
    }

    // --- Teks ---

    public function setFont(string $font, int $size): string {
        return "BT /F1 $size Tf ET";
    }

    /**
     * Tulis baris teks di posisi X, Y (koordinat PDF = dari bawah kiri)
     */
    private function writeText(float $x, float $y, string $text, string $font = self::FONT_REGULAR, int $size = 11): void {
        $escaped = $this->escapeText($text);
        $this->streams[$this->curPage] .=
            "BT /{$font} {$size} Tf {$x} {$y} Td ({$escaped}) Tj ET\n";
    }

    /**
     * Tulis baris teks di posisi X saat ini, curY (top-to-bottom helper)
     */
    public function text(string $text, float $x = -1, string $font = self::FONT_REGULAR, int $size = 11): void {
        if ($x < 0) $x = $this->margin;
        $this->writeText($x, $this->curY, $text, $font, $size);
    }

    /** Tulis teks tengah halaman */
    public function textCenter(string $text, string $font = self::FONT_REGULAR, int $size = 11): void {
        $textW = $this->estimateTextWidth($text, $size);
        $x = ($this->pageW - $textW) / 2;
        $this->writeText($x, $this->curY, $text, $font, $size);
    }

    /** Tulis teks rata kanan */
    public function textRight(string $text, string $font = self::FONT_REGULAR, int $size = 11): void {
        $textW = $this->estimateTextWidth($text, $size);
        $x = $this->pageW - $this->margin - $textW;
        $this->writeText($x, $this->curY, $text, $font, $size);
    }

    /** Pindah ke baris berikutnya */
    public function ln(float $h = 14): void {
        $this->curY -= $h;
    }

    /** Mendapatkan posisi Y saat ini */
    public function getY(): float {
        return $this->curY;
    }

    /** Set posisi Y */
    public function setY(float $y): void {
        $this->curY = $y;
    }

    // --- Garis ---

    /** Gambar garis horizontal */
    public function hLine(float $x1 = -1, float $x2 = -1, float $lineWidth = 0.5): void {
        if ($x1 < 0) $x1 = $this->margin;
        if ($x2 < 0) $x2 = $this->pageW - $this->margin;
        $y = $this->curY;
        $this->streams[$this->curPage] .=
            "{$lineWidth} w {$x1} {$y} m {$x2} {$y} l S\n";
    }

    /** Gambar garis vertikal */
    public function vLine(float $x, float $y1, float $y2, float $lineWidth = 0.5): void {
        $this->streams[$this->curPage] .=
            "{$lineWidth} w {$x} {$y1} m {$x} {$y2} l S\n";
    }

    /** Gambar rectangle (bingkai) */
    public function rect(float $x, float $y, float $w, float $h, float $lineWidth = 0.5): void {
        $this->streams[$this->curPage] .=
            "{$lineWidth} w {$x} {$y} {$w} {$h} re S\n";
    }

    // --- Tabel sederhana ---

    /**
     * Gambar tabel
     * $headers = ['Kolom A', 'Kolom B', ...]
     * $rows    = [['val1','val2'], ...]
     * $colWidths = [100, 200, ...] dalam pt
     * Return: posisi Y setelah tabel
     */
    public function table(array $headers, array $rows, array $colWidths, float $rowH = 18): float {
        $x0     = $this->margin;
        $totalW = array_sum($colWidths);
        $y      = $this->curY;

        // Header baris
        $xc = $x0;
        foreach ($headers as $i => $h) {
            $cw = $colWidths[$i];
            $this->rect($xc, $y - $rowH, $cw, $rowH);
            $this->writeText($xc + 4, $y - $rowH + 5, $h, self::FONT_BOLD, 9);
            $xc += $cw;
        }
        $y -= $rowH;

        // Baris data
        foreach ($rows as $row) {
            $xc = $x0;
            foreach ($row as $i => $cell) {
                $cw = $colWidths[$i] ?? 80;
                $this->rect($xc, $y - $rowH, $cw, $rowH);
                // Wrap teks panjang (potong saja jika terlalu panjang)
                $cell = $this->truncateText((string)$cell, $cw - 8, 9);
                $this->writeText($xc + 4, $y - $rowH + 5, $cell, self::FONT_REGULAR, 9);
                $xc += $cw;
            }
            $y -= $rowH;
        }

        $this->curY = $y;
        return $y;
    }

    // --- Utilitas teks ---

    private function escapeText(string $s): string {
        // Konversi UTF-8 ke Latin-1 (standard PDF font tidak support unicode penuh)
        $s = mb_convert_encoding($s, 'ISO-8859-1', 'UTF-8');
        $s = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $s);
        return $s;
    }

    private function estimateTextWidth(string $text, int $size): float {
        // Estimasi kasar: rata-rata lebar karakter ~0.5x font size untuk Times-Roman
        return mb_strlen($text) * $size * 0.45;
    }

    private function truncateText(string $text, float $maxWidth, int $size): string {
        while (mb_strlen($text) > 0 && $this->estimateTextWidth($text, $size) > $maxWidth) {
            $text = mb_substr($text, 0, -1);
        }
        return $text;
    }

    // --- Image (JPEG only) ---

    public function image(string $file, float $x, float $y, float $w = 0, float $h = 0): void {
        if (!isset($this->images[$file])) {
            $info = @getimagesize($file);
            if ($info === false || $info[2] !== IMAGETYPE_JPEG) {
                return; // Not a valid JPEG
            }
            $this->images[$file] = [
                'name' => 'I' . (count($this->images) + 1),
                'data' => file_get_contents($file),
                'w'    => $info[0],
                'h'    => $info[1]
            ];
        }
        
        $img = $this->images[$file];
        // 1px ~ 0.75pt (96dpi) if not specified
        if ($w == 0 && $h == 0) {
            $w = $img['w'] * 0.75;
            $h = $img['h'] * 0.75;
        } elseif ($w == 0) {
            $w = $h * $img['w'] / $img['h'];
        } elseif ($h == 0) {
            $h = $w * $img['h'] / $img['w'];
        }
        
        $name = $img['name'];
        $this->streams[$this->curPage] .= sprintf(
            "q %.2F 0 0 %.2F %.2F %.2F cm /%s Do Q\n",
            $w, $h, $x, $y, $name
        );
    }

    // --- Build PDF ---

    public function output(string $filename = 'dokumen.pdf'): void {
        $pdf = $this->buildPdf();

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($pdf));
        header('Cache-Control: private, max-age=0, must-revalidate');
        echo $pdf;
        exit;
    }

    private function buildPdf(): string {
        $buf     = "%PDF-1.4\n";
        $offsets = [];

        // --- Tambah font object (Times-Roman & Times-Bold & Times-Italic) ---
        $fontObjs = [
            self::FONT_REGULAR => '',
            self::FONT_BOLD    => '',
            self::FONT_ITALIC  => '',
        ];

        $fontObjIds = [];
        foreach ($fontObjs as $fname => $_ ) {
            $this->objCount++;
            $id = $this->objCount;
            $fontObjIds[$fname] = $id;
            $offsets[$id] = strlen($buf);
            $buf .= "$id 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /$fname /Encoding /WinAnsiEncoding >>\nendobj\n";
        }

        // --- Tambah page content streams ---
        $contentObjIds = [];
        foreach ($this->streams as $pageNum => $stream) {
            // Font resource di setiap stream
            // Kita assign /F1 = Times-Roman, /F2 = Times-Bold, /F3 = Times-Italic
            // Tapi untuk kemudahan kita pakai nama font langsung di writeText
            // Jadi kita perlu replace nama font di streams

            $this->objCount++;
            $id = $this->objCount;
            $contentObjIds[$pageNum] = $id;

            $streamBytes = strlen($stream);
            $offsets[$id] = strlen($buf);
            $buf .= "$id 0 obj\n<< /Length $streamBytes >>\nstream\n$stream\nendstream\nendobj\n";
        }

        // --- Resources dict (fonts + images) ---
        $fontDict = '';
        foreach ($fontObjIds as $fname => $fid) {
            // Nama resource: ganti '-' dan spasi dengan underscore
            $rname = str_replace(['-', ' '], '_', $fname);
            $fontDict .= "/$fname $fid 0 R ";
        }
        
        $xObjDict = '';
        foreach ($this->images as $file => &$img) {
            $this->objCount++;
            $id = $this->objCount;
            $img['id'] = $id;

            $data = $img['data'];
            $len = strlen($data);
            $w = $img['w'];
            $h = $img['h'];

            $offsets[$id] = strlen($buf);
            $buf .= "$id 0 obj\n<< /Type /XObject /Subtype /Image /Width $w /Height $h /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length $len >>\nstream\n$data\nendstream\nendobj\n";

            $xObjDict .= "/{$img['name']} $id 0 R ";
        }

        $this->objCount++;
        $resourceId = $this->objCount;
        $offsets[$resourceId] = strlen($buf);
        $buf .= "$resourceId 0 obj\n<< /Font << $fontDict>> ";
        if ($xObjDict !== '') {
            $buf .= "/XObject << $xObjDict >> ";
        }
        $buf .= ">>\nendobj\n";

        // --- Page objects ---
        $pageObjIds = [];
        // Kita butuh ID pages dict dulu (forward reference → pre-allocate)
        $this->objCount++;
        $pagesDictId = $this->objCount;

        foreach ($this->streams as $pageNum => $stream) {
            $this->objCount++;
            $pid = $this->objCount;
            $pageObjIds[$pageNum] = $pid;
            $contentId = $contentObjIds[$pageNum];
            $offsets[$pid] = strlen($buf);
            $buf .= "$pid 0 obj\n<< /Type /Page /Parent $pagesDictId 0 R "
                  . "/MediaBox [0 0 {$this->pageW} {$this->pageH}] "
                  . "/Contents $contentId 0 R "
                  . "/Resources $resourceId 0 R >>\nendobj\n";
        }

        // --- Pages dict ---
        $kidsStr = implode(' 0 R ', $pageObjIds) . ' 0 R';
        $pageCount = count($pageObjIds);
        $offsets[$pagesDictId] = strlen($buf);
        $buf .= "$pagesDictId 0 obj\n<< /Type /Pages /Kids [$kidsStr] /Count $pageCount >>\nendobj\n";

        // --- Catalog ---
        $this->objCount++;
        $catalogId = $this->objCount;
        $offsets[$catalogId] = strlen($buf);
        $buf .= "$catalogId 0 obj\n<< /Type /Catalog /Pages $pagesDictId 0 R >>\nendobj\n";

        // --- xref table ---
        $xrefOffset = strlen($buf);
        $total = $this->objCount + 1;
        $buf .= "xref\n0 $total\n";
        $buf .= "0000000000 65535 f \n";
        for ($i = 1; $i <= $this->objCount; $i++) {
            $off = $offsets[$i] ?? 0;
            $buf .= str_pad($off, 10, '0', STR_PAD_LEFT) . " 00000 n \n";
        }

        // --- Trailer ---
        $buf .= "trailer\n<< /Size $total /Root $catalogId 0 R >>\n";
        $buf .= "startxref\n$xrefOffset\n%%EOF\n";

        return $buf;
    }
}
