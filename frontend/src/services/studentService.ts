import API from "./api";

// ─── Tipe data dari API ───────────────────────────────────────────
export interface ApiStudent {
    id: number;
    nama: string;
    username: string;
    nis: number;
    kelas: string;
    jurusan: string;
    jenis_kelamin: string;
    email: string;
    poin: number;
    total_poin: number;
}

export interface GetStudentsResponse {
    status: boolean;
    data: ApiStudent[];
}

// ─── Tentukan status berdasarkan total_poin ────────────────────────
export type StudentStatus = "safe" | "warning" | "critical";

export function resolveStatus(totalPoin: number): StudentStatus {
    if (totalPoin >= 75) return "critical";
    if (totalPoin >= 30) return "warning";
    return "safe";
}

// ─── GET All Siswa ─────────────────────────────────────────────────
export const getAllSiswa = async (): Promise<ApiStudent[]> => {
    const response = await API.get<GetStudentsResponse>("/admin/siswa/show");
    if (!response.data.status) throw new Error("Gagal mengambil data siswa");
    return response.data.data;
};

// ─── Tipe Detail Siswa (termasuk orang tua) ───────────────────────
export interface OrangTuaDetail {
    id?: number;
    nama: string;
    hubungan: string;
    telp: string;
    pekerjaan: string;
    alamat: string;
}

export interface ApiStudentDetail {
    id: number;
    username: string;
    nama: string;
    nis: string | number;
    kelas: string;
    jurusan: string;
    jenis_kelamin: string;
    alamat: string;
    no_telp: string;
    email: string;
    poin: number;
    total_poin: number;
    orang_tua: OrangTuaDetail[];
}

export interface GetStudentDetailResponse {
    status: boolean;
    data: ApiStudentDetail;
}

// ─── GET Detail Siswa (dengan orang tua) ──────────────────────────
export const getSiswaDetail = async (id: number): Promise<ApiStudentDetail> => {
    const response = await API.get<GetStudentDetailResponse>(`/admin/siswa/${id}`);
    if (!response.data.status) throw new Error("Gagal mengambil detail siswa");
    return response.data.data;
};

// ─── Tipe untuk Create Siswa ────────────────────────────────────────
export interface OrangTuaPayload {
    nama: string;
    hubungan: string;
    telp: string;
    pekerjaan: string;
    alamat: string;
}

export interface CreateSiswaPayload {
    siswa: {
        username: string;
        password: string;
        nama: string;
        nis: string;
        kelas: string;
        jurusan: string;
        jenis_kelamin: string;
        alamat: string;
        no_telp: string;
        email: string;
    };
    orang_tua: OrangTuaPayload[];
}

export interface CreateSiswaResponse {
    status: boolean;
    message: string;
}

// ─── POST Create Siswa ──────────────────────────────────────────────
export const createSiswa = async (payload: CreateSiswaPayload): Promise<CreateSiswaResponse> => {
    const response = await API.post<CreateSiswaResponse>("/admin/siswa/create", payload);
    return response.data;
};

// ─── Tipe untuk Update Siswa ─────────────────────────────────────────
export interface UpdateSiswaPayload {
    username: string;
    nama: string;
    nis: string | number;
    kelas: string;
    jurusan: string;
    jenis_kelamin: string;
    alamat: string;
    no_telp: string;
    email: string;
    poin?: number;
    total_poin?: number;
    orang_tua: OrangTuaPayload[];
}

export interface UpdateSiswaResponse {
    status: boolean;
    message: string;
}

// ─── PUT Update Siswa ─────────────────────────────────────────────────
export const updateSiswa = async (id: number, payload: UpdateSiswaPayload): Promise<UpdateSiswaResponse> => {
    const response = await API.put<UpdateSiswaResponse>(`/admin/siswa/${id}`, payload);
    return response.data;
};

// ─── DELETE Siswa ─────────────────────────────────────────────────────
export interface DeleteSiswaResponse {
    status: boolean;
    message: string;
}

export const deleteSiswa = async (id: number): Promise<DeleteSiswaResponse> => {
    const response = await API.delete<DeleteSiswaResponse>(`/admin/siswa/${id}`);
    return response.data;
};
