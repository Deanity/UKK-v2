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

## ⚙️ Cara Menjalankan

### 1. Backend (PHP)

Pastikan PHP dan MySQL sudah berjalan (bisa via XAMPP / Laragon).

```bash
cd backend
php -S localhost:8000
```

> Lakukan juga import database SQL ke MySQL terlebih dahulu.

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Aplikasi tersedia di: **http://localhost:5173**

---

## 🔐 Akun Default (Contoh)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin01` | `rahasia123` |
| Guru | `guru01` | `rahasia123` |
| BK | `bk01` | `rahasia123` |
| Siswa | `andi05` | `rahasia123` |

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
