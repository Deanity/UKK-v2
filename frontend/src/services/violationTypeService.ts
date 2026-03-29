import API from "./api";

// ─── Tipe data dari API ───────────────────────────────────────────
export interface ApiViolationType {
    id: number;
    kode_pelanggaran: string;
    nama_pelanggaran: string;
    sanksi_poin: number;
    deskripsi_sanksi: string | null;
}

// ─── Response wrappers ────────────────────────────────────────────
interface GetViolationTypesResponse {
    status: boolean;
    data: ApiViolationType[];
}

interface GetViolationTypeDetailResponse {
    status: boolean;
    data: ApiViolationType;
}

interface MutationResponse {
    status: boolean;
    message: string;
}

// ─── Payload Create ───────────────────────────────────────────────
export interface CreateViolationTypePayload {
    kode_pelanggaran: string;        // wajib, harus unik
    nama_pelanggaran: string;        // wajib
    sanksi_poin: number;             // wajib
    deskripsi_sanksi?: string;       // opsional
}

// ─── Payload Update ───────────────────────────────────────────────
// kode_pelanggaran TIDAK BISA diubah (sesuai dokumentasi API)
export interface UpdateViolationTypePayload {
    nama_pelanggaran: string;
    sanksi_poin: number;
    deskripsi_sanksi?: string;
}

// ─── GET All Jenis Pelanggaran ────────────────────────────────────
export const getAllJenisPelanggaran = async (): Promise<ApiViolationType[]> => {
    const response = await API.get<GetViolationTypesResponse>("/admin/jenis-pelanggaran");
    if (!response.data.status) throw new Error("Gagal mengambil data jenis pelanggaran");
    return response.data.data;
};

// ─── GET Detail Jenis Pelanggaran ─────────────────────────────────
export const getJenisPelanggaranDetail = async (id: number): Promise<ApiViolationType> => {
    const response = await API.get<GetViolationTypeDetailResponse>(`/admin/jenis-pelanggaran/${id}`);
    if (!response.data.status) throw new Error("Gagal mengambil detail jenis pelanggaran");
    return response.data.data;
};

// ─── POST Create Jenis Pelanggaran ───────────────────────────────
export const createJenisPelanggaran = async (payload: CreateViolationTypePayload): Promise<MutationResponse> => {
    const response = await API.post<MutationResponse>("/admin/jenis-pelanggaran", payload);
    return response.data;
};

// ─── PUT Update Jenis Pelanggaran ────────────────────────────────
export const updateJenisPelanggaran = async (id: number, payload: UpdateViolationTypePayload): Promise<MutationResponse> => {
    const response = await API.put<MutationResponse>(`/admin/jenis-pelanggaran/${id}`, payload);
    return response.data;
};

// ─── DELETE Jenis Pelanggaran (Soft Delete) ───────────────────────
export const deleteJenisPelanggaran = async (id: number): Promise<MutationResponse> => {
    const response = await API.delete<MutationResponse>(`/admin/jenis-pelanggaran/${id}`);
    return response.data;
};
