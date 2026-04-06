<?php
require 'backend/utils/Response.php'; 
require 'backend/config/database.php';
try {
    // Attempting a simple insert into orang_tua with the new fields
    $stmt = $pdo->prepare("INSERT INTO orang_tua (id_siswa, nama, hubungan, telp, pekerjaan, tempat_lahir, tanggal_lahir, alamat, created_at) VALUES (?,?,?,?,?,?,?,?,NOW())");
    // NIS 19 exists in storage.sql
    $stmt->execute([19, 'Test Parent ' . time(), 'ayah', '08123', 'Dev', 'Jakarta', '2000-01-01', 'Jl. Test']);
    echo "SUCCESS: Insert worked.\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
