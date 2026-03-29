<?php

require_once __DIR__ . "/../utils/Token.php";
require_once __DIR__ . "/../utils/Response.php";

class AuthMiddleware {

    public static function auth(array $roles = []) {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? '';

        if (!$auth || !str_starts_with($auth, 'Bearer ')) {
            Response::json(["status"=>false,"message"=>"Token tidak ditemukan"], 401);
        }

        $token = str_replace('Bearer ', '', $auth);
        $payload = Token::verify($token);

        if (!$payload) {
            Response::json(["status"=>false,"message"=>"Token tidak valid"], 401);
        }

        if ($roles && !in_array($payload['role'], $roles)) {
            Response::json(["status"=>false,"message"=>"Akses ditolak"], 403);
        }

        return $payload;
    }
}
