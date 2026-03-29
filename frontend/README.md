# 🖥️ Frontend Documentation — Sistem Poin Pelanggaran Siswa

Frontend dibangun menggunakan **React + TypeScript + Vite**, dengan UI dari **shadcn/ui** dan **Tailwind CSS**.

---

## 🗂️ Struktur Folder

```
frontend/
├── public/                         # Aset statis (favicon, dll.)
├── src/
│   ├── components/
│   │   ├── ui/                     # Komponen shadcn/ui (Button, Dialog, dll.)
│   │   ├── AppSidebar.tsx          # Sidebar navigasi (berubah sesuai role)
│   │   ├── ConfirmDialog.tsx       # Dialog konfirmasi hapus
│   │   ├── EmptyState.tsx          # Tampilan kosong saat data tidak ada
│   │   ├── Layout.tsx              # Wrapper layout + header + guard auth
│   │   ├── NavLink.tsx             # NavLink dengan active state
│   │   ├── StatCard.tsx            # Kartu statistik dashboard
│   │   └── StatusBadge.tsx         # Badge status / poin
│   ├── contexts/
│   │   └── AuthContext.tsx         # Context autentikasi global (JWT + localStorage)
│   ├── pages/
│   │   ├── Login.tsx               # Halaman login
│   │   ├── Dashboard.tsx           # Dashboard (semua role)
│   │   ├── NotFound.tsx            # Halaman 404
│   │   ├── admin/
│   │   │   ├── Students.tsx        # CRUD Siswa + Orang Tua
│   │   │   ├── Teachers.tsx        # CRUD Guru
│   │   │   ├── ViolationTypes.tsx  # CRUD Jenis Pelanggaran
│   │   │   └── Letters.tsx         # Template Surat (admin)
│   │   ├── bk/
│   │   │   ├── Violations.tsx      # Lihat & kelola pelanggaran
│   │   │   └── Letters.tsx         # Cetak surat (BK)
│   │   ├── guru/
│   │   │   └── InputViolation.tsx  # Input pelanggaran siswa
│   │   └── siswa/
│   │       └── Profile.tsx         # Profil & riwayat pelanggaran siswa
│   ├── services/
│   │   ├── api.ts                  # Axios instance + interceptor token
│   │   ├── authService.ts          # Fungsi login + tipe ApiUser
│   │   └── studentService.ts       # Service CRUD siswa & orang tua
│   ├── App.tsx                     # Root component + routing
│   └── main.tsx                    # Entry point React
├── index.html
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## 🛠️ Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|---------|
| React | 18.x | UI Library |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | — | Komponen UI siap pakai (Radix UI) |
| TanStack Query | 5.x | Server state management |
| Axios | 1.x | HTTP client |
| React Router DOM | 6.x | Routing client-side |
| React Hook Form | 7.x | Manajemen form |
| Zod | 3.x | Validasi schema form |
| Lucide React | — | Icon library |
| Sonner | — | Toast notification |
| Recharts | 2.x | Chart / grafik |

---

## 🚀 Menjalankan Aplikasi

### Prasyarat
- Node.js ≥ 18
- Backend PHP berjalan di `http://localhost:8000`

### Instalasi & Jalankan

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Aplikasi berjalan di: **http://localhost:5173**

### Perintah Lain

```bash
npm run build        # Build production
npm run preview      # Preview hasil build
npm run lint         # Lint dengan ESLint
npm run test         # Jalankan unit test (vitest)
npm run test:watch   # Test mode watch
```

---

## 🔐 Autentikasi

Autentikasi menggunakan **JWT Bearer Token** yang disimpan di `localStorage`.

### Alur Login
1. User mengisi form login → dikirim ke `POST /api/login`
2. Jika berhasil, **token** dan **data user** disimpan ke `localStorage`
3. `AuthContext` menyediakan state `user`, `isAuthenticated`, `login()`, `logout()` ke seluruh aplikasi
4. Setiap request API otomatis menyertakan token via **Axios interceptor**
5. `Layout.tsx` berfungsi sebagai **route guard** — redirect ke `/login` jika belum autentikasi

### Lokasi Storage

| Key | Nilai |
|-----|-------|
| `token` | JWT Bearer Token |
| `user` | JSON string data user (id, nama, username, email, role, type) |

---

## 🗺️ Routing & Hak Akses

