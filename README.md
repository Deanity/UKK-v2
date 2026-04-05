# 🎓 Sistem Poin Pelanggaran Siswa — SMK TI Bali Denpasar

Aplikasi web untuk mencatat dan mengelola **poin pelanggaran siswa** di lingkungan sekolah. Dibangun sebagai project **UKK (Ujian Kompetensi Keahlian)** dengan stack **React (Frontend)** dan **Pure PHP (Backend)**.

---

## 📌 Tentang Proyek

Sistem ini membantu pihak sekolah dalam:
- Mencatat setiap **pelanggaran** yang dilakukan siswa beserta poin pengurangannya
- Mengelola **data master** seperti siswa, guru, dan jenis pelanggaran
- Memantau **akumulasi poin** tiap siswa secara real-time
- Mencetak **surat peringatan** berdasarkan pelanggaran yang tercatat

---

## ✨ Fitur Utama

### 👨‍💼 Admin
- CRUD Data Siswa (beserta data Orang Tua)
- CRUD Data Guru
- CRUD Jenis Pelanggaran (kode, nama, poin sanksi)
- Kelola Template Surat

### 🧑‍🏫 Guru
- Input pelanggaran siswa secara cepat

### 🧑‍💻 Guru BK
- Lihat semua pelanggaran siswa
- Tambah / edit / hapus catatan pelanggaran
- Cetak surat peringatan

### 👦 Siswa
- Lihat profil diri sendiri
- Lihat poin aktif, total poin, dan riwayat pelanggaran

---

## 🏗️ Struktur Proyek

```
Tugas_UKK_React/
├── backend/        # API PHP murni (tanpa framework)
│   ├── README.md   # Dokumentasi API lengkap
│   └── ...
├── frontend/       # Aplikasi React + TypeScript
│   ├── README.md   # Dokumentasi frontend lengkap
│   └── ...
└── README.md       # (file ini)
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui, Lucide React |
| State | TanStack Query, React Context (Auth) |
| HTTP | Axios |
| Form | React Hook Form + Zod |
| Backend | Pure PHP (tanpa framework) |
| Auth | JWT (Bearer Token) |
| Database | MySQL (via PDO) |

---

## 🚀 Panduan Instalasi (Start Here)

Pilih salah satu metode di bawah ini untuk menjalankan aplikasi:

### Metode A: Menggunakan Docker (Rekomendasi ⚡)
Pastikan Anda sudah menginstal [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. **Clone Repository**
   ```bash
   git clone https://github.com/Deanity/UKK-v2.git
   cd UKK-v2
   ```

2. **Jalankan Docker Compose**
   ```bash
   docker compose up -d --build
   ```
   *Perintah ini akan otomatis menginstal library frontend (npm), konfigurasi backend, dan import database.*

3. **Selesai!**
   Aplikasi siap diakses sesuai tabel [Akses URL](#-akses-url).

---

### Metode B: Instalasi Manual (Tanpa Docker)
Pastikan PHP (>= 8.1), MySQL, dan Node.js sudah terinstal.

#### 1. Persiapan Database
1. Buka **phpMyAdmin**.
2. Buat database baru dengan nama `db_ukk`.
3. Import file SQL: `backend/storage/storage.sql`.
4. Sesuaikan koneksi database di `backend/config/database.php`.
   > **Penting:** Ubah `$host = "db"` menjadi `$host = "localhost"` jika Anda tidak menggunakan Docker.

#### 2. Menjalankan Backend (PHP)
```bash
cd backend
# Jika menggunakan PHP CLI (Alternatif XAMPP)
php -S localhost:8000
```

#### 3. Menjalankan Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 Akses URL

| Layanan | URL | Keterangan |
|---------|-----|------------|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | UI Utama Aplikasi |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | Endpoint API |
| **Documentation** | [http://localhost:8000/docs.php](http://localhost:8000/docs.php) | Dokumentasi API (Swagger-like) |
| **phpMyAdmin** | [http://localhost:8090](http://localhost:8090) | Kelola Database (Khusus Docker) |

---

---

## 🔐 Akun Dummy

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Guru | `guru1` | `guru123` |
| BK | `bk1` | `bk123` |
| Siswa | `siswa1` | `siswa123` |

> ⚠️ Sesuaikan dengan data di database masing-masing.

---

## 📚 Dokumentasi Lengkap

| Bagian | File |
|--------|------|
| API Backend | [`backend/README.md`](./backend/README.md) |
| Frontend | [`frontend/README.md`](./frontend/README.md) |

---

## 👨‍🎓 Informasi Proyek

| | |
|-|-|
| **Jenis** | Tugas UKK (Ujian Kompetensi Keahlian) |
| **Sekolah** | SMK TI Bali Denpasar |
| **Stack** | React + Pure PHP |
| **Tahun** | 2026 |
