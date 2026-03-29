import { useState, useEffect, useMemo } from "react";
import {
  getPelanggaranList,
  getSiswaList,
  getJenisPelanggaranList,
  createPelanggaran,
  updatePelanggaran,
  deletePelanggaran,
  type ApiPelanggaran,
  type ApiSiswa,
  type ApiJenisPelanggaran,
} from "@/services/guruPelanggaranService";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Pencil, Trash2, Search,
  AlertTriangle, Loader2, RefreshCw, Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Helper: format tanggal ────────────────────────────────────────
function formatTanggal(raw: string) {
  return new Date(raw).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Tipe form modal ──────────────────────────────────────────────
interface FormState {
  id?: number;
  id_siswa: string;
  id_jenis_pelanggaran: string;
  keterangan: string;
  // untuk auto-fill preview poin
  previewPoin?: number;
  previewNamaSiswa?: string;
  previewNamaPelanggaran?: string;
}

const EMPTY_FORM: FormState = {
  id_siswa: "",
  id_jenis_pelanggaran: "",
  keterangan: "",
};

const PER_PAGE = 8;

export default function BKViolations() {
  // ─── State data ───────────────────────────────────────────────
  const [violations, setViolations] = useState<ApiPelanggaran[]>([]);
  const [students, setStudents] = useState<ApiSiswa[]>([]);
  const [violationTypes, setViolationTypes] = useState<ApiJenisPelanggaran[]>([]);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false); // true saat fetch dropdown
  const [saving, setSaving] = useState(false);

  // ─── State UI ─────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [keteranganEdited, setKeteranganEdited] = useState(false);
  // null = tutup, 1–4 = level yang sedang dilihat
  const [activeLevelModal, setActiveLevelModal] = useState<1 | 2 | 3 | 4 | null>(null);

  const { toast } = useToast();

  // ─── Fetch daftar pelanggaran ─────────────────────────────────
  const fetchViolations = async () => {
    try {
      setLoadingList(true);
      const data = await getPelanggaranList();
      setViolations(data);
    } catch {
      toast({
        title: "Gagal Memuat Data",
        description: "Tidak dapat mengambil data pelanggaran dari server.",
        variant: "destructive",
      });
    } finally {
      setLoadingList(false);
    }
  };

  // ─── Fetch dropdown saat modal dibuka ─────────────────────────
  const fetchFormDropdowns = async () => {
    // Students sudah di-fetch saat mount, cukup fetch jenis pelanggaran jika belum ada
    if (violationTypes.length > 0) return;
    setLoadingForm(true);
    try {
      const [s, j] = await Promise.all([getSiswaList(), getJenisPelanggaranList()]);
      setStudents(s);
      setViolationTypes(j);
    } catch {
      toast({
        title: "Gagal Memuat Data Form",
        description: "Tidak dapat mengambil daftar siswa atau jenis pelanggaran.",
        variant: "destructive",
      });
    } finally {
      setLoadingForm(false);
    }
  };

  useEffect(() => {
    fetchViolations();
    // Fetch siswa saat mount agar alert threshold langsung tampil
    getSiswaList().then(setStudents).catch(() => { });
  }, []);

  // ─── Filter & Paginasi ────────────────────────────────────────
  const filtered = useMemo(() =>
    violations.filter((v) => {
      const q = search.toLowerCase();
      return (
        v.nama_siswa.toLowerCase().includes(q) ||
        v.nama_pelanggaran.toLowerCase().includes(q) ||
        v.nis.toLowerCase().includes(q)
      );
    }),
    [violations, search]
  );

  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const thresholdStats = useMemo(() => {
    const lvl1 = students.filter((s) => s.total_poin >= 25 && s.total_poin < 50).length;
    const lvl2 = students.filter((s) => s.total_poin >= 50 && s.total_poin < 75).length;
    const lvl3 = students.filter((s) => s.total_poin >= 75 && s.total_poin < 100).length;
    const lvl4 = students.filter((s) => s.total_poin >= 100).length;
    return { lvl1, lvl2, lvl3, lvl4, total: lvl1 + lvl2 + lvl3 + lvl4 };
  }, [students]);

  // ─── Config 4 level threshold (harus setelah thresholdStats) ───
  const thresholdLevels = [
    {
      level: 1 as const,
      label: "Peringatan 1",
      range: "25 – 49 poin",
      count: thresholdStats.lvl1,
      students: students.filter((s) => s.total_poin >= 25 && s.total_poin < 50),
      cardClass: "border-yellow-400/40 bg-yellow-500/5",
      badgeClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
      iconClass: "text-yellow-500",
    },
    {
      level: 2 as const,
      label: "Peringatan 2",
      range: "50 – 74 poin",
      count: thresholdStats.lvl2,
      students: students.filter((s) => s.total_poin >= 50 && s.total_poin < 75),
      cardClass: "border-orange-400/40 bg-orange-500/5",
      badgeClass: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
      iconClass: "text-orange-500",
    },
    {
      level: 3 as const,
      label: "Skorsing",
      range: "75 – 99 poin",
      count: thresholdStats.lvl3,
      students: students.filter((s) => s.total_poin >= 75 && s.total_poin < 100),
      cardClass: "border-red-400/40 bg-red-500/5",
      badgeClass: "bg-red-500/15 text-red-700 dark:text-red-400",
      iconClass: "text-red-500",
    }
  ];

  // ─── Buka modal Tambah ────────────────────────────────────────
  const openAddModal = async () => {
    setForm(EMPTY_FORM);
    setKeteranganEdited(false);
    setModalOpen(true);
    await fetchFormDropdowns();
  };

  // ─── Buka modal Edit ──────────────────────────────────────────
  const openEditModal = async (v: ApiPelanggaran) => {
    setForm({
      id: v.id,
      id_siswa: "",               // tidak diketahui dari list response
      id_jenis_pelanggaran: "",   // akan dipilih ulang
      keterangan: v.keterangan,
      previewNamaSiswa: v.nama_siswa,
      previewNamaPelanggaran: v.nama_pelanggaran,
      previewPoin: v.poin,
    });
    setKeteranganEdited(true); // jaga keterangan yang ada
    setModalOpen(true);
    await fetchFormDropdowns();
  };

  // ─── Auto-fill keterangan dari jenis pelanggaran ──────────────
  const handleTypeChange = (typeId: string) => {
    const jenis = violationTypes.find((t) => String(t.id) === typeId);
    const autoKeterangan = jenis
      ? jenis.deskripsi_sanksi
        ? `${jenis.nama_pelanggaran}. ${jenis.deskripsi_sanksi}`
        : jenis.nama_pelanggaran
      : "";
    setForm((prev) => ({
      ...prev,
      id_jenis_pelanggaran: typeId,
      previewPoin: jenis?.sanksi_poin,
      previewNamaPelanggaran: jenis?.nama_pelanggaran,
      keterangan: autoKeterangan || prev.keterangan,
    }));
    setKeteranganEdited(false);
  };

  const handleStudentChange = (studentId: string) => {
    const siswa = students.find((s) => String(s.id) === studentId);
    setForm((prev) => ({
      ...prev,
      id_siswa: studentId,
      previewNamaSiswa: siswa?.nama,
    }));
  };

  // ─── Simpan (create / update) ─────────────────────────────────
  const handleSave = async () => {
    const isEdit = !!form.id;

    if (isEdit) {
      // Update: hanya butuh id_jenis_pelanggaran & keterangan
      if (!form.id_jenis_pelanggaran || !form.keterangan.trim()) {
        toast({ title: "Form Tidak Lengkap", description: "Pilih jenis pelanggaran dan isi keterangan.", variant: "destructive" });
        return;
      }
    } else {
      // Create: butuh id_siswa, id_jenis_pelanggaran, keterangan
      if (!form.id_siswa || !form.id_jenis_pelanggaran || !form.keterangan.trim()) {
        toast({ title: "Form Tidak Lengkap", description: "Siswa, jenis pelanggaran, dan keterangan wajib diisi.", variant: "destructive" });
        return;
      }
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updatePelanggaran(form.id!, {
          id_jenis_pelanggaran: Number(form.id_jenis_pelanggaran),
          keterangan: form.keterangan.trim(),
        });
        toast({ title: "Pelanggaran Diperbarui", description: "Data pelanggaran berhasil diubah." });
      } else {
        await createPelanggaran({
          id_siswa: Number(form.id_siswa),
          id_jenis_pelanggaran: Number(form.id_jenis_pelanggaran),
          keterangan: form.keterangan.trim(),
        });
        toast({ title: "Pelanggaran Ditambahkan", description: "Pelanggaran baru berhasil dicatat." });
      }

      setModalOpen(false);
      setForm(EMPTY_FORM);
      setKeteranganEdited(false);
      fetchViolations(); // refresh tabel
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.";
      toast({ title: "Gagal", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePelanggaran(deleteId);
      toast({ title: "Pelanggaran Dihapus", description: "Data berhasil dihapus.", variant: "destructive" });
      setDeleteId(null);
      fetchViolations();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Gagal menghapus data.";
      toast({ title: "Gagal", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="page-header">Pelanggaran Siswa</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {thresholdLevels.map((lvl) => (
          <button
            key={lvl.level}
            type="button"
            onClick={() => lvl.count > 0 && setActiveLevelModal(lvl.level)}
            className={`text-left rounded-xl border p-4 transition-all ${lvl.count > 0
              ? `${lvl.cardClass} hover:shadow-md hover:scale-[1.02] cursor-pointer`
              : "border-border bg-card cursor-default opacity-60"
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{lvl.label}</span>
              <AlertTriangle className={`h-4 w-4 ${lvl.count > 0 ? lvl.iconClass : "text-muted-foreground"}`} />
            </div>
            <p className={`text-3xl font-bold font-display ${lvl.count > 0 ? lvl.iconClass : "text-muted-foreground"}`}>
              {lvl.count}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{lvl.range}</p>
            {lvl.count > 0 && (
              <p className="text-xs font-medium mt-2 flex items-center gap-1 opacity-70">
                <Users className="h-3 w-3" /> Lihat daftar
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={loadingList}
          onClick={() => {
            fetchViolations();
            getSiswaList().then(setStudents).catch(() => { });
          }}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingList ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Pelanggaran
        </Button>
      </div>

      {/* Tabel */}
      <div className="bg-card rounded-xl border border-border">
        {/* Search bar */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama siswa, NIS, atau pelanggaran..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9"
            />
          </div>
        </div>

        {loadingList ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat data pelanggaran...
          </div>
        ) : paged.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Pelanggaran</TableHead>
                  <TableHead>Poin</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatTanggal(v.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">{v.nama_siswa}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.nis}</TableCell>
                    <TableCell className="text-sm">{v.nama_pelanggaran}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive text-xs font-semibold px-2 py-0.5">
                        +{v.poin}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {v.keterangan}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => openEditModal(v)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setDeleteId(v.id)}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Halaman {page + 1} dari {totalPages} ({filtered.length} data)
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

      {/* ── Modal Tambah / Edit ────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(open) => {
        if (!open) { setForm(EMPTY_FORM); setKeteranganEdited(false); }
        setModalOpen(open);
      }}>
        <DialogContent className="animate-scale-in max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Pelanggaran" : "Tambah Pelanggaran"}</DialogTitle>
          </DialogHeader>

          {loadingForm ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Memuat data form...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Siswa — hanya untuk tambah baru */}
              {!form.id ? (
                <div className="space-y-2">
                  <Label>Siswa <span className="text-destructive">*</span></Label>
                  <Select value={form.id_siswa} onValueChange={handleStudentChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih siswa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.nama}
                          <span className="text-muted-foreground ml-1">— {s.kelas} {s.jurusan}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                /* Saat edit: tampilkan nama siswa sebagai info read-only */
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Siswa</Label>
                  <p className="text-sm font-medium">{form.previewNamaSiswa}</p>
                </div>
              )}

              {/* Jenis Pelanggaran */}
              <div className="space-y-2">
                <Label>Jenis Pelanggaran <span className="text-destructive">*</span></Label>
                <Select value={form.id_jenis_pelanggaran} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis pelanggaran..." />
                  </SelectTrigger>
                  <SelectContent>
                    {violationTypes.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        [{t.kode_pelanggaran}] {t.nama_pelanggaran}
                        <span className="text-muted-foreground ml-1">— {t.sanksi_poin} poin</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview poin */}
              {form.previewPoin !== undefined && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Poin yang ditambahkan</p>
                    <p className="text-xl font-bold text-primary">+{form.previewPoin}</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-right max-w-[140px]">
                    {form.previewNamaPelanggaran}
                  </p>
                </div>
              )}

              {/* Keterangan */}
              <div className="space-y-2">
                <Label>Keterangan <span className="text-destructive">*</span></Label>
                <Textarea
                  value={form.keterangan}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, keterangan: e.target.value }));
                    setKeteranganEdited(true);
                  }}
                  placeholder="Pilih jenis pelanggaran untuk mengisi otomatis..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Terisi otomatis, bisa diedit sesuai kebutuhan.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving || loadingForm}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Konfirmasi Hapus ───────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      {/* ── Modal Daftar Siswa per Level ────────────────────────── */}
      {(() => {
        const lvl = thresholdLevels.find((l) => l.level === activeLevelModal);
        if (!lvl) return null;
        return (
          <Dialog open={activeLevelModal !== null} onOpenChange={() => setActiveLevelModal(null)}>
            <DialogContent className="max-w-lg animate-scale-in">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {lvl.label}
                  <span className="text-sm font-normal text-muted-foreground ml-1">({lvl.range})</span>
                </DialogTitle>
              </DialogHeader>

              {lvl.students.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Tidak ada siswa</p>
              ) : (
                <div className="divide-y divide-border max-h-[60vh] overflow-y-auto -mx-6 px-6">
                  {lvl.students
                    .sort((a, b) => b.total_poin - a.total_poin)
                    .map((s) => (
                      <div key={s.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium">{s.nama}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.nis} • {s.kelas} {s.jurusan}
                          </p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${lvl.badgeClass}`}>
                            {s.total_poin} poin
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            aktif: {s.poin} poin
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveLevelModal(null)}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
