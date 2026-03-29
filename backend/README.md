# 📚 Backend API Documentation

Backend dibangun menggunakan **Pure PHP** tanpa framework, routing manual via `index.php`.

> 🔐 Semua endpoint (kecuali `/api/login`) membutuhkan **Bearer Token** di header:
> ```
> Authorization: Bearer <token>
> ```

---

## 🗂️ Struktur Folder

```
backend/
├── config/
│   └── database.php                         # Koneksi PDO
├── controllers/
│   ├── AuthController.php                   # Login & Logout
│   ├── UserController.php                   # Profil user aktif
│   ├── AdminController/
│   │   ├── AdminSiswaController.php         # CRUD Siswa
│   │   ├── AdminOrangTuaController.php      # CRUD Orang Tua
│   │   ├── AdminGuruController.php          # CRUD Guru
│   │   └── AdminJenisPelanggaranController.php
│   └── GuruController/
│       └── GuruPelanggaranController.php    # CRUD Pelanggaran
├── middleware/
│   ├── AuthMiddleware.php                   # Validasi JWT & role
│   └── Cors.php
├── utils/
│   ├── Response.php                         # Helper JSON response
│   ├── Token.php                            # Generate/verify JWT
│   └── PoinHelper.php                       # Hitung ulang poin siswa
└── index.php                                # Entry point & routing
```

---

## 👤 Role yang Tersedia

| Role | Keterangan |
|------|-----------|
| `admin` | Akses penuh ke semua data master |
| `guru` | Mencatat & mengelola pelanggaran |
| `bk` | Sama seperti guru, akses pelanggaran |
| `siswa` | Hanya bisa lihat profil sendiri |

---

## 🔑 Auth

### `POST /api/login` — Login

Tidak perlu token. Sistem akan mencari user di tabel `guru` terlebih dahulu, lalu ke tabel `siswa`.

**Request Body:**
```json
{
  "username": "admin01",
  "password": "rahasia123"
}
```

**Response Sukses (200):**
```json
{
  "status": true,
  "message": "Login berhasil",
  "token": "eyJ0eXAiOiJKV1Q...",
  "user": {
    "id": 1,
    "nama": "Budi Santoso",
    "username": "admin01",
    "email": "budi@sekolah.id",
    "role": "admin",
    "type": "guru"
  }
}
```

**Error Responses:**

| Kondisi | HTTP | Pesan |
|---------|------|-------|
| Username/password kosong | 422 | `"Username dan password wajib diisi"` |
| Kredensial salah | 401 | `"Username atau password salah"` |
| Body bukan JSON valid | 400 | `"Invalid JSON"` |

---

### `POST /api/logout` — Logout

Karena JWT bersifat stateless, logout cukup menghapus token di sisi frontend. Endpoint ini hanya mengembalikan konfirmasi.

**Response:**
```json
{ "status": true, "message": "Logout berhasil" }
```

---

## 👁️ User

### `GET /api/me` — Info User yang Sedang Login

Mengembalikan data profil berdasarkan token. Jika `type` adalah `guru`, hanya mengembalikan field guru. Jika `type` adalah `siswa`, mengembalikan data siswa beserta data orang tua.

**Response (Guru):**
```json
{
  "status": true,
  "user": {
    "id": 1,
    "nama": "Budi Santoso",
    "username": "admin01",
    "email": "budi@sekolah.id",
    "role": "admin"
  }
}
```

**Response (Siswa):**
```json
{
  "status": true,
  "user": {
    "id": 5,
    "nama": "Andi Kurniawan",
    "username": "andi05",
    "nis": "2024005",
    "kelas": "XII",
    "jurusan": "RPL",
    "poin": 10,
    "total_poin": 35,
    "orang_tua": [
      { "nama": "Bapak Andi", "hubungan": "ayah", "telp": "081...", "pekerjaan": "PNS", "alamat": "Jl. ..." },
      { "nama": "Ibu Andi", "hubungan": "ibu", "telp": "082...", "pekerjaan": "Guru", "alamat": "Jl. ..." }
    ]
  }
}
```

---

## 👨‍🎓 Siswa (Admin)

> **Role:** `admin` | **Controller:** `AdminSiswaController.php`

### `GET /api/admin/siswa/show` — Daftar Semua Siswa

