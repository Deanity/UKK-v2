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

## 🗄️ Database Schema

Gunakan query di bawah ini untuk membuat struktur database dan data login default:

```sql
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Struktur Tabel
CREATE TABLE `guru` (
  `id` int NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `kode_guru` varchar(20) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','guru','bk') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `siswa` (
  `id` int NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `nis` int NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `jurusan` varchar(50) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `alamat` varchar(255) NOT NULL,
  `no_telp` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `poin` int NOT NULL DEFAULT '0',
  `total_poin` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Dummy untuk Login
INSERT INTO `guru` (`id`, `username`, `password`, `nama`, `kode_guru`, `jenis_kelamin`, `email`, `role`) VALUES
(1, 'admin', '$2y$10$QchxcBg.etuUEM9f3Ji0Pupkb2K.Cra9iMX.5PPtNLptFcTF88/pW', 'Pak Budi', 'ADM001', 'L', 'budi@guru.id', 'admin'),
(2, 'guru1', '$2y$10$qIUwwoCRz7o4cb6UAKlnHOYJz5U90GgdFrImjTSYM6VF5cGaLm0LK', 'Pak Yoga', 'GR001', 'L', 'yoga@guru.id', 'guru'),
(3, 'bk1', '$2y$10$.4H2EkWR08Lgw6Onh.tQ2.D7lByXD2IqE2p1Nh3Z3tsvuHctxL9S.', 'Ibu Yeni', 'BK001', 'P', 'yeni@guru.id', 'bk');

INSERT INTO `siswa` (`id`, `username`, `password`, `nama`, `nis`, `kelas`, `jurusan`, `jenis_kelamin`, `alamat`, `no_telp`, `email`) VALUES
(1, 'siswa1', '$2y$10$nt5vDvRRadmmScmF4fM/1OYuMGp7YxLnY2aVfWA9SYFiRDHymMTi.', 'Anindhity', 6672, 'X', 'RPL', 'P', 'Denpasar', '0987654321', 'anin@gmail.com');

-- Tabel Lainnya (Struktur Saja)
CREATE TABLE `jenis_pelanggaran` (
  `id` int NOT NULL,
  `kode_pelanggaran` varchar(20),
  `nama_pelanggaran` varchar(100),
  `sanksi_poin` int,
  `deskripsi_sanksi` varchar(255),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `orang_tua` (
  `id` int NOT NULL,
  `id_siswa` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `hubungan` enum('ayah','ibu') NOT NULL,
  `telp` varchar(20),
  `pekerjaan` varchar(100),
  `alamat` varchar(255),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pelanggaran` (
  `id` int NOT NULL,
  `id_jenis_pelanggaran` int,
  `id_siswa` int,
  `poin` int,
  `keterangan` varchar(255),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `surat` (
  `id` int NOT NULL,
  `jenis_surat` varchar(50),
  `nomor_surat` varchar(50),
  `tanggal_surat` date,
  `id_siswa` int,
  `keterangan` varchar(255),
  `created_by` varchar(100),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `laporan` (
  `id` int NOT NULL,
  `jenis_laporan` varchar(50),
  `id_surat` int,
  `keterangan` varchar(255),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Primary Keys & Constraints
ALTER TABLE `guru` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `username` (`username`);
ALTER TABLE `siswa` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `username` (`username`);
ALTER TABLE `jenis_pelanggaran` ADD PRIMARY KEY (`id`);
ALTER TABLE `orang_tua` ADD PRIMARY KEY (`id`), ADD KEY `fk_orangtua_siswa` (`id_siswa`);
ALTER TABLE `pelanggaran` ADD PRIMARY KEY (`id`), ADD KEY `fk_pelanggaran_siswa` (`id_siswa`);
ALTER TABLE `surat` ADD PRIMARY KEY (`id`), ADD KEY `fk_surat_siswa` (`id_siswa`);
ALTER TABLE `laporan` ADD PRIMARY KEY (`id`), ADD KEY `fk_laporan_surat` (`id_surat`);

-- Auto Increment
ALTER TABLE `guru` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `siswa` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `jenis_pelanggaran` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `orang_tua` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `pelanggaran` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `surat` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `laporan` MODIFY `id` int NOT NULL AUTO_INCREMENT;

-- Foreign Keys
ALTER TABLE `orang_tua` ADD CONSTRAINT `fk_orangtua_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`);
ALTER TABLE `pelanggaran` ADD CONSTRAINT `fk_pelanggaran_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`);
ALTER TABLE `surat` ADD CONSTRAINT `fk_surat_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`);
ALTER TABLE `laporan` ADD CONSTRAINT `fk_laporan_surat` FOREIGN KEY (`id_surat`) REFERENCES `surat` (`id`);

COMMIT;
```

---

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
