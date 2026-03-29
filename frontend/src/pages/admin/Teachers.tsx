import { useState, useEffect } from "react";
import {
  getAllGuru,
  getGuruDetail,
  createGuru,
  updateGuru,
  deleteGuru,
  ApiTeacher,
  CreateTeacherPayload,
  UpdateTeacherPayload,
} from "@/services/teacherService";
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
import { Search, RefreshCw, Loader2, Pencil, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Tipe form internal ───────────────────────────────────────────
interface GuruForm {
  username: string;
  password: string;
  nama: string;
  kode_guru: string;
  jenis_kelamin: string;
  email: string;
  role: string;
}

const emptyForm = (): GuruForm => ({
  username: "",
  password: "",
  nama: "",
  kode_guru: "",
  jenis_kelamin: "L",
  email: "",
  role: "guru",
});

// ─── Label role ───────────────────────────────────────────────────
const roleLabel: Record<string, string> = {
  admin: "Admin",
  guru: "Guru",
  bk: "Guru BK",
};

export default function AdminTeachers() {
  // ─── Data ────────────────────────────────────────────────────────
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Search ───────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ─── Modal state ──────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState<GuruForm>(emptyForm());

  // ─── Delete state ─────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<ApiTeacher | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  // ─── Fetch All ────────────────────────────────────────────────────
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllGuru();
      setTeachers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // ─── Filter search ────────────────────────────────────────────────
  const filtered = teachers.filter(
    (t) =>
      t.nama.toLowerCase().includes(search.toLowerCase()) ||
      t.kode_guru.toLowerCase().includes(search.toLowerCase()) ||
      t.username.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Validasi duplikat (frontend) ────────────────────────────────
  const checkDuplicate = (f: GuruForm, excludeId: number | null): string | null => {
    const others = teachers.filter((t) => t.id !== excludeId);
    if (others.some((t) => t.username === f.username))
      return `Username "${f.username}" sudah digunakan guru lain.`;
    if (others.some((t) => t.kode_guru === f.kode_guru))
      return `Kode guru "${f.kode_guru}" sudah digunakan guru lain.`;
    if (others.some((t) => t.email === f.email))
      return `Email "${f.email}" sudah digunakan guru lain.`;
    return null;
  };

  // ─── Buka modal CREATE ────────────────────────────────────────────
  const openCreate = () => {
    setModalMode("create");
    setEditTargetId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  // ─── Buka modal EDIT (fetch detail dulu) ─────────────────────────
  const openEdit = async (t: ApiTeacher) => {
    setModalMode("edit");
    setEditTargetId(t.id);
    // Pre-fill data dasar dulu, buka modal
    setForm({
      username: t.username,
      password: "",
      nama: t.nama,
      kode_guru: t.kode_guru,
      jenis_kelamin: t.jenis_kelamin,
      email: t.email,
      role: t.role,
    });
    setModalOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await getGuruDetail(t.id);
      setForm({
        username: detail.username,
        password: "",
        nama: detail.nama,
        kode_guru: detail.kode_guru,
        jenis_kelamin: detail.jenis_kelamin,
        email: detail.email,
        role: detail.role,
      });
    } catch {
      toast({
        title: "Peringatan",
        description: "Gagal memuat detail guru.",
        variant: "destructive",
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  // ─── Validasi form ────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const { username, password, nama, kode_guru, email } = form;
    if (modalMode === "create" && !password) {
      toast({ title: "Form tidak lengkap", description: "Password wajib diisi.", variant: "destructive" });
      return false;
    }
    if (!username || !nama || !kode_guru || !email) {
      toast({ title: "Form tidak lengkap", description: "Harap isi semua field wajib.", variant: "destructive" });
      return false;
    }
    const dupMsg = checkDuplicate(form, editTargetId);
    if (dupMsg) {
      toast({ title: "Data sudah ada", description: dupMsg, variant: "destructive" });
      return false;
    }
    return true;
  };

  // ─── Submit CREATE ────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validateForm()) return;
    const payload: CreateTeacherPayload = { ...form };
    setSaving(true);
    try {
      const res = await createGuru(payload);
      if (res.status) {
        toast({ title: "Berhasil", description: res.message });
        setModalOpen(false);
        fetchTeachers();
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
    // username & password tidak dikirim saat update (sesuai dokumentasi API)
    const payload: UpdateTeacherPayload = {
      nama: form.nama,
      kode_guru: form.kode_guru,
      jenis_kelamin: form.jenis_kelamin,
      email: form.email,
      role: form.role,
    };
    setSaving(true);
    try {
      const res = await updateGuru(editTargetId, payload);
      if (res.status) {
        toast({ title: "Berhasil", description: res.message });
        setModalOpen(false);
        fetchTeachers();
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

  // ─── Konfirmasi DELETE ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteGuru(deleteTarget.id);
      if (res.status) {
        toast({ title: "Berhasil", description: `${deleteTarget.nama} berhasil dihapus.`, variant: "destructive" });
        setDeleteTarget(null);
        fetchTeachers();
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
        <h1 className="page-header">Data Guru</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTeachers} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <UserPlus className="h-4 w-4 mr-2" />
            Tambah Guru
          </Button>
        </div>
      </div>

      {/* ─── Card Tabel ─────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, username, atau kode guru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Konten */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat data guru...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
            <p className="font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchTeachers}>
              Coba Lagi
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Tidak Ditemukan"
            description="Tidak ada guru yang cocok dengan pencarian."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Guru</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.kode_guru}</TableCell>
                    <TableCell className="font-medium">{t.nama}</TableCell>
                    <TableCell>{t.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${t.role === "admin"
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          : t.role === "bk"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}>
                        {roleLabel[t.role] ?? t.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(t)}>
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
      </div>

      {/* ─── Modal Tambah / Edit Guru ────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "edit" ? "Edit Data Guru" : "Tambah Guru Baru"}
            </DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Memuat data guru...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Username — hanya tampil saat create */}
              {modalMode === "create" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Username <span className="text-destructive">*</span></Label>
                    <Input
                      value={form.username}
                      onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                      placeholder="Contoh: guru01"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password <span className="text-destructive">*</span></Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Jika edit, tampilkan username sebagai read-only info */}
              {modalMode === "edit" && (
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input value={form.username} disabled className="bg-muted text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Username tidak dapat diubah.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nama Lengkap <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.nama}
                    onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                    placeholder="Nama guru"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kode Guru <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.kode_guru}
                    onChange={(e) => setForm((p) => ({ ...p, kode_guru: e.target.value }))}
                    placeholder="Contoh: G001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Jenis Kelamin</Label>
                  <Select
                    value={form.jenis_kelamin}
                    onValueChange={(v) => setForm((p) => ({ ...p, jenis_kelamin: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guru">Guru</SelectItem>
                      <SelectItem value="bk">Guru BK</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="email@sekolah.id"
                />
              </div>
            </div>
          )}

          {!loadingDetail && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button
                onClick={modalMode === "edit" ? handleUpdate : handleCreate}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : modalMode === "edit" ? (
                  <Pencil className="h-4 w-4 mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {modalMode === "edit" ? "Simpan Perubahan" : "Tambah Guru"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Dialog Delete ───────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Guru"
        description={
          deleteTarget
            ? `Apakah kamu yakin ingin menghapus "${deleteTarget.nama}" (${deleteTarget.kode_guru})? Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
      />
    </div>
  );
}
