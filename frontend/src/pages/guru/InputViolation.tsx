import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  CheckCircle,
  Loader2,
  Filter,
  X,
  ClockIcon,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getSiswaList,
  getJenisPelanggaranList,
  createPelanggaran,
  getPelanggaranList,
  type ApiSiswa,
  type ApiJenisPelanggaran,
  type ApiPelanggaran,
} from "@/services/guruPelanggaranService";

// ─── Helper: format tanggal ────────────────────────────────────────
function formatTanggal(raw: string) {
  const d = new Date(raw);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GuruInput() {
  // ─── State data dari API ───────────────────────────────────────
  const [students, setStudents] = useState<ApiSiswa[]>([]);
  const [violationTypes, setViolationTypes] = useState<ApiJenisPelanggaran[]>([]);
  const [recentViolations, setRecentViolations] = useState<ApiPelanggaran[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // ─── State filter ──────────────────────────────────────────────
  const [filterKelas, setFilterKelas] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");

  // ─── State form ────────────────────────────────────────────────
  const [studentId, setStudentId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [keteranganEdited, setKeteranganEdited] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  // ─── Fetch form dropdowns ──────────────────────────────────────
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [siswaData, jenisData] = await Promise.all([
          getSiswaList(),
          getJenisPelanggaranList(),
        ]);
        setStudents(siswaData);
        setViolationTypes(jenisData);
      } catch {
        toast({
          title: "Gagal Memuat Data",
          description: "Tidak dapat mengambil data siswa atau jenis pelanggaran dari server.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchDropdowns();
  }, []);

  // ─── Fetch riwayat pelanggaran ─────────────────────────────────
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getPelanggaranList();
      // Ambil 8 terbaru (sudah urut DESC dari backend)
      setRecentViolations(data.slice(0, 5));
    } catch {
      // Gagal fetch history tidak perlu toast — cukup tampil empty
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ─── Derived: opsi filter ──────────────────────────────────────
  const kelasOptions = useMemo(
    () => [...new Set(students.map((s) => s.kelas))].sort(),
    [students]
  );

  const jurusanOptions = useMemo(() => {
    const base = filterKelas
      ? students.filter((s) => s.kelas === filterKelas)
      : students;
    return [...new Set(base.map((s) => s.jurusan))].sort();
  }, [students, filterKelas]);

  const filteredStudents = useMemo(
    () =>
      students.filter((s) => {
        if (filterKelas && s.kelas !== filterKelas) return false;
        if (filterJurusan && s.jurusan !== filterJurusan) return false;
        return true;
      }),
    [students, filterKelas, filterJurusan]
  );

  const hasActiveFilter = filterKelas || filterJurusan;

  // ─── Handler filter ────────────────────────────────────────────
  const handleKelasChange = (val: string) => {
    setFilterKelas(val);
    setFilterJurusan("");
    setStudentId("");
  };
  const handleJurusanChange = (val: string) => {
    setFilterJurusan(val);
    setStudentId("");
  };
  const handleResetFilter = () => {
    setFilterKelas("");
    setFilterJurusan("");
    setStudentId("");
  };

  // ─── Data yang dipilih ─────────────────────────────────────────
  const selectedStudent = students.find((s) => String(s.id) === studentId);
  const selectedType = violationTypes.find((t) => String(t.id) === typeId);

  // ─── Auto-fill keterangan ──────────────────────────────────────
  useEffect(() => {
    if (!selectedType || keteranganEdited) return;
    const autoText = selectedType.deskripsi_sanksi
      ? `${selectedType.nama_pelanggaran}. ${selectedType.deskripsi_sanksi}`
      : selectedType.nama_pelanggaran;
    setKeterangan(autoText);
  }, [selectedType]);

  const isFormValid = !!studentId && !!typeId && keterangan.trim().length > 0;

  // ─── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      await createPelanggaran({
        id_siswa: Number(studentId),
        id_jenis_pelanggaran: Number(typeId),
        keterangan: keterangan.trim(),
      });

      toast({
        title: "Pelanggaran Dilaporkan",
        description: `Pelanggaran "${selectedType?.nama_pelanggaran}" untuk ${selectedStudent?.nama} berhasil dicatat.`,
      });

      setSubmitted(true);
      // Refresh riwayat setelah submit sukses
      fetchHistory();

      setTimeout(() => {
        setStudentId("");
        setTypeId("");
        setKeterangan("");
        setKeteranganEdited(false);
        setFilterKelas("");
        setFilterJurusan("");
        setSubmitted(false);
      }, 2500);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Gagal melaporkan pelanggaran. Coba lagi.";
      toast({ title: "Gagal", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <h1 className="page-header">Input Pelanggaran Siswa</h1>
      <p className="text-muted-foreground">
        Laporkan pelanggaran siswa melalui form di bawah ini.
      </p>

      {/* ── Layout 2 kolom di desktop ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ══ KOLOM KIRI: Form ══════════════════════════════════ */}
        <div>
          {/* Success state */}
          {submitted ? (
            <div className="bg-card rounded-xl border border-success/30 p-8 text-center animate-scale-in">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-semibold text-lg">Berhasil Dilaporkan!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pelanggaran telah berhasil dicatat ke sistem.
              </p>
            </div>

          ) : loadingData ? (
            <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Memuat data...</span>
            </div>

          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-xl border border-border p-6 space-y-5"
            >
              {/* Filter Kelas & Jurusan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Filter Siswa
                  </div>
                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={handleResetFilter}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Reset filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Kelas</Label>
                    <Select value={filterKelas} onValueChange={handleKelasChange}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Semua kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {kelasOptions.map((k) => (
                          <SelectItem key={k} value={k}>Kelas {k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Jurusan</Label>
                    <Select value={filterJurusan} onValueChange={handleJurusanChange}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Semua jurusan" />
                      </SelectTrigger>
                      <SelectContent>
                        {jurusanOptions.map((j) => (
                          <SelectItem key={j} value={j}>{j}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {hasActiveFilter
                    ? `${filteredStudents.length} siswa ditemukan`
                    : `Total ${students.length} siswa`}
                </p>
                <hr className="border-border" />
              </div>

              {/* Pilih Siswa */}
              <div className="space-y-2">
                <Label>Pilih Siswa <span className="text-destructive">*</span></Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih siswa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-center text-muted-foreground">
                        Tidak ada siswa ditemukan
                      </div>
                    ) : (
                      filteredStudents.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.nama}
                          <span className="text-muted-foreground ml-1">
                            — {s.kelas} {s.jurusan}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Pilih Jenis Pelanggaran */}
              <div className="space-y-2">
                <Label>Jenis Pelanggaran <span className="text-destructive">*</span></Label>
                <Select value={typeId} onValueChange={setTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis pelanggaran..." />
                  </SelectTrigger>
                  <SelectContent>
                    {violationTypes.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        [{t.kode_pelanggaran}] {t.nama_pelanggaran}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview poin */}
              {selectedType && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Poin Pelanggaran</p>
                      <p className="text-2xl font-bold font-display text-primary">
                        {selectedType.sanksi_poin}
                      </p>
                    </div>
                    {selectedType.deskripsi_sanksi && (
                      <div className="text-right max-w-[200px]">
                        <p className="text-sm text-muted-foreground">Sanksi</p>
                        <p className="text-sm font-medium">{selectedType.deskripsi_sanksi}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Keterangan */}
              <div className="space-y-2">
                <Label>Keterangan <span className="text-destructive">*</span></Label>
                <Textarea
                  value={keterangan}
                  onChange={(e) => {
                    setKeterangan(e.target.value);
                    setKeteranganEdited(true);
                  }}
                  placeholder="Pilih jenis pelanggaran untuk mengisi otomatis..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Terisi otomatis dari jenis pelanggaran, bisa diedit sesuai kebutuhan.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={!isFormValid || submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" />Laporkan Pelanggaran</>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* ══ KOLOM KANAN: Riwayat Pelanggaran ════════════════════ */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Riwayat Pelanggaran Terkini</h2>
            </div>
            <span className="text-xs text-muted-foreground">5 terakhir</span>
          </div>

          {/* Content */}
          {loadingHistory ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat riwayat...
            </div>
          ) : recentViolations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
              <AlertCircle className="h-8 w-8 opacity-30" />
              <p>Belum ada data pelanggaran</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentViolations.map((v) => (
                <li key={v.id} className="px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{v.nama_siswa}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {v.nama_pelanggaran}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTanggal(v.created_at)}
                      </p>
                    </div>
                    {/* Badge poin */}
                    <span className="shrink-0 inline-flex items-center rounded-full bg-destructive/10 text-destructive text-xs font-semibold px-2 py-0.5">
                      +{v.poin} poin
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
