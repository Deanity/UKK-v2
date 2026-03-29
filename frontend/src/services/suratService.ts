import API from "./api";

export interface Surat {
    id: number;
    id_siswa: number;
    nama_siswa: string;
    nis_siswa: string;
    jenis_surat: string;
    nomor_surat: string;
    tanggal_surat: string;
    keterangan: string | null;
    created_by: string;
    created_at: string;
}

export interface SuratPayload {
    id_siswa: number;
    jenis_surat: string;
    nomor_surat: string;
    tanggal_surat: string;
    keterangan?: string;
    created_by?: string;
}

export const getSuratList = async (): Promise<Surat[]> => {
    const response = await API.get("/bk/surat");
    if (!response.data.status) throw new Error("Gagal mengambil data surat");
    return response.data.data;
};

export const getSuratById = async (id: number): Promise<Surat> => {
    const response = await API.get(`/bk/surat/${id}`);
    if (!response.data.status) throw new Error("Gagal mengambil data surat");
    return response.data.data;
};

export const createSurat = async (data: SuratPayload): Promise<any> => {
    const response = await API.post("/bk/surat", data);
    if (!response.data.status) throw new Error(response.data.message || "Gagal membuat surat");
    return response.data;
};

export const updateSurat = async (id: number, data: SuratPayload): Promise<any> => {
    const response = await API.put(`/bk/surat/${id}`, data);
    if (!response.data.status) throw new Error(response.data.message || "Gagal memperbarui surat");
    return response.data;
};

export const deleteSurat = async (id: number): Promise<any> => {
    const response = await API.delete(`/bk/surat/${id}`);
    if (!response.data.status) throw new Error(response.data.message || "Gagal menghapus surat");
    return response.data;
};