Mengembalikan daftar siswa aktif (belum dihapus), diurutkan berdasarkan nama.

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 5,
      "nama": "Andi Kurniawan",
      "username": "andi05",
      "nis": "2024005",
      "kelas": "XII",
      "jurusan": "RPL",
      "jenis_kelamin": "L",
      "email": "andi@mail.com",
      "poin": 10,
      "total_poin": 35
    }
  ]
}
```

---

### `GET /api/admin/siswa/{id}` — Detail Siswa

Mengembalikan data lengkap siswa beserta daftar orang tuanya.

**Response:**
```json
{
  "status": true,
  "data": {
    "id": 5,
    "username": "andi05",
    "nama": "Andi Kurniawan",
    "nis": "2024005",
    "kelas": "XII",
    "jurusan": "RPL",
    "jenis_kelamin": "L",
    "alamat": "Jl. Merdeka No. 5",
    "no_telp": "08123456789",
    "email": "andi@mail.com",
    "poin": 10,
    "total_poin": 35,
    "orang_tua": [
      { "id": 1, "nama": "Bapak Andi", "hubungan": "ayah", "telp": "...", "pekerjaan": "...", "alamat": "..." }
    ]
  }
}
```

**Error:** `404` jika siswa tidak ditemukan.

---

### `POST /api/admin/siswa/create` — Tambah Siswa + Orang Tua

Menggunakan **database transaction**. Jika gagal di tengah jalan, semua perubahan di-rollback.

**Request Body:**
```json
{
  "siswa": {
    "username": "andi05",
    "password": "rahasia123",
    "nama": "Andi Kurniawan",
    "nis": "2024005",
    "kelas": "XII",
    "jurusan": "RPL",
    "jenis_kelamin": "L",
    "alamat": "Jl. Merdeka No. 5",
    "no_telp": "08123456789",
    "email": "andi@mail.com"
  },
  "orang_tua": [
    {
      "nama": "Bapak Andi",
      "hubungan": "ayah",
      "telp": "08111",
      "pekerjaan": "PNS",
      "alamat": "Jl. Merdeka No. 5"
    },
    {
      "nama": "Ibu Andi",
      "hubungan": "ibu",
      "telp": "08222",
      "pekerjaan": "Guru",
      "alamat": "Jl. Merdeka No. 5"
    }
  ]
}
```

> ⚠️ Field `siswa` dan `orang_tua` **wajib** ada dalam payload.

**Response Sukses (201):**
```json
{ "status": true, "message": "Siswa & orang tua berhasil ditambahkan" }
```

**Error:** `422` jika payload tidak lengkap, `500` jika terjadi error database.

---

### `PUT /api/admin/siswa/{id}` — Update Siswa

Juga bisa sekaligus update / insert orang tua. Jika data orang tua untuk `hubungan` tertentu sudah ada → di-UPDATE, jika belum ada → di-INSERT.

**Request Body:**
```json
{
  "username": "andi05",
  "nama": "Andi Kurniawan",
  "nis": "2024005",
  "kelas": "XII",
  "jurusan": "RPL",
  "jenis_kelamin": "L",
  "alamat": "Jl. Baru No. 1",
  "no_telp": "08123456789",
  "email": "andi@mail.com",
  "poin": 10,
  "total_poin": 35,
  "orang_tua": [
    { "hubungan": "ayah", "nama": "Bapak Andi", "telp": "081...", "pekerjaan": "PNS", "alamat": "..." }
  ]
}
```

**Response:**
```json
{ "status": true, "message": "Data siswa berhasil diperbarui" }
```

**Error:** `404` jika siswa tidak ditemukan, `400` jika JSON tidak valid.

---

### `DELETE /api/admin/siswa/{id}` — Hapus Siswa (Soft Delete)

Menggunakan **database transaction**. Menghapus siswa **dan semua orang tua terkait** secara soft delete.

**Response:**
```json
{ "status": true, "message": "Siswa berhasil dihapus" }
```

**Error:** `404` jika siswa tidak ditemukan, `500` jika gagal.

---

## 👨‍👩‍👦 Orang Tua Siswa (Admin)

> **Role:** `admin` | **Controller:** `AdminOrangTuaController.php`

> ⚠️ Satu siswa hanya boleh memiliki **1 data ayah** dan **1 data ibu**.

### `GET /api/admin/siswa/{id}/orangtua` — Daftar Orang Tua

**Response:**
```json
{
  "status": true,
  "data": [
    { "id": 1, "nama": "Bapak Andi", "hubungan": "ayah", "telp": "...", "pekerjaan": "...", "alamat": "..." },
    { "id": 2, "nama": "Ibu Andi", "hubungan": "ibu", "telp": "...", "pekerjaan": "...", "alamat": "..." }
  ]
}
```

---

### `POST /api/admin/siswa/{id}/orangtua` — Tambah Orang Tua

**Request Body:**
```json
{
  "nama": "Bapak Andi",
  "hubungan": "ayah",
  "telp": "08111",
  "pekerjaan": "PNS",
  "alamat": "Jl. Merdeka"
}
```

| Field | Wajib | Keterangan |
|-------|-------|-----------|
| `nama` | ✅ | Nama orang tua |
| `hubungan` | ✅ | Hanya `"ayah"` atau `"ibu"` |
| `telp` | ❌ | Nomor telepon |
| `pekerjaan` | ❌ | Pekerjaan |
| `alamat` | ❌ | Alamat |

**Error Responses:**

| Kondisi | HTTP | Pesan |
|---------|------|-------|
| `nama`/`hubungan` kosong | 422 | `"Field [x] wajib diisi"` |
| `hubungan` bukan ayah/ibu | 422 | `"Hubungan harus ayah atau ibu"` |
| Duplikat ayah atau ibu | 409 | `"Data ayah/ibu sudah ada"` |

**Response Sukses (201):**
```json
{ "status": true, "message": "Orang tua berhasil ditambahkan" }
```

---

### `PUT /api/admin/orangtua/{id}` — Update Orang Tua

> ⚠️ Field `hubungan` **tidak bisa diubah** melalui endpoint ini.

**Request Body:**
```json
{
  "nama": "Bapak Andi Update",
  "telp": "08999",
  "pekerjaan": "Wiraswasta",
  "alamat": "Jl. Baru"
}
```

**Response:**
```json
{ "status": true, "message": "Data orang tua berhasil diperbarui" }
```

---

### `DELETE /api/admin/orangtua/{id}` — Hapus Orang Tua (Soft Delete)

**Response:**
```json
{ "status": true, "message": "Data orang tua berhasil dihapus" }
```

---

## 👨‍🏫 Guru (Admin)

> **Role:** `admin` | **Controller:** `AdminGuruController.php`

### `GET /api/admin/guru` — Daftar Semua Guru

**Response:**
```json
{
  "status": true,
  "data": [
    { "id": 1, "nama": "Budi Santoso", "username": "budi01", "kode_guru": "G001", "jenis_kelamin": "L", "email": "budi@mail.com", "role": "admin" }
  ]
}
```

---

### `GET /api/admin/guru/{id}` — Detail Guru

**Response:**
```json
{ "status": true, "data": { ...semua_kolom_guru... } }
```

**Error:** `404` jika guru tidak ditemukan.

---

### `POST /api/admin/guru` — Tambah Guru

**Request Body:**
```json
{
  "username": "budi01",
  "password": "rahasia123",
  "nama": "Budi Santoso",
  "kode_guru": "G001",
  "jenis_kelamin": "L",
  "email": "budi@sekolah.id",
  "role": "guru"
}
```

> Field `role` bisa diisi: `admin`, `guru`, atau `bk`.

**Error Responses:**

| Kondisi | HTTP | Pesan |
|---------|------|-------|
| Ada field wajib kosong | 422 | `"Field [x] wajib diisi"` |
| Username sudah dipakai | 409 | `"Username sudah digunakan"` |

**Response Sukses (201):**
```json
{ "status": true, "message": "Guru berhasil ditambahkan" }
```

---

### `PUT /api/admin/guru/{id}` — Update Guru

> ⚠️ `username` dan `password` **tidak bisa diubah** melalui endpoint ini.

**Request Body:**
```json
{
  "nama": "Budi Santoso",
  "kode_guru": "G001",
  "jenis_kelamin": "L",
  "email": "budi@mail.com",
  "role": "guru"
}
```

**Response:**
```json
{ "status": true, "message": "Data guru berhasil diperbarui" }
```

---

### `DELETE /api/admin/guru/{id}` — Hapus Guru (Soft Delete)

**Response:**
```json
{ "status": true, "message": "Guru berhasil dihapus" }
```

---

## 📋 Jenis Pelanggaran (Admin)

> **Role:** `admin` | **Controller:** `AdminJenisPelanggaranController.php`

### `GET /api/admin/jenis-pelanggaran` — Daftar Jenis Pelanggaran

**Response:**
```json
{
  "status": true,
  "data": [
    { "id": 1, "kode_pelanggaran": "P001", "nama_pelanggaran": "Bolos", "sanksi_poin": 10, "deskripsi_sanksi": "Poin dikurangi 10" }
  ]
}
```

---

### `GET /api/admin/jenis-pelanggaran/{id}` — Detail Jenis Pelanggaran

**Error:** `404` jika tidak ditemukan.

---

### `POST /api/admin/jenis-pelanggaran` — Tambah Jenis Pelanggaran

**Request Body:**
```json
{
  "kode_pelanggaran": "P001",
  "nama_pelanggaran": "Bolos",
  "sanksi_poin": 10,
  "deskripsi_sanksi": "Tidak hadir tanpa keterangan"
}
```

| Field | Wajib | Keterangan |
|-------|-------|-----------|
| `kode_pelanggaran` | ✅ | Harus unik |
| `nama_pelanggaran` | ✅ | Nama jenis pelanggaran |
| `sanksi_poin` | ✅ | Poin yang dikurangkan |
| `deskripsi_sanksi` | ❌ | Keterangan tambahan |

**Error:** `422` jika field wajib kosong, `409` jika kode sudah digunakan.

**Response Sukses (201):**
```json
{ "status": true, "message": "Jenis pelanggaran berhasil ditambahkan" }
```

---

### `PUT /api/admin/jenis-pelanggaran/{id}` — Update Jenis Pelanggaran

> ⚠️ `kode_pelanggaran` **tidak bisa diubah** melalui endpoint ini.

**Request Body:**
```json
{
  "nama_pelanggaran": "Bolos Sekolah",
  "sanksi_poin": 15,
  "deskripsi_sanksi": "Tidak hadir lebih dari 1 hari"
}
```

**Response:**
```json
{ "status": true, "message": "Jenis pelanggaran berhasil diperbarui" }
```

---

### `DELETE /api/admin/jenis-pelanggaran/{id}` — Hapus Jenis Pelanggaran (Soft Delete)

**Response:**
```json
{ "status": true, "message": "Jenis pelanggaran berhasil dihapus" }
```

---

## 🚨 Pelanggaran (Guru / BK)

> **Role:** `guru`, `bk` | **Controller:** `GuruPelanggaranController.php`

### Sistem Poin

Setiap kali pelanggaran dicatat, poin siswa otomatis bertambah. Jika poin siswa mencapai **threshold** (25, 50, 75, atau 100), **poin aktif (`poin`) direset ke 0**, tetapi **`total_poin` terus bertambah** sebagai riwayat.

Ketika pelanggaran di-update atau dihapus, poin siswa **dihitung ulang** otomatis via `PoinHelper::refreshPoinSiswa()`.

---

### `GET /api/guru/pelanggaran` — Daftar Semua Pelanggaran

Mengembalikan seluruh catatan pelanggaran dengan join ke data siswa dan jenis pelanggaran, diurutkan terbaru.

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 3,
      "nama_siswa": "Andi Kurniawan",
      "nis": "2024005",
      "nama_pelanggaran": "Bolos",
      "poin": 10,
      "keterangan": "Tidak hadir hari Senin",
      "created_at": "2026-02-20 08:00:00"
    }
  ]
}
```

