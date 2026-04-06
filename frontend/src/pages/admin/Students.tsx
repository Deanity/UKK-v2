import { useState, useEffect } from "react";
import {
  getAllSiswa,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  getSiswaDetail,
  ApiStudent,
  ApiStudentDetail,
  resolveStatus,
  CreateSiswaPayload,
  UpdateSiswaPayload,
  OrangTuaPayload,
} from "@/services/studentService";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Search,
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  UserPlus,
  Pencil,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Default helpers ──────────────────────────────────────────────
const emptyOrangTua = (): OrangTuaPayload => ({
  nama: "",
  hubungan: "",
  telp: "",
  pekerjaan: "",
  tanggal_lahir: "",
  tempat_lahir: "",
  alamat: "",
});

interface SiswaForm {
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
}

const emptySiswaForm = (): SiswaForm => ({
  username: "",
  password: "",
  nama: "",
  nis: "",
  kelas: "",
  jurusan: "",
  jenis_kelamin: "L",
  alamat: "",
  no_telp: "",
  email: "",
});

function StudentHoverDetails({ studentId }: { studentId: number }) {
  const [detail, setDetail] = useState<ApiStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getSiswaDetail(studentId)
      .then((data) => {
        if (isMounted) setDetail(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-background rounded-md border border-border/50">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!detail) {
    return <div className="p-4 text-xs text-muted-foreground text-center">Gagal memuat detail</div>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">{detail.nama}</h4>
        <p className="text-xs text-muted-foreground">{detail.email || "Tidak ada email"}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-border">
        <div>
          <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Username</span>
          <span className="font-medium">{detail.username}</span>
        </div>
        <div>
          <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Telepon</span>
          <span className="font-medium">{detail.no_telp || "-"}</span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Alamat</span>
          <span className="font-medium text-xs">{detail.alamat || "-"}</span>
        </div>
        <div>
          <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Poin</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">{detail.poin}</span>
        </div>
        <div>
          <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Total Poin</span>
          <span className="font-medium text-destructive">{detail.total_poin}</span>
        </div>
      </div>

      {detail.orang_tua && detail.orang_tua.length > 0 && (
        <div className="pt-2 border-t border-border space-y-2">
          <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Data Orang Tua</span>
          {detail.orang_tua.map((ot, idx) => (
            <div key={idx} className="bg-muted/50 rounded-md p-2 text-xs">
              <div className="flex justify-between font-medium mb-1">
                <span>{ot.nama}</span>
                <span className="capitalize text-muted-foreground">{ot.hubungan}</span>
              </div>
              <div className="flex flex-col gap-1 text-[10px] text-muted-foreground mt-1">
                <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {ot.telp || "-"}</span>
                <span className="flex items-center gap-1.5 truncate"><Briefcase className="h-3 w-3" /> {ot.pekerjaan || "-"}</span>
                <span className="flex items-center gap-1.5 truncate"><MapPin className="h-3 w-3" /> {ot.alamat || "-"}</span>
                {(ot.tempat_lahir || ot.tanggal_lahir) && (
                   <span className="flex items-center gap-1.5 truncate">
                     <Calendar className="h-3 w-3" /> {ot.tempat_lahir || "-"}, {ot.tanggal_lahir || "-"}
                   </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminStudents() {
  // ─── Data ────────────────────────────────────────────────────────
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Filter & Pagination ──────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("all");
  const [filterJurusan, setFilterJurusan] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 5;

  // ─── Modal state ──────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  // Simpan poin & total_poin asli siswa agar bisa dikirim saat update
  const [editPoin, setEditPoin] = useState({ poin: 0, total_poin: 0 });
  const [siswaForm, setSiswaForm] = useState<SiswaForm>(emptySiswaForm());
  const [orangTuaList, setOrangTuaList] = useState<OrangTuaPayload[]>([emptyOrangTua()]);

  // ─── Detail modal state ──────────────────────────────────────────
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStudentId, setDetailStudentId] = useState<number | null>(null);

  // ─── Delete state ─────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<ApiStudent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  // ─── Fetch ────────────────────────────────────────────────────────
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSiswa();
      setStudents(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ─── Filter opsi dinamis ──────────────────────────────────────────
  const kelasOptions = ["all", ...Array.from(new Set(students.map((s) => s.kelas))).sort()];
  const jurusanOptions = ["all", ...Array.from(new Set(students.map((s) => s.jurusan))).sort()];

  // ─── Filter + Paging ─────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      String(s.nis).includes(search);
    const matchKelas = filterKelas === "all" || s.kelas === filterKelas;
    const matchJurusan = filterJurusan === "all" || s.jurusan === filterJurusan;
    return matchSearch && matchKelas && matchJurusan;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const handleFilterChange = (setter: (v: string) => void) => (val: string) => {
    setter(val);
    setPage(0);
  };

  // ─── Validasi duplikat (frontend) ────────────────────────────────
  // Cek apakah username / NIS / email sudah dipakai siswa lain
  const checkDuplicate = (
    form: SiswaForm,
    excludeId: number | null
  ): string | null => {
    const others = students.filter((s) => s.id !== excludeId);
    if (others.some((s) => s.username === form.username))
      return `Username "${form.username}" sudah digunakan siswa lain.`;
    if (others.some((s) => String(s.nis) === String(form.nis)))
      return `NIS "${form.nis}" sudah digunakan siswa lain.`;
    if (others.some((s) => s.email === form.email))
      return `Email "${form.email}" sudah digunakan siswa lain.`;
    return null;
  };

  // ─── Buka modal CREATE ────────────────────────────────────────────
  const openCreate = () => {
    setModalMode("create");
    setEditTargetId(null);
    setSiswaForm(emptySiswaForm());
    setOrangTuaList([emptyOrangTua()]);
    setModalOpen(true);
  };

  // ─── Buka modal EDIT (fetch detail dulu untuk dapat orang tua) ───
  const openEdit = async (s: ApiStudent) => {
    setModalMode("edit");
    setEditTargetId(s.id);
    // Buka modal segera dengan data dasar, tampilkan loader
    setSiswaForm({
      username: s.username,
      password: "",
      nama: s.nama,
      nis: String(s.nis),
      kelas: s.kelas,
      jurusan: s.jurusan,
      jenis_kelamin: s.jenis_kelamin,
      alamat: "",
      no_telp: "",
      email: s.email,
    });
    setOrangTuaList([emptyOrangTua()]);
    setModalOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await getSiswaDetail(s.id);
      // Pre-fill form lengkap dari detail API
      setSiswaForm({
        username: detail.username,
        password: "",
        nama: detail.nama,
        nis: String(detail.nis),
        kelas: detail.kelas,
        jurusan: detail.jurusan,
        jenis_kelamin: detail.jenis_kelamin,
        alamat: detail.alamat || "",
        no_telp: detail.no_telp || "",
        email: detail.email,
      });
      // Simpan poin untuk dikirim saat update (backend wajib)
      setEditPoin({ poin: detail.poin, total_poin: detail.total_poin });
      // Pre-fill data orang tua dari API
      setOrangTuaList(
        detail.orang_tua.length > 0
          ? detail.orang_tua.map((ot) => ({
            nama: ot.nama,
            hubungan: ot.hubungan,
            telp: ot.telp,
            pekerjaan: ot.pekerjaan,
            tanggal_lahir: ot.tanggal_lahir || "",
            tempat_lahir: ot.tempat_lahir || "",
            alamat: ot.alamat,
          }))
          : [emptyOrangTua()]
      );
    } catch {
      toast({ title: "Peringatan", description: "Gagal memuat detail siswa, beberapa data mungkin kosong.", variant: "destructive" });
    } finally {
      setLoadingDetail(false);
    }
  };

  // ─── Helpers orang tua ────────────────────────────────────────────
  const updateOrangTua = (idx: number, field: keyof OrangTuaPayload, value: string) =>
    setOrangTuaList((prev) =>
      prev.map((ot, i) => (i === idx ? { ...ot, [field]: value } : ot))
    );
  const addOrangTua = () => setOrangTuaList((prev) => [...prev, emptyOrangTua()]);
  const removeOrangTua = (idx: number) =>
    setOrangTuaList((prev) => prev.filter((_, i) => i !== idx));

  // ─── Base validation ──────────────────────────────────────────────
  const validateForm = (): boolean => {
    const { username, nama, nis, kelas, jurusan, email, password } = siswaForm;

    // Password wajib hanya saat create
    if (modalMode === "create" && !password) {
      toast({ title: "Form tidak lengkap", description: "Password wajib diisi.", variant: "destructive" });
      return false;
    }
    if (!username || !nama || !nis || !kelas || !jurusan || !email) {
      toast({ title: "Form tidak lengkap", description: "Harap isi semua field wajib siswa.", variant: "destructive" });
      return false;
    }
    const invalidOT = orangTuaList.some((ot) => !ot.nama || !ot.hubungan || !ot.telp);
    if (invalidOT) {
      toast({ title: "Data orang tua tidak lengkap", description: "Harap isi nama, hubungan, dan telepon setiap orang tua.", variant: "destructive" });
      return false;
    }

    // Cek hubungan duplikat (Ayah/Ibu/Wali hanya boleh satu)
    const hubs = orangTuaList.map(ot => ot.hubungan);
    const hasDuplicateHub = hubs.some((h, idx) => hubs.indexOf(h) !== idx && h !== "");
    if (hasDuplicateHub) {
      toast({ 
        title: "Hubungan duplikat", 
        description: "Setiap kategori hubungan (Ayah/Ibu/Wali) hanya boleh diisi satu kali.", 
        variant: "destructive" 
      });
      return false;
    }

    // Cek duplikat data siswa lain (username/NIS/email)
    const dupMsg = checkDuplicate(siswaForm, editTargetId);
    if (dupMsg) {
      toast({ title: "Data sudah ada", description: dupMsg, variant: "destructive" });
      return false;
    }

    return true;
  };

  // ─── Submit CREATE ────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validateForm()) return;
    const payload: CreateSiswaPayload = {
      siswa: { ...siswaForm },
      orang_tua: orangTuaList,
    };
    setSaving(true);
    try {
      const res = await createSiswa(payload);
      if (res.status) {
        toast({ title: "Berhasil", description: res.message });
        setModalOpen(false);
        fetchStudents();
      } else {
        toast({ title: "Gagal", description: res.message, variant: "destructive" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ─── Submit EDIT ──────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!validateForm() || !editTargetId) return;
    const payload: UpdateSiswaPayload = {
      username: siswaForm.username,
      nama: siswaForm.nama,
      nis: siswaForm.nis,
      kelas: siswaForm.kelas,
      jurusan: siswaForm.jurusan,
      jenis_kelamin: siswaForm.jenis_kelamin,
      alamat: siswaForm.alamat,
      no_telp: siswaForm.no_telp,
      email: siswaForm.email,
      // Kirim kembali nilai poin asli agar backend tidak NULL
      poin: editPoin.poin,
      total_poin: editPoin.total_poin,
      orang_tua: orangTuaList,
    };
    setSaving(true);
    try {
      const res = await updateSiswa(editTargetId, payload);
      if (res.status) {
        toast({ title: "Berhasil", description: res.message });
        setModalOpen(false);
        fetchStudents();
      } else {
        toast({ title: "Gagal", description: res.message, variant: "destructive" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (id: number) => {
    setDetailStudentId(id);
    setDetailOpen(true);
  };

  // ─── Konfirmasi DELETE ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteSiswa(deleteTarget.id);
      if (res.status) {
        toast({ title: "Berhasil", description: `${deleteTarget.nama} berhasil dihapus.`, variant: "destructive" });
        setDeleteTarget(null);
        fetchStudents();
      } else {
        toast({ title: "Gagal", description: res.message, variant: "destructive" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="page-header">Data Siswa</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <UserPlus className="h-4 w-4 mr-2" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* ─── Card Tabel ─────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau NIS..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9"
            />
          </div>

          <Select value={filterKelas} onValueChange={handleFilterChange(setFilterKelas)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              {kelasOptions.map((k) => (
                <SelectItem key={k} value={k}>{k === "all" ? "Semua Kelas" : k}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterJurusan} onValueChange={handleFilterChange(setFilterJurusan)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Semua Jurusan" />
            </SelectTrigger>
            <SelectContent>
              {jurusanOptions.map((j) => (
                <SelectItem key={j} value={j}>{j === "all" ? "Semua Jurusan" : j}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Konten Tabel */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat data siswa...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
            <p className="font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchStudents}>Coba Lagi</Button>
          </div>
        ) : paged.length === 0 ? (
          <EmptyState title="Tidak Ditemukan" description="Tidak ada siswa yang cocok dengan pencarian atau filter." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Jurusan</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Total Poin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((s) => (
                  <HoverCard key={s.id} openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <TableRow className="transition-colors hover:bg-muted/50 data-[state=open]:bg-muted">
                        <TableCell className="font-mono text-xs">{s.nis}</TableCell>
                        <TableCell className="font-medium">{s.nama}</TableCell>
                        <TableCell>{s.kelas}</TableCell>
                        <TableCell>{s.jurusan}</TableCell>
                        <TableCell>{s.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</TableCell>
                        <TableCell className="font-bold">{s.total_poin}</TableCell>
                        <TableCell>
                          <StatusBadge status={resolveStatus(s.total_poin)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDetail(s.id); }}>
                              <Eye className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(s); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" align="start" sideOffset={8} onClick={(e) => e.stopPropagation()}>
                      <StudentHoverDetails studentId={s.id} />
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Halaman {page + 1} dari {totalPages}&nbsp;|&nbsp;Total {filtered.length} siswa
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modal Tambah / Edit Siswa ──────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalMode === "edit" ? "Edit Data Siswa" : "Tambah Siswa Baru"}</DialogTitle>
          </DialogHeader>

          {/* Loading detail */}
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Memuat data siswa...</span>
            </div>
          ) : (
            <>
              {/* Section: Data Siswa */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data Siswa</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Username <span className="text-destructive">*</span></Label>
                    <Input
                      value={siswaForm.username}
                      onChange={(e) => setSiswaForm((p) => ({ ...p, username: e.target.value }))}
                      placeholder="Contoh: siswa1"
                    />
                  </div>
                  {/* Password hanya muncul saat create */}
                  {modalMode === "create" && (
                    <div className="space-y-1.5">
                      <Label>Password <span className="text-destructive">*</span></Label>
                      <Input
                        type="password"
                        value={siswaForm.password}
                        onChange={(e) => setSiswaForm((p) => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Nama Lengkap <span className="text-destructive">*</span></Label>
                    <Input
                      value={siswaForm.nama}
                      onChange={(e) => setSiswaForm((p) => ({ ...p, nama: e.target.value }))}
                      placeholder="Nama siswa"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>NIS <span className="text-destructive">*</span></Label>
                    <Input
                      value={siswaForm.nis}
                      onChange={(e) => setSiswaForm((p) => ({ ...p, nis: e.target.value }))}
                      placeholder="Nomor Induk Siswa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Kelas <span className="text-destructive">*</span></Label>
                    <Input
                      value={siswaForm.kelas}
                      onChange={(e) => setSiswaForm((p) => ({ ...p, kelas: e.target.value }))}
                      placeholder="Contoh: XI"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jurusan <span className="text-destructive">*</span></Label>
                    <Input
                      value={siswaForm.jurusan}
                      onChange={(e) => setSiswaForm((p) => ({ ...p, jurusan: e.target.value }))}
                      placeholder="Contoh: RPL"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Jenis Kelamin</Label>
                    <Select
                      value={siswaForm.jenis_kelamin}
                      onValueChange={(v) => setSiswaForm((p) => ({ ...p, jenis_kelamin: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email <span className="text-destructive">*</span></Label>
                    <Input
                      type="email"
                      value={siswaForm.email}
                      onChange={(e) => setSiswaForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>No. Telepon</Label>
                    <Input
                      value={siswaForm.no_telp}
                      onChange={(e) => setSiswaForm((p) => ({ ...p, no_telp: e.target.value }))}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Alamat</Label>
                    <Input
                      value={siswaForm.alamat}
                      onChange={(e) => setSiswaForm((p) => ({ ...p, alamat: e.target.value }))}
                      placeholder="Alamat lengkap"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Data Orang Tua */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data Orang Tua</p>
                  <Button type="button" variant="outline" size="sm" onClick={addOrangTua}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Tambah
                  </Button>
                </div>

                {orangTuaList.map((ot, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-muted-foreground">Orang Tua #{idx + 1}</p>
                      {orangTuaList.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeOrangTua(idx)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nama <span className="text-destructive">*</span></Label>
                        <Input value={ot.nama} onChange={(e) => updateOrangTua(idx, "nama", e.target.value)} placeholder="Nama orang tua" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Hubungan <span className="text-destructive">*</span></Label>
                        <Select value={ot.hubungan} onValueChange={(v) => updateOrangTua(idx, "hubungan", v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ayah">Ayah</SelectItem>
                            <SelectItem value="ibu">Ibu</SelectItem>
                            <SelectItem value="wali">Wali</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">No. Telepon <span className="text-destructive">*</span></Label>
                        <Input value={ot.telp} onChange={(e) => updateOrangTua(idx, "telp", e.target.value)} placeholder="08xxxxxxxxxx" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Pekerjaan</Label>
                        <Input value={ot.pekerjaan} onChange={(e) => updateOrangTua(idx, "pekerjaan", e.target.value)} placeholder="Pekerjaan" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Tempat Lahir</Label>
                        <Input value={ot.tempat_lahir || ""} onChange={(e) => updateOrangTua(idx, "tempat_lahir", e.target.value)} placeholder="Tempat lahir" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Tanggal Lahir</Label>
                        <Input type="date" value={ot.tanggal_lahir || ""} onChange={(e) => updateOrangTua(idx, "tanggal_lahir", e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs">Alamat</Label>
                        <Input value={ot.alamat} onChange={(e) => updateOrangTua(idx, "alamat", e.target.value)} placeholder="Alamat orang tua" className="h-8 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                  Batal
                </Button>
                <Button onClick={modalMode === "edit" ? handleUpdate : handleCreate} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : modalMode === "edit" ? (
                    <Pencil className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {modalMode === "edit" ? "Simpan Perubahan" : "Simpan Siswa"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Modal Detail Siswa ────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Lengkap Siswa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {detailStudentId && <StudentHoverDetails studentId={detailStudentId} />}
          </div>
          <DialogFooter>
            <Button onClick={() => setDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Dialog Delete ───────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Siswa"
        description={
          deleteTarget
            ? `Apakah kamu yakin ingin menghapus "${deleteTarget.nama}" (NIS: ${deleteTarget.nis})? Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
      />
    </div>
  );
}
