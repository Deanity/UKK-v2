import API from './api';

export interface DashboardStats {
    total_siswa: number;
    total_pelanggaran: number;
    total_guru: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await API.get<{ status: boolean; data: DashboardStats }>('/dashboard');
    return response.data.data;
};

export interface PelanggaranBulanStat {
    bulan: string;
    total: number;
}

export const getPelanggaranPerBulan = async (): Promise<PelanggaranBulanStat[]> => {
    const response = await API.get<{ status: boolean; data: PelanggaranBulanStat[] }>('/dashboard/chart');
    return response.data.data;
};

export interface Pelanggaran {
    id: number;
    nama_siswa: string;
    nis: string;
    nama_pelanggaran: string;
    poin: number;
    keterangan: string;
    created_at: string;
}

export const getPelanggaranTerbaru = async (): Promise<Pelanggaran[]> => {
    const response = await API.get<{ status: boolean; data: Pelanggaran[] }>('/guru/pelanggaran');
    return response.data.data;
};