---

### `GET /api/guru/pelanggaran/{id}` — Detail Pelanggaran

**Response:**
```json
{
  "status": true,
  "data": {
    "id": 3,
    "id_siswa": 5,
    "id_jenis_pelanggaran": 1,
    "poin": 10,
    "keterangan": "Tidak hadir hari Senin",
    "created_at": "2026-02-20 08:00:00",
    "nama_siswa": "Andi Kurniawan",
    "nama_pelanggaran": "Bolos"
  }
}
```

**Error:** `404` jika tidak ditemukan.

---

### `POST /api/guru/pelanggaran` — Catat Pelanggaran

Otomatis mengambil `poin` dari tabel `jenis_pelanggaran` dan menambahkannya ke poin siswa.

**Request Body:**
```json
{
  "id_siswa": 5,
  "id_jenis_pelanggaran": 1,
  "keterangan": "Tidak hadir hari Senin tanpa keterangan"
}
```

**Error Responses:**

| Kondisi | HTTP | Pesan |
|---------|------|-------|
| Field wajib kosong | 422 | `"Field [x] wajib diisi"` |
| Siswa tidak ditemukan | 404 | `"Siswa tidak ditemukan atau sudah dihapus"` |
| Jenis pelanggaran tidak ada | 404 | `"Jenis pelanggaran tidak ditemukan"` |

