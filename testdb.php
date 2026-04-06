<?php
require 'backend/config/database.php';
try {
    $stmt = $pdo->query('SELECT tempat_lahir, tanggal_lahir FROM orang_tua LIMIT 1');
    echo "OK\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
