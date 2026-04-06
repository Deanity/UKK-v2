import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProfile, getPointStatus, STATUS_LABEL, STATUS_CLASS, type ApiSiswaProfile } from "@/services/siswaService";
import { getPelanggaranList, type ApiPelanggaran } from "@/services/guruPelanggaranService";
import { EmptyState } from "@/components/EmptyState";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  User, Award, BookOpen, Phone,
  Briefcase, MapPin, Loader2, Users,
  Mail, AtSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Helper: format tanggal ────────────────────────────────────────
function formatTanggal(raw: string) {
  return new Date(raw).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default function SiswaProfile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ApiSiswaProfile | null>(null);
  const [violations, setViolations] = useState<ApiPelanggaran[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingViolations, setLoadingViolations] = useState(true);

  // ─── Fetch profil dan riwayat pelanggaran paralel ─────────────
  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => toast({
        title: "Gagal Memuat Profil",
        description: "Tidak dapat mengambil data profil dari server.",
        variant: "destructive",
      }))
      .finally(() => setLoadingProfile(false));

    getPelanggaranList()
      .then(setViolations)
      .catch(() => { }) // tidak tampilkan error jika riwayat gagal
      .finally(() => setLoadingViolations(false));
  }, []);

  // ─── Informasi status poin ────────────────────────────────────
  const status = profile ? getPointStatus(profile.total_poin) : "safe";
  const orangTua = profile?.orang_tua?.filter(Boolean) ?? [];

  // ─── Loading state ────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Memuat profil...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-muted-foreground py-16">
        Gagal memuat profil. Silakan coba lagi.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="page-header">Profil Saya</h1>

      {/* ── Profile Card ────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-primary to-primary/60" />
        <div className="p-6 -mt-10">
          {/* Avatar + Nama */}
          <div className="flex items-end gap-4 flex-wrap">
            <div className="h-20 w-20 rounded-xl bg-card border-4 border-card flex items-center justify-center shadow-md">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="mb-1 flex-1 min-w-0">
              <h2 className="text-xl font-display font-bold truncate">{profile.nama}</h2>
              <p className="text-sm text-muted-foreground">{profile.kelas} · {profile.jurusan}</p>
            </div>
            {/* Badge status */}
            <div className={`mb-1 shrink-0 text-sm font-semibold px-3 py-1 rounded-full border ${status === "safe" ? "bg-green-500/10 text-green-600 border-green-400/30 dark:text-green-400" :
              status === "warning" ? "bg-yellow-500/10 text-yellow-600 border-yellow-400/30 dark:text-yellow-400" :
                status === "danger" ? "bg-orange-500/10 text-orange-600 border-orange-400/30 dark:text-orange-400" :
                  "bg-destructive/10 text-destructive border-destructive/30"
              }`}>
              {STATUS_LABEL[status]}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 mt-6">
            {/* NIS */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">NIS</p>
              </div>
              <p className="font-mono font-bold text-sm">{profile.nis}</p>
            </div>

            {/* Kelas */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Kelas</p>
              </div>
              <p className="font-bold text-sm">{profile.kelas} {profile.jurusan}</p>
            </div>

            {/* Jenis Kelamin */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Jenis Kelamin</p>
              </div>
              <p className="font-bold text-sm capitalize">
                {profile.jenis_kelamin === "L" ? "Laki-laki" : profile.jenis_kelamin === "P" ? "Perempuan" : profile.jenis_kelamin || "—"}
              </p>
            </div>

            {/* Email */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
              <p className="font-medium text-sm truncate">{profile.email || "—"}</p>
            </div>

            {/* Poin Aktif */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Poin Aktif</p>
              </div>
              <p className={`text-2xl font-display font-bold ${STATUS_CLASS[status]}`}>
                {profile.poin}
              </p>
            </div>

            {/* Total Poin */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Poin</p>
              </div>
              <p className={`text-2xl font-display font-bold ${STATUS_CLASS[status]}`}>
                {profile.total_poin}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Data Orang Tua ──────────────────────────────────────── */}
      {orangTua.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Data Orang Tua / Wali</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {orangTua.map((ot, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{ot.nama}</p>
                  <span className="text-xs capitalize bg-muted px-2 py-0.5 rounded-full">
                    {ot.hubungan}
                  </span>
                </div>
                <div className="space-y-1">
                  {ot.telp && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {ot.telp}
                    </div>
                  )}
                  {ot.pekerjaan && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" /> {ot.pekerjaan}
                    </div>
                  )}
                  {(ot.tempat_lahir || ot.tanggal_lahir) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" /> {ot.tempat_lahir ? ot.tempat_lahir : "-"}, {ot.tanggal_lahir ? formatTanggal(ot.tanggal_lahir) : "-"}
                    </div>
                  )}
                  {ot.alamat && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {ot.alamat}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Riwayat Pelanggaran ─────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Riwayat Pelanggaran</h3>

        {loadingViolations ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat riwayat...
          </div>
        ) : violations.length === 0 ? (
          <EmptyState
            title="Tidak Ada Pelanggaran"
            description="Anda belum memiliki catatan pelanggaran. Pertahankan!"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggaran</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Poin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatTanggal(v.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">{v.nama_pelanggaran}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {v.keterangan}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive text-xs font-semibold px-2 py-0.5">
                        +{v.poin}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3 px-1">
              Total {violations.length} catatan pelanggaran
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
