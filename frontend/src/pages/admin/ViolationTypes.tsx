import { useState, useEffect } from "react";
import {
  getAllJenisPelanggaran,
  createJenisPelanggaran,
  updateJenisPelanggaran,
  deleteJenisPelanggaran,
  ApiViolationType,
  CreateViolationTypePayload,
  UpdateViolationTypePayload,
} from "@/services/violationTypeService";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, RefreshCw, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Tipe form internal ───────────────────────────────────────────
interface ViolationTypeForm {
  kode_pelanggaran: string;
  nama_pelanggaran: string;
  sanksi_poin: number | "";
  deskripsi_sanksi: string;
}

const emptyForm = (): ViolationTypeForm => ({
  kode_pelanggaran: "",
  nama_pelanggaran: "",
  sanksi_poin: "",
  deskripsi_sanksi: "",
});

// ─── Badge warna berdasarkan poin ────────────────────────────────
function getPoinBadgeClass(poin: number): string {
  if (poin >= 40) return "bg-destructive/10 text-destructive border-destructive/20";
  if (poin >= 20) return "bg-warning/10 text-warning border-warning/20";
  return "bg-success/10 text-success border-success/20";
}

export default function AdminViolationTypes() {
  // ─── Data ────────────────────────────────────────────────────────
  const [types, setTypes] = useState<ApiViolationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Search ───────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ─── Modal state ──────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ViolationTypeForm>(emptyForm());

  // ─── Delete state ─────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<ApiViolationType | null>(null);

  const { toast } = useToast();

  // ─── Fetch ────────────────────────────────────────────────────────
  const fetchTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllJenisPelanggaran();
      setTypes(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // ─── Filter search ────────────────────────────────────────────────
  const filtered = types.filter(
    (t) =>
      t.nama_pelanggaran.toLowerCase().includes(search.toLowerCase()) ||
      t.kode_pelanggaran.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Validasi duplikat kode (hanya saat create) ───────────────────
  const checkDuplicateKode = (kode: string): boolean =>
    types.some((t) => t.kode_pelanggaran.toLowerCase() === kode.toLowerCase());

  // ─── Buka modal CREATE ────────────────────────────────────────────
  const openCreate = () => {
    setModalMode("create");
    setEditTargetId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  // ─── Buka modal EDIT (prefill dari data list) ─────────────────────
  // Tidak perlu fetch detail karena list sudah mengembalikan semua field
  const openEdit = (t: ApiViolationType) => {
    setModalMode("edit");
    setEditTargetId(t.id);
    setForm({
      kode_pelanggaran: t.kode_pelanggaran,   // read-only saat edit
      nama_pelanggaran: t.nama_pelanggaran,
      sanksi_poin: t.sanksi_poin,
      deskripsi_sanksi: t.deskripsi_sanksi ?? "",
    });
    setModalOpen(true);
  };

  // ─── Validasi form ────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const { kode_pelanggaran, nama_pelanggaran, sanksi_poin } = form;
    if (modalMode === "create" && !kode_pelanggaran) {
      toast({ title: "Form tidak lengkap", description: "Kode pelanggaran wajib diisi.", variant: "destructive" });
      return false;
    }
    if (!nama_pelanggaran) {
      toast({ title: "Form tidak lengkap", description: "Nama pelanggaran wajib diisi.", variant: "destructive" });
      return false;
    }
    if (sanksi_poin === "" || Number(sanksi_poin) < 0) {
      toast({ title: "Form tidak lengkap", description: "Sanksi poin wajib diisi (minimal 0).", variant: "destructive" });
      return false;
    }
    // Cek duplikat kode (hanya saat create)
    if (modalMode === "create" && checkDuplicateKode(kode_pelanggaran)) {
      toast({ title: "Kode sudah digunakan", description: `Kode "${kode_pelanggaran}" sudah ada. Gunakan kode lain.`, variant: "destructive" });
      return false;
    }
    return true;
  };

  // ─── Submit CREATE ────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validateForm()) return;
    const payload: CreateViolationTypePayload = {
      kode_pelanggaran: form.kode_pelanggaran,
      nama_pelanggaran: form.nama_pelanggaran,
      sanksi_poin: Number(form.sanksi_poin),
      deskripsi_sanksi: form.deskripsi_sanksi || undefined,
    };
    setSaving(true);
    try {
      const res = await createJenisPelanggaran(payload);
      if (res.status) {
        toast({ title: "Berhasil", description: res.message });
        setModalOpen(false);
        fetchTypes();
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
    // kode_pelanggaran TIDAK dikirim saat update (sesuai dokumentasi)
    const payload: UpdateViolationTypePayload = {
      nama_pelanggaran: form.nama_pelanggaran,
      sanksi_poin: Number(form.sanksi_poin),
      deskripsi_sanksi: form.deskripsi_sanksi || undefined,
    };
    setSaving(true);
    try {
      const res = await updateJenisPelanggaran(editTargetId, payload);
      if (res.status) {
        toast({ title: "Berhasil", description: res.message });
        setModalOpen(false);
        fetchTypes();
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
    try {
      const res = await deleteJenisPelanggaran(deleteTarget.id);
      if (res.status) {
        toast({ title: "Berhasil", description: res.message, variant: "destructive" });
        setDeleteTarget(null);
        fetchTypes();
      } else {
        toast({ title: "Gagal", description: res.message, variant: "destructive" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="page-header">Jenis Pelanggaran</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTypes} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jenis
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
              placeholder="Cari kode atau nama pelanggaran..."
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
            <span>Memuat data jenis pelanggaran...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
            <p className="font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchTypes}>
              Coba Lagi
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Tidak Ditemukan"
            description="Tidak ada jenis pelanggaran yang cocok dengan pencarian."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Pelanggaran</TableHead>
                  <TableHead>Sanksi Poin</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono font-bold text-xs">{t.kode_pelanggaran}</TableCell>
                    <TableCell className="font-medium">{t.nama_pelanggaran}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPoinBadgeClass(t.sanksi_poin)}>
                        {t.sanksi_poin} poin
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {t.deskripsi_sanksi || <span className="italic text-xs">—</span>}
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

      {/* ─── Modal Tambah / Edit ─────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "edit" ? "Edit Jenis Pelanggaran" : "Tambah Jenis Pelanggaran"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Kode — read-only saat edit, sesuai dokumentasi API */}
              <div className="space-y-1.5">
                <Label>
                  Kode Pelanggaran{" "}
                  {modalMode === "create" && <span className="text-destructive">*</span>}
                </Label>
                {modalMode === "edit" ? (
                  <>
                    <Input value={form.kode_pelanggaran} disabled className="bg-muted text-muted-foreground font-mono" />
                    <p className="text-xs text-muted-foreground">Kode tidak dapat diubah.</p>
                  </>
                ) : (
                  <Input
                    value={form.kode_pelanggaran}
                    onChange={(e) => setForm((p) => ({ ...p, kode_pelanggaran: e.target.value.toUpperCase() }))}
                    placeholder="Contoh: P001"
                    className="font-mono"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Sanksi Poin <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sanksi_poin}
                  onChange={(e) => setForm((p) => ({ ...p, sanksi_poin: e.target.value === "" ? "" : Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nama Pelanggaran <span className="text-destructive">*</span></Label>
              <Input
                value={form.nama_pelanggaran}
                onChange={(e) => setForm((p) => ({ ...p, nama_pelanggaran: e.target.value }))}
                placeholder="Contoh: Bolos tanpa keterangan"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Deskripsi Sanksi</Label>
              <Textarea
                value={form.deskripsi_sanksi}
                onChange={(e) => setForm((p) => ({ ...p, deskripsi_sanksi: e.target.value }))}
                placeholder="Keterangan tambahan tentang sanksi ini..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={modalMode === "edit" ? handleUpdate : handleCreate} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : modalMode === "edit" ? (
                <Pencil className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {modalMode === "edit" ? "Simpan Perubahan" : "Tambah Jenis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Dialog Delete ───────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Jenis Pelanggaran"
        description={
          deleteTarget
            ? `Apakah kamu yakin ingin menghapus "${deleteTarget.nama_pelanggaran}" (${deleteTarget.kode_pelanggaran})? Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
      />
    </div>
  );
}
