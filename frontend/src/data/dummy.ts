export type Role = "admin" | "guru" | "bk" | "siswa";

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  kelas: string;
  jurusan: string;
  tahunMasuk: number;
  totalPoints: number;
  status: "safe" | "warning" | "critical";
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  mapel: string;
  jabatan: string;
}

export interface ViolationType {
  id: string;
  code: string;
  name: string;
  category: string;
  points: number;
}

export interface Violation {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  violationTypeId: string;
  violationName: string;
  points: number;
  date: string;
  reportedBy: string;
  notes?: string;
}

export interface LetterTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
}

export const dummyUsers: User[] = [
  { id: "u1", username: "admin", name: "Administrator", role: "admin" },
  { id: "u2", username: "guru", name: "Pak Budi Santoso", role: "guru" },
  { id: "u3", username: "bk", name: "Ibu Sri Wahyuni", role: "bk" },
  { id: "u4", username: "siswa", name: "Ahmad Fadillah", role: "siswa" },
];

export const dummyStudents: Student[] = [
  { id: "s1", nis: "2024001", name: "Ahmad Fadillah", kelas: "XII", jurusan: "IPA 1", tahunMasuk: 2022, totalPoints: 15, status: "safe" },
  { id: "s2", nis: "2024002", name: "Siti Nurhaliza", kelas: "XII", jurusan: "IPA 2", tahunMasuk: 2022, totalPoints: 45, status: "warning" },
  { id: "s3", nis: "2024003", name: "Budi Prasetyo", kelas: "XI", jurusan: "IPS 1", tahunMasuk: 2023, totalPoints: 85, status: "critical" },
  { id: "s4", nis: "2024004", name: "Dewi Lestari", kelas: "XI", jurusan: "IPA 1", tahunMasuk: 2023, totalPoints: 5, status: "safe" },
  { id: "s5", nis: "2024005", name: "Rizky Maulana", kelas: "X", jurusan: "IPS 2", tahunMasuk: 2024, totalPoints: 60, status: "warning" },
  { id: "s6", nis: "2024006", name: "Putri Amelia", kelas: "X", jurusan: "IPA 3", tahunMasuk: 2024, totalPoints: 0, status: "safe" },
  { id: "s7", nis: "2024007", name: "Fajar Nugroho", kelas: "XII", jurusan: "IPS 1", tahunMasuk: 2022, totalPoints: 95, status: "critical" },
  { id: "s8", nis: "2024008", name: "Anisa Rahma", kelas: "XI", jurusan: "IPA 2", tahunMasuk: 2023, totalPoints: 20, status: "safe" },
];

export const dummyTeachers: Teacher[] = [
  { id: "t1", nip: "198501012010", name: "Budi Santoso", mapel: "Matematika", jabatan: "Guru" },
  { id: "t2", nip: "198702152011", name: "Sri Wahyuni", mapel: "BK", jabatan: "Guru BK" },
  { id: "t3", nip: "199003202012", name: "Agus Hermawan", mapel: "Fisika", jabatan: "Wali Kelas" },
  { id: "t4", nip: "198804102013", name: "Rina Marlina", mapel: "Bahasa Indonesia", jabatan: "Guru" },
  { id: "t5", nip: "199106052014", name: "Dedi Kurniawan", mapel: "Bahasa Inggris", jabatan: "Guru" },
];

export const dummyViolationTypes: ViolationType[] = [
  { id: "vt1", code: "A01", name: "Terlambat Masuk Sekolah", category: "Kedisiplinan", points: 5 },
  { id: "vt2", code: "A02", name: "Tidak Memakai Seragam", category: "Kedisiplinan", points: 10 },
  { id: "vt3", code: "B01", name: "Berkelahi", category: "Kekerasan", points: 30 },
  { id: "vt4", code: "B02", name: "Bullying", category: "Kekerasan", points: 25 },
  { id: "vt5", code: "C01", name: "Merokok di Sekolah", category: "Narkoba & Zat", points: 40 },
  { id: "vt6", code: "A03", name: "Bolos Pelajaran", category: "Kedisiplinan", points: 15 },
  { id: "vt7", code: "A04", name: "Gadget di Kelas", category: "Kedisiplinan", points: 10 },
  { id: "vt8", code: "D01", name: "Merusak Fasilitas", category: "Vandalisme", points: 20 },
];

