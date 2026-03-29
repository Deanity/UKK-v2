import API from "./api";

// ─── Response GET /api/me (siswa) ─────────────────────────────────
export interface ApiOrangTua {
    nama: string;
    hubungan: string;
    telp: string;
    pekerjaan: string;
    alamat: string;
}

export interface ApiSiswaProfile {
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
    orang_tua: ApiOrangTua[] | null;
}

interface MeResponse {
    status: boolean;
    user: ApiSiswaProfile;
}

// ─── GET /api/me — Profil siswa yang sedang login ─────────────────
export const getMyProfile = async (): Promise<ApiSiswaProfile> => {
    const response = await API.get<MeResponse>("/me");
    if (!response.data.status) throw new Error("Gagal mengambil profil");
    return response.data.user;
};

// ─── Helper: hitung status dari total_poin ─────────────────────────
export type PointStatus = "safe" | "warning" | "danger" | "critical";

export function getPointStatus(total_poin: number): PointStatus {
    if (total_poin >= 100) return "critical";
    if (total_poin >= 75) return "danger";
    if (total_poin >= 25) return "warning";
    return "safe";
}

export const STATUS_LABEL: Record<PointStatus, string> = {
    safe: "Aman",
    warning: "Peringatan 1",
    danger: "Peringatan 2",
    critical: "Non-Aktif",
};

export const STATUS_CLASS: Record<PointStatus, string> = {
    safe: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-orange-600 dark:text-orange-400",
    critical: "text-destructive",
};