| Route | Komponen | Role yang Bisa Akses |
|-------|----------|---------------------|
| `/login` | `Login.tsx` | Publik |
| `/dashboard` | `Dashboard.tsx` | Semua role |
| `/admin/students` | `admin/Students.tsx` | `admin` |
| `/admin/teachers` | `admin/Teachers.tsx` | `admin` |
| `/admin/violation-types` | `admin/ViolationTypes.tsx` | `admin` |
| `/admin/letters` | `admin/Letters.tsx` | `admin` |
| `/bk/violations` | `bk/Violations.tsx` | `bk` |
| `/bk/letters` | `bk/Letters.tsx` | `bk` |
| `/guru/input` | `guru/InputViolation.tsx` | `guru` |
| `/siswa/profile` | `siswa/Profile.tsx` | `siswa` |

---

## 🧭 Navigasi Sidebar per Role

Sidebar (`AppSidebar.tsx`) secara otomatis menampilkan menu sesuai role user yang sedang login:

| Role | Menu yang Tampil |
|------|-----------------|
| `admin` | Dashboard, Data Siswa, Data Guru, Jenis Pelanggaran, Template Surat |
| `bk` | Dashboard, Pelanggaran Siswa, Cetak Surat |
| `guru` | Input Pelanggaran |
| `siswa` | Profil Saya |

---

## 📡 Services (API Layer)

### `src/services/api.ts`

Axios instance terpusat dengan `baseURL` dan request interceptor:

```typescript
const API = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Otomatis sisipkan Bearer Token ke setiap request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### `src/services/authService.ts`

```typescript
// Login
loginRequest(username: string, password: string): Promise<LoginResponse>
```

### `src/services/studentService.ts`

| Fungsi | Method | Endpoint |
|--------|--------|---------|
| `getAllSiswa()` | GET | `/admin/siswa/show` |
| `getSiswaById(id)` | GET | `/admin/siswa/{id}` |
| `createSiswa(data)` | POST | `/admin/siswa/create` |
| `updateSiswa(id, data)` | PUT | `/admin/siswa/{id}` |
| `deleteSiswa(id)` | DELETE | `/admin/siswa/{id}` |
| `getOrangTua(siswaId)` | GET | `/admin/siswa/{id}/orangtua` |

---

## 📄 Halaman per Fitur

### 👤 Admin — Data Siswa (`/admin/students`)
- Tabel daftar siswa dengan kolom: Nama, NIS, Kelas, Jurusan, Jenis Kelamin, Poin
- **Tambah siswa**: Form lengkap siswa + minimal 1 data orang tua (ayah/ibu)
- **Edit siswa**: Update data siswa + data orang tua sekaligus
- **Hapus siswa**: Soft delete dengan konfirmasi dialog
- Filter/search berdasarkan nama, NIS, kelas, jurusan

### 👨‍🏫 Admin — Data Guru (`/admin/teachers`)
- CRUD guru dengan field: Nama, Kode Guru, Username, Email, Jenis Kelamin, Role
- Role guru bisa: `guru`, `bk`, `admin`

### 📋 Admin — Jenis Pelanggaran (`/admin/violation-types`)
- CRUD jenis pelanggaran: Kode, Nama, Sanksi Poin, Deskripsi

### 📝 Admin / BK — Surat (`/admin/letters`, `/bk/letters`)
- Kelola & cetak template surat peringatan siswa

### 🚨 BK — Pelanggaran Siswa (`/bk/violations`)
- Lihat daftar semua pelanggaran siswa
- Tambah, edit, hapus catatan pelanggaran
- Poin siswa otomatis dihitung ulang oleh backend

### ✏️ Guru — Input Pelanggaran (`/guru/input`)
- Form input pelanggaran: pilih siswa, pilih jenis pelanggaran, tambah keterangan

### 👦 Siswa — Profil (`/siswa/profile`)
- Lihat data profil diri sendiri
- Lihat poin aktif, total poin, dan riwayat pelanggaran

---

## ⚙️ Konfigurasi

### Ganti URL Backend

Edit file `src/services/api.ts`:

```typescript
baseURL: "http://localhost:8000/api"  // ← Ganti sesuai URL backend
```

### Environment Variable (Opsional)

Buat file `.env` di root `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Lalu di `api.ts`:
```typescript
baseURL: import.meta.env.VITE_API_BASE_URL
```

---

## 🧪 Testing

Unit test menggunakan **Vitest** + **@testing-library/react**.

```bash
npm run test         # Jalankan semua test sekali
npm run test:watch   # Mode watch (auto re-run saat ada perubahan)
```

Test files tersimpan di `src/test/`.

---

## ⚠️ Catatan

- Redirect otomatis ke `/login` jika token tidak ada atau tidak valid
- Token JWT di-decode secara manual (tanpa library) di `AuthContext` untuk validasi payload
- Semua penghapusan data adalah **soft delete** (mengikuti behaviour backend)
- Sidebar menu menyesuaikan role secara otomatis saat login