export const dummyViolations: Violation[] = [
  { id: "v1", studentId: "s1", studentName: "Ahmad Fadillah", studentClass: "XII IPA 1", violationTypeId: "vt1", violationName: "Terlambat Masuk Sekolah", points: 5, date: "2025-01-15", reportedBy: "Budi Santoso", notes: "Terlambat 15 menit" },
  { id: "v2", studentId: "s1", studentName: "Ahmad Fadillah", studentClass: "XII IPA 1", violationTypeId: "vt7", violationName: "Gadget di Kelas", points: 10, date: "2025-02-03", reportedBy: "Rina Marlina" },
  { id: "v3", studentId: "s2", studentName: "Siti Nurhaliza", studentClass: "XII IPA 2", violationTypeId: "vt2", violationName: "Tidak Memakai Seragam", points: 10, date: "2025-01-20", reportedBy: "Agus Hermawan" },
  { id: "v4", studentId: "s2", studentName: "Siti Nurhaliza", studentClass: "XII IPA 2", violationTypeId: "vt6", violationName: "Bolos Pelajaran", points: 15, date: "2025-02-10", reportedBy: "Dedi Kurniawan" },
  { id: "v5", studentId: "s2", studentName: "Siti Nurhaliza", studentClass: "XII IPA 2", violationTypeId: "vt8", violationName: "Merusak Fasilitas", points: 20, date: "2025-03-01", reportedBy: "Budi Santoso" },
  { id: "v6", studentId: "s3", studentName: "Budi Prasetyo", studentClass: "XI IPS 1", violationTypeId: "vt3", violationName: "Berkelahi", points: 30, date: "2025-01-10", reportedBy: "Sri Wahyuni" },
  { id: "v7", studentId: "s3", studentName: "Budi Prasetyo", studentClass: "XI IPS 1", violationTypeId: "vt5", violationName: "Merokok di Sekolah", points: 40, date: "2025-02-20", reportedBy: "Agus Hermawan" },
  { id: "v8", studentId: "s3", studentName: "Budi Prasetyo", studentClass: "XI IPS 1", violationTypeId: "vt6", violationName: "Bolos Pelajaran", points: 15, date: "2025-03-05", reportedBy: "Rina Marlina" },
  { id: "v9", studentId: "s5", studentName: "Rizky Maulana", studentClass: "X IPS 2", violationTypeId: "vt4", violationName: "Bullying", points: 25, date: "2025-02-14", reportedBy: "Sri Wahyuni" },
  { id: "v10", studentId: "s5", studentName: "Rizky Maulana", studentClass: "X IPS 2", violationTypeId: "vt3", violationName: "Berkelahi", points: 30, date: "2025-03-10", reportedBy: "Budi Santoso" },
  { id: "v11", studentId: "s7", studentName: "Fajar Nugroho", studentClass: "XII IPS 1", violationTypeId: "vt5", violationName: "Merokok di Sekolah", points: 40, date: "2025-01-25", reportedBy: "Agus Hermawan" },
  { id: "v12", studentId: "s7", studentName: "Fajar Nugroho", studentClass: "XII IPS 1", violationTypeId: "vt3", violationName: "Berkelahi", points: 30, date: "2025-02-28", reportedBy: "Dedi Kurniawan" },
  { id: "v13", studentId: "s7", studentName: "Fajar Nugroho", studentClass: "XII IPS 1", violationTypeId: "vt4", violationName: "Bullying", points: 25, date: "2025-03-15", reportedBy: "Sri Wahyuni" },
  { id: "v14", studentId: "s4", studentName: "Dewi Lestari", studentClass: "XI IPA 1", violationTypeId: "vt1", violationName: "Terlambat Masuk Sekolah", points: 5, date: "2025-03-01", reportedBy: "Budi Santoso" },
  { id: "v15", studentId: "s8", studentName: "Anisa Rahma", studentClass: "XI IPA 2", violationTypeId: "vt2", violationName: "Tidak Memakai Seragam", points: 10, date: "2025-02-05", reportedBy: "Rina Marlina" },
  { id: "v16", studentId: "s8", studentName: "Anisa Rahma", studentClass: "XI IPA 2", violationTypeId: "vt7", violationName: "Gadget di Kelas", points: 10, date: "2025-03-12", reportedBy: "Dedi Kurniawan" },
];

export const dummyLetterTemplates: LetterTemplate[] = [
  { id: "lt1", name: "Surat Panggilan Orang Tua", type: "Panggilan", content: "Dengan hormat, kami mengundang Bapak/Ibu..." },
  // { id: "lt2", name: "Surat Peringatan 1", type: "Peringatan", content: "Surat peringatan pertama atas pelanggaran..." },
  // { id: "lt3", name: "Surat Peringatan 2", type: "Peringatan", content: "Surat peringatan kedua atas pelanggaran..." },
  // { id: "lt4", name: "Surat Skorsing", type: "Skorsing", content: "Berdasarkan keputusan rapat dewan guru..." },
  { id: "lt5", name: "Surat Permohonan Berhenti", type: "Pemberhentian", content: "Mundur karena telah mencapat batas poin pelanggaran." },
  { id: "lt6", name: "Surat Pernyataan Orang Tua", type: "Pernyataan", content: "Menyatakan memang benar sanggup membina anak kami untuk lebih disiplin mengikuti proses pembelajaran dan mengikuti Tata Tertib Sekolah." },
  { id: "lt7", name: "Surat Pernyataan Siswa", type: "Pernyataan", content: "Menyatakan dan berjanji akan bersungguh-sungguh berubah dan bersedia mentaati aturan dan tata tertib sekolah." },
];

export const getStatusColor = (status: Student["status"]) => {
  switch (status) {
    case "safe": return "success";
    case "warning": return "warning";
    case "critical": return "destructive";
  }
};

export const getStatusLabel = (status: Student["status"]) => {
  switch (status) {
    case "safe": return "Aman";
    case "warning": return "Peringatan";
    case "critical": return "Kritis";
  }
};
