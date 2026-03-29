<?php

$host = "db";
$db   = "db_ukk";
$user = "denn";
$pass = "denn123";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );
} catch (PDOException $e) {
    Response::json([
        "status" => false,
        "message" => "Database connection failed"
    ], 500);
}
