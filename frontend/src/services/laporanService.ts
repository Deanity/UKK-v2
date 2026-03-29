import API from "./api";

export interface Laporan {
    id: number;
    id_surat: number;
    id_siswa: number;
    nama_siswa: string;
    jenis_laporan: string;
    nomor_surat: string;
    jenis_surat: string;
    tanggal_surat: string;
    keterangan: string;
    created_at: string;
}

export interface LaporanPayload {
    id_surat: number;
    jenis_laporan: string;
    keterangan: string;
}

export const getLaporanList = async (): Promise<Laporan[]> => {
    const response = await API.get("/bk/laporan");
    if (!response.data.status) throw new Error("Gagal mengambil data laporan");
    return response.data.data;
};

export const getLaporanById = async (id: number): Promise<Laporan> => {
    const response = await API.get(`/bk/laporan/${id}`);
    if (!response.data.status) throw new Error("Gagal mengambil data laporan");
    return response.data.data;
};

export const createLaporan = async (data: LaporanPayload): Promise<any> => {
    const response = await API.post("/bk/laporan", data);
    if (!response.data.status) throw new Error(response.data.message || "Gagal membuat laporan");
    return response.data;
};

export const updateLaporan = async (id: number, data: LaporanPayload): Promise<any> => {
    const response = await API.put(`/bk/laporan/${id}`, data);
    if (!response.data.status) throw new Error(response.data.message || "Gagal memperbarui laporan");
    return response.data;
};

export const deleteLaporan = async (id: number): Promise<any> => {
    const response = await API.delete(`/bk/laporan/${id}`);
    if (!response.data.status) throw new Error(response.data.message || "Gagal menghapus laporan");
    return response.data;
};
