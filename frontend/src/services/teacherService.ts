import API from "./api";

// ─── Tipe data dari API ───────────────────────────────────────────
export interface ApiTeacher {
    id: number;
    nama: string;
    username: string;
    kode_guru: string;
    jenis_kelamin: string;
    email: string;
    role: string;
}

export interface ApiTeacherDetail extends ApiTeacher {
    // GET /api/admin/guru/{id} mengembalikan semua kolom
    alamat?: string;
    no_telp?: string;
}

// ─── Response wrappers ────────────────────────────────────────────
interface GetTeachersResponse {
    status: boolean;
    data: ApiTeacher[];
}

interface GetTeacherDetailResponse {
    status: boolean;
    data: ApiTeacherDetail;
}

interface MutationResponse {
    status: boolean;
    message: string;
}

// ─── Tipe payload Create ──────────────────────────────────────────
export interface CreateTeacherPayload {
    username: string;
    password: string;
    nama: string;
    kode_guru: string;
    jenis_kelamin: string;
    email: string;
    role: string;
}

// ─── Tipe payload Update ──────────────────────────────────────────
// username & password TIDAK bisa diubah via PUT (sesuai dokumentasi)
export interface UpdateTeacherPayload {
    nama: string;
    kode_guru: string;
    jenis_kelamin: string;
    email: string;
    role: string;
}

// ─── GET All Guru ─────────────────────────────────────────────────
export const getAllGuru = async (): Promise<ApiTeacher[]> => {
    const response = await API.get<GetTeachersResponse>("/admin/guru");
    if (!response.data.status) throw new Error("Gagal mengambil data guru");
    return response.data.data;
};

// ─── GET Detail Guru ──────────────────────────────────────────────
export const getGuruDetail = async (id: number): Promise<ApiTeacherDetail> => {
    const response = await API.get<GetTeacherDetailResponse>(`/admin/guru/${id}`);
    if (!response.data.status) throw new Error("Gagal mengambil detail guru");
    return response.data.data;
};

// ─── POST Create Guru ─────────────────────────────────────────────
export const createGuru = async (payload: CreateTeacherPayload): Promise<MutationResponse> => {
    const response = await API.post<MutationResponse>("/admin/guru", payload);
    return response.data;
};

// ─── PUT Update Guru ──────────────────────────────────────────────
export const updateGuru = async (id: number, payload: UpdateTeacherPayload): Promise<MutationResponse> => {
    const response = await API.put<MutationResponse>(`/admin/guru/${id}`, payload);
    return response.data;
};

// ─── DELETE Guru ──────────────────────────────────────────────────
export const deleteGuru = async (id: number): Promise<MutationResponse> => {
    const response = await API.delete<MutationResponse>(`/admin/guru/${id}`);
    return response.data;
};
