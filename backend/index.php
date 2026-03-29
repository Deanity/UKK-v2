<?php

require_once __DIR__ . "/middleware/Cors.php";
require_once __DIR__ . "/utils/Response.php";
require_once __DIR__ . "/controllers/AuthController.php";
require_once __DIR__ . "/controllers/UserController.php";
require_once __DIR__ . "/controllers/AdminController/AdminSiswaController.php";
require_once __DIR__ . "/controllers/AdminController/AdminOrangTuaController.php";
require_once __DIR__ . "/controllers/AdminController/AdminJenisPelanggaranController.php";
require_once __DIR__ . "/controllers/GuruController/GuruPelanggaranController.php";
require_once __DIR__ . "/controllers/AdminController/AdminGuruController.php";
require_once __DIR__ . "/controllers/BkController/GenerateSurat.php";
require_once __DIR__ . "/controllers/BkController/SuratController.php";
require_once __DIR__ . "/controllers/BkController/LaporanController.php";
require_once __DIR__ . "/controllers/DashboardController.php";

Cors::handle();

$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$method = $_SERVER["REQUEST_METHOD"];

if (($uri === '/' || $uri === '/docs' || $uri === '/api' || $uri === '/api/') && $method === 'GET') {
    require_once __DIR__ . '/docs.php';
    exit;
}

if ($uri === "/api/login" && $method === "POST") {
    AuthController::login();
}
if ($uri === "/api/logout" && $method === "POST") {
    AuthController::logout();
}

if ($uri === "/api/me" && $method === "GET") {
    UserController::me();
}

if ($uri === '/api/dashboard' && $method === 'GET') {
    DashboardController::index();
}

if ($uri === '/api/dashboard/chart' && $method === 'GET') {
    DashboardController::pelanggaranPerBulan();
}

if ($uri === '/api/admin/siswa/show' && $method === 'GET') {
    AdminSiswaController::index();
}

if ($uri === '/api/admin/siswa/create' && $method === 'POST') {
    AdminSiswaController::storeWithParents();
}

if (preg_match('#^/api/admin/siswa/(\d+)$#', $uri, $m)) {
    if ($method === 'GET') {
        AdminSiswaController::show($m[1]);
    }
    if ($method === 'PUT') {
        AdminSiswaController::update($m[1]);
    }
    if ($method === 'DELETE') {
        AdminSiswaController::destroy($m[1]);
    }
}

if (preg_match('#^/api/admin/siswa/(\d+)/orangtua$#', $uri, $m)) {
    if ($method === 'GET') {
        AdminOrangTuaController::indexBySiswa($m[1]);
    }
    if ($method === 'POST') {
        AdminOrangTuaController::store($m[1]);
    }
}

if (preg_match('#^/api/admin/orangtua/(\d+)$#', $uri, $m)) {
    if ($method === 'PUT') {
        AdminOrangTuaController::update($m[1]);
    }
    if ($method === 'DELETE') {
        AdminOrangTuaController::destroy($m[1]);
    }
}

if ($uri === '/api/admin/jenis-pelanggaran' && $method === 'GET') {
    AdminJenisPelanggaranController::index();
}

if ($uri === '/api/admin/jenis-pelanggaran' && $method === 'POST') {
    AdminJenisPelanggaranController::store();
}

if (preg_match('#^/api/admin/jenis-pelanggaran/(\d+)$#', $uri, $m)) {
    if ($method === 'GET') {
        AdminJenisPelanggaranController::show($m[1]);
    }
    if ($method === 'PUT') {
        AdminJenisPelanggaranController::update($m[1]);
    }
    if ($method === 'DELETE') {
        AdminJenisPelanggaranController::destroy($m[1]);
    }
}

if ($uri === '/api/guru/pelanggaran' && $method === 'GET') {
    GuruPelanggaranController::index();
}

if ($uri === '/api/guru/pelanggaran' && $method === 'POST') {
    GuruPelanggaranController::store();
}

if (preg_match('#^/api/guru/pelanggaran/(\d+)$#', $uri, $m)) {
    if ($method === 'GET') {
        GuruPelanggaranController::show($m[1]);
    }
    if ($method === 'PUT') {
        GuruPelanggaranController::update($m[1]);
    }
    if ($method === 'DELETE') {
        GuruPelanggaranController::destroy($m[1]);
    }
}

if ($uri === '/api/admin/guru' && $method === 'GET') {
    AdminGuruController::index();
}

if ($uri === '/api/admin/guru' && $method === 'POST') {
    AdminGuruController::store();
}

if (preg_match('#^/api/admin/guru/(\d+)$#', $uri, $m)) {
    if ($method === 'GET') {
        AdminGuruController::show($m[1]);
    }
    if ($method === 'PUT') {
        AdminGuruController::update($m[1]);
    }
    if ($method === 'DELETE') {
        AdminGuruController::destroy($m[1]);
    }
}

// ---- Surat BK ----

if (preg_match('#^/api/bk/surat/panggilan/(\d+)$#', $uri, $m)) {
    if ($method === 'GET') {
        GenerateSurat::suratPanggilan((int)$m[1]);
    }
}

if (preg_match('#^/api/bk/surat/pernyataan/(\d+)$#', $uri, $m)) {
    if ($method === 'GET') {
        GenerateSurat::suratPernyataan((int)$m[1]);
    }
}

// ---- Modul Web Surat (History) ----

if ($uri === '/api/bk/surat' && $method === 'GET') {
    SuratController::index();
}

if ($uri === '/api/bk/surat' && $method === 'POST') {
    SuratController::store();
}

if (preg_match('#^/api/bk/surat/(\d+)$#', $uri, $m)) {
    if ($method === 'GET') {
        SuratController::show($m[1]);
    }
    if ($method === 'PUT') {
        SuratController::update($m[1]);
    }
    if ($method === 'DELETE') {
        SuratController::destroy($m[1]);
    }
}

// ---- Modul Web Laporan (Mediasi) ----

if ($uri === '/api/bk/laporan' && $method === 'GET') {
    LaporanController::index();
}

if ($uri === '/api/bk/laporan' && $method === 'POST') {
    LaporanController::store();
}

if (preg_match('#^/api/bk/laporan/(\d+)$#', $uri, $m)) {
    if ($method === 'GET') {
        LaporanController::show($m[1]);
    }
    if ($method === 'PUT') {
        LaporanController::update($m[1]);
    }
    if ($method === 'DELETE') {
        LaporanController::destroy($m[1]);
    }
}

Response::json([
    "status" => false,
    "message" => "Endpoint tidak ditemukan"
], 404);