**Response Sukses (201):**
```json
{ "status": true, "message": "Pelanggaran berhasil dicatat" }
```

---

### `PUT /api/guru/pelanggaran/{id}` — Update Pelanggaran

Setelah update, **poin siswa otomatis dihitung ulang**.

**Request Body:**
```json
{
  "id_jenis_pelanggaran": 2,
  "keterangan": "Keterangan diperbarui"
}
```

**Error:** `404` jika data tidak ditemukan.

**Response:**
```json
{ "status": true, "message": "Pelanggaran diperbarui" }
```

---

### `DELETE /api/guru/pelanggaran/{id}` — Hapus Pelanggaran (Soft Delete)

Setelah hapus, **poin siswa otomatis dihitung ulang**.

**Error:** `404` jika data tidak ditemukan.

**Response:**
```json
{ "status": true, "message": "Pelanggaran dihapus" }
```

---

## 📊 Ringkasan Semua Endpoint

| Method | Endpoint | Role | Keterangan |
|--------|----------|------|-----------|
| POST | `/api/login` | — | Login |
| POST | `/api/logout` | — | Logout |
| GET | `/api/me` | semua | Profil user aktif |
| GET | `/api/admin/siswa/show` | admin | Daftar siswa |
| GET | `/api/admin/siswa/{id}` | admin | Detail siswa + orang tua |
| POST | `/api/admin/siswa/create` | admin | Tambah siswa + orang tua |
| PUT | `/api/admin/siswa/{id}` | admin | Update siswa |
| DELETE | `/api/admin/siswa/{id}` | admin | Hapus siswa (soft delete) |
| GET | `/api/admin/siswa/{id}/orangtua` | admin | Daftar orang tua siswa |
| POST | `/api/admin/siswa/{id}/orangtua` | admin | Tambah orang tua |
| PUT | `/api/admin/orangtua/{id}` | admin | Update orang tua |
| DELETE | `/api/admin/orangtua/{id}` | admin | Hapus orang tua |
| GET | `/api/admin/guru` | admin | Daftar guru |
| GET | `/api/admin/guru/{id}` | admin | Detail guru |
| POST | `/api/admin/guru` | admin | Tambah guru |
| PUT | `/api/admin/guru/{id}` | admin | Update guru |
| DELETE | `/api/admin/guru/{id}` | admin | Hapus guru |
| GET | `/api/admin/jenis-pelanggaran` | admin | Daftar jenis pelanggaran |
| GET | `/api/admin/jenis-pelanggaran/{id}` | admin | Detail jenis pelanggaran |
| POST | `/api/admin/jenis-pelanggaran` | admin | Tambah jenis pelanggaran |
| PUT | `/api/admin/jenis-pelanggaran/{id}` | admin | Update jenis pelanggaran |
| DELETE | `/api/admin/jenis-pelanggaran/{id}` | admin | Hapus jenis pelanggaran |
| GET | `/api/guru/pelanggaran` | guru, bk | Daftar pelanggaran |
| GET | `/api/guru/pelanggaran/{id}` | guru, bk | Detail pelanggaran |
| POST | `/api/guru/pelanggaran` | guru, bk | Catat pelanggaran |
| PUT | `/api/guru/pelanggaran/{id}` | guru, bk | Update pelanggaran |
| DELETE | `/api/guru/pelanggaran/{id}` | guru, bk | Hapus pelanggaran |

