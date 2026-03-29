<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../utils/Response.php";
require_once __DIR__ . "/../utils/Token.php";

class AuthController {

    public static function login() {
        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input) {
            Response::json(["status"=>false,"message"=>"Invalid JSON"], 400);
        }

        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (!$username || !$password) {
            Response::json(["status"=>false,"message"=>"Username dan password wajib diisi"], 422);
        }

        global $pdo;

        // CEK KE TABEL GURU
        $stmt = $pdo->prepare("SELECT * FROM guru WHERE username=? AND deleted_at IS NULL");
        $stmt->execute([$username]);
        $guru = $stmt->fetch(PDO::FETCH_ASSOC);

        // if ($guru && $guru['password'] === $password) {
        if ($guru && password_verify($password, $guru['password'])) {
            $token = Token::generate([
                "id"   => $guru['id'],
                "role" => $guru['role'], // admin | guru | bk
                "type" => "guru"
            ]);

            Response::json([
                "status" => true,
                "message" => "Login berhasil",
                "token" => $token,
                "user" => [
                    "id" => $guru['id'],
                    "nama" => $guru['nama'],
                    "username" => $guru['username'],
                    "email" => $guru['email'],
                    "role" => $guru['role'],
                    "type" => "guru"
                ]
            ]);
        }

        // CEK KE TABEL SISWA
        $stmt = $pdo->prepare("SELECT * FROM siswa WHERE username=? AND deleted_at IS NULL");
        $stmt->execute([$username]);
        $siswa = $stmt->fetch(PDO::FETCH_ASSOC);
    
        // if ($siswa && $siswa['password'] === $password) {
        if ($siswa && password_verify($password, $siswa['password'])) {
            $token = Token::generate([
                "id"   => $siswa['id'],
                "role" => "siswa",
                "type" => "siswa"
            ]);

            Response::json([
                "status" => true,
                "message" => "Login berhasil",
                "token" => $token,
                "user" => [
                    "id" => $siswa['id'],
                    "nama" => $siswa['nama'],
                    "username" => $siswa['username'],
                    "email" => $siswa['email'],
                    "role" => "siswa",
                    "type" => "siswa"
                ]
            ]);
        }

        Response::json([
            "status" => false,
            "message" => "Username atau password salah"
        ], 401);
    }

    public static function logout() {
        // stateless JWT → FE cukup hapus token
        Response::json([
            "status" => true,
            "message" => "Logout berhasil"
        ]);
    }
}
