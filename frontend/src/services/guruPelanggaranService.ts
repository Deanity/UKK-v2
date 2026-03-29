import API from "./api";

// ─── Tipe Siswa (dari GET /api/admin/siswa/show) ──────────────────
export interface ApiSiswa {
    id: number;
    nama: string;
    username: string;
    nis: string;
    kelas: string;
    jurusan: string;
    jenis_kelamin: string;
    email: string;
    poin: number;
    total_poin: number;
}

// ─── Tipe Jenis Pelanggaran (dari GET /api/admin/jenis-pelanggaran) ─
export interface ApiJenisPelanggaran {
    id: number;
    kode_pelanggaran: string;
    nama_pelanggaran: string;
    sanksi_poin: number;
    deskripsi_sanksi: string | null;
}

// ─── Tipe Pelanggaran (dari GET /api/guru/pelanggaran) ────────────
export interface ApiPelanggaran {
    id: number;
    nama_siswa: string;
    nis: string;
    nama_pelanggaran: string;
    poin: number;
    keterangan: string;
    created_at: string;
}

// ─── Response wrappers ────────────────────────────────────────────
interface ListSiswaResponse {
    status: boolean;
    data: ApiSiswa[];
}

interface ListJenisResponse {
    status: boolean;
    data: ApiJenisPelanggaran[];
}

interface ListPelanggaranResponse {
    status: boolean;
    data: ApiPelanggaran[];
}

interface MutationResponse {
    status: boolean;
    message: string;
}

// ─── Payload POST /api/guru/pelanggaran ───────────────────────────
// Semua field WAJIB diisi (422 jika kosong)
export interface CreatePelanggaranPayload {
    id_siswa: number;
    id_jenis_pelanggaran: number;
    keterangan: string;
}

// ─── Payload PUT /api/guru/pelanggaran/{id} ───────────────────────
export interface UpdatePelanggaranPayload {
    id_jenis_pelanggaran: number;
    keterangan: string;
}

// ─── GET Daftar Siswa (untuk dropdown) ───────────────────────────
// Endpoint: GET /api/admin/siswa/show
export const getSiswaList = async (): Promise<ApiSiswa[]> => {
    const response = await API.get<ListSiswaResponse>("/admin/siswa/show");
    if (!response.data.status) throw new Error("Gagal mengambil data siswa");
    return response.data.data;
};

// ─── GET Daftar Jenis Pelanggaran (untuk dropdown) ───────────────
// Endpoint: GET /api/admin/jenis-pelanggaran
export const getJenisPelanggaranList = async (): Promise<ApiJenisPelanggaran[]> => {
    const response = await API.get<ListJenisResponse>("/admin/jenis-pelanggaran");
    if (!response.data.status) throw new Error("Gagal mengambil data jenis pelanggaran");
    return response.data.data;
};

// ─── GET Daftar Pelanggaran ───────────────────────────────────────
// Endpoint: GET /api/guru/pelanggaran
export const getPelanggaranList = async (): Promise<ApiPelanggaran[]> => {
    const response = await API.get<ListPelanggaranResponse>("/guru/pelanggaran");
    if (!response.data.status) throw new Error("Gagal mengambil data pelanggaran");
    return response.data.data;
};

// ─── POST Catat Pelanggaran ───────────────────────────────────────
// Endpoint: POST /api/guru/pelanggaran
// Poin otomatis diambil dari jenis_pelanggaran, tidak perlu dikirim manual
// Field keterangan WAJIB (tidak boleh string kosong)
export const createPelanggaran = async (
    payload: CreatePelanggaranPayload
): Promise<MutationResponse> => {
    const response = await API.post<MutationResponse>("/guru/pelanggaran", payload);
    return response.data;
};

// ─── PUT Update Pelanggaran ───────────────────────────────────────
// Endpoint: PUT /api/guru/pelanggaran/{id}
// Setelah update, poin siswa otomatis dihitung ulang oleh backend
export const updatePelanggaran = async (
    id: number,
    payload: UpdatePelanggaranPayload
): Promise<MutationResponse> => {
    const response = await API.put<MutationResponse>(`/guru/pelanggaran/${id}`, payload);
    return response.data;
};

// ─── DELETE Pelanggaran (Soft Delete) ────────────────────────────
// Endpoint: DELETE /api/guru/pelanggaran/{id}
// Setelah hapus, poin siswa otomatis dihitung ulang oleh backend
export const deletePelanggaran = async (id: number): Promise<MutationResponse> => {
    const response = await API.delete<MutationResponse>(`/guru/pelanggaran/${id}`);
    return response.data;
};