---

## 🧰 Contoh Penggunaan (JavaScript Fetch)

```javascript
const BASE_URL = 'http://localhost/api';
const token = localStorage.getItem('token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Login
const login = await fetch(`${BASE_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin01', password: 'rahasia' })
}).then(r => r.json());

// GET daftar siswa
const siswa = await fetch(`${BASE_URL}/admin/siswa/show`, { headers }).then(r => r.json());

// POST catat pelanggaran
await fetch(`${BASE_URL}/guru/pelanggaran`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ id_siswa: 5, id_jenis_pelanggaran: 1, keterangan: 'Bolos hari Senin' })
});

// DELETE siswa
await fetch(`${BASE_URL}/admin/siswa/5`, { method: 'DELETE', headers });
```

---

## ⚠️ Catatan Teknis

- Semua penghapusan menggunakan **soft delete** (`deleted_at`), data tidak benar-benar hilang dari DB.
- Password disimpan menggunakan `password_hash()` (bcrypt).
- `Response::json()` harus memanggil `exit` agar fallback 404 di akhir `index.php` tidak ikut tereksekusi.
- Routing menggunakan `preg_match` untuk URL dengan parameter dinamis (`{id}`).
- `GuruPelanggaranController` menggunakan `PoinHelper::refreshPoinSiswa()` untuk menghitung ulang poin setelah update/delete pelanggaran.
