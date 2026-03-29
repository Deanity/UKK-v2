import { useState, useEffect } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Download, Search, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getLaporanList, createLaporan, updateLaporan, deleteLaporan, Laporan, LaporanPayload } from "@/services/laporanService";
import { getSuratList, Surat } from "@/services/suratService";
import { getSiswaList, getPelanggaranList, ApiSiswa, ApiPelanggaran } from "@/services/guruPelanggaranService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper CSV
function convertToCSV(data: any[]): string {
    if (data.length === 0) return "";
    const header = Object.keys(data[0]).join(",");
    const rows = data.map(obj => Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    return [header, ...rows].join("\n");
}

export default function AdminReports() {
    const [laporanList, setLaporanList] = useState<Laporan[]>([]);
    const [suratList, setSuratList] = useState<Surat[]>([]);

    // State for Laporan Pelanggaran
    const [pelanggaranList, setPelanggaranList] = useState<(ApiPelanggaran & { kelas: string; jurusan: string })[]>([]);
    const [kelasOptions, setKelasOptions] = useState<string[]>([]);
    const [jurusanOptions, setJurusanOptions] = useState<string[]>([]);

    // Filters for Pelanggaran
    const [filterKelas, setFilterKelas] = useState("all");
    const [filterJurusan, setFilterJurusan] = useState("all");
    const [filterBulan, setFilterBulan] = useState("all");

    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editId, setEditId] = useState<number | null>(null);

    const [formData, setFormData] = useState<Partial<LaporanPayload>>({
        jenis_laporan: "Mediasi Pertemuan Orang Tua",
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [laporanRes, suratRes, siswaRes, pelanggaranRes] = await Promise.all([
                getLaporanList(),
                getSuratList(),
                getSiswaList(),
                getPelanggaranList()
            ]);

            setLaporanList(laporanRes);
            setSuratList(suratRes);

            // Map Pelanggaran with Siswa (to get kelas & jurusan)
            const mapSiswa = new Map(siswaRes.map(s => [s.nis, s]));
            const enrichedPelanggaran = pelanggaranRes.map(p => {
                const s = mapSiswa.get(p.nis);
                return {
                    ...p,
                    kelas: s ? s.kelas : "-",
                    jurusan: s ? s.jurusan : "-"
                };
            });
            setPelanggaranList(enrichedPelanggaran);

            // Extract options
            const kOptions = Array.from(new Set(siswaRes.map(s => s.kelas))).filter(Boolean).sort();
            const jOptions = Array.from(new Set(siswaRes.map(s => s.jurusan))).filter(Boolean).sort();
            setKelasOptions(kOptions);
            setJurusanOptions(jOptions);

        } catch (error: any) {
            toast({ title: "Gagal memuat data", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.id_surat || !formData.jenis_laporan || !formData.keterangan) {
            toast({ title: "Mohon lengkapi semua field", variant: "destructive" });
            return;
        }

        try {
            const payload: LaporanPayload = {
                id_surat: formData.id_surat,
                jenis_laporan: formData.jenis_laporan,
                keterangan: formData.keterangan,
            };

            if (editId) {
                await updateLaporan(editId, payload);
                toast({ title: "Laporan berhasil diperbarui" });
            } else {
                await createLaporan(payload);
                toast({ title: "Laporan berhasil dibuat" });
            }

            setModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast({ title: "Gagal menyimpan laporan", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteLaporan(deleteId);
            toast({ title: "Laporan dihapus" });
            fetchData();
        } catch (error: any) {
            toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
        } finally {
            setDeleteId(null);
        }
    };

    const openForm = (laporan?: Laporan) => {
        if (laporan) {
            setEditId(laporan.id);
            setFormData({
                id_surat: laporan.id_surat,
                jenis_laporan: laporan.jenis_laporan,
                keterangan: laporan.keterangan
            });
        } else {
            setEditId(null);
            setFormData({ jenis_laporan: "Mediasi Pertemuan Orang Tua" });
        }
        setModalOpen(true);
    };

    // Derived Filter Pelanggaran
    const filteredPelanggaran = pelanggaranList.filter((p) => {
        const matchKelas = filterKelas === "all" || p.kelas === filterKelas;
        const matchJurusan = filterJurusan === "all" || p.jurusan === filterJurusan;
        let matchBulan = true;
        if (filterBulan !== "all") {
            const [y, m] = filterBulan.split("-");
            const d = new Date(p.created_at);
            matchBulan = d.getFullYear() === parseInt(y) && (d.getMonth() + 1) === parseInt(m);
        }
        return matchKelas && matchJurusan && matchBulan;
    });

    // Month options from history
    const bulanOptions = Array.from(new Set(pelanggaranList.map(p => {
        const d = new Date(p.created_at);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    }))).sort().reverse();

    const handleExport = () => {
        if (filteredPelanggaran.length === 0) {
            toast({ title: "Data kosong", description: "Tidak ada data untuk diekspor." });
            return;
        }

        const exportData = filteredPelanggaran.map(p => ({
            "Tanggal": new Date(p.created_at).toLocaleDateString("id-ID"),
            "NIS": p.nis,
            "Nama Siswa": p.nama_siswa,
            "Kelas": p.kelas,
            "Jurusan": p.jurusan,
            "Pelanggaran": p.nama_pelanggaran,
            "Poin": p.poin,
            "Keterangan": p.keterangan || "-"
        }));

        const csvString = convertToCSV(exportData);
        // Add BOM for Excel UTF-8
        const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Laporan_Pelanggaran_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-header">Laporan dan Rekapitulasi</h1>
                    <p className="text-muted-foreground mt-1">Laporan pelanggaran siswa dan hasil tindak lanjut / mediasi.</p>
                </div>
            </div>

            <Tabs defaultValue="pelanggaran" className="space-y-6">
                <TabsList className="bg-muted">
                    <TabsTrigger value="pelanggaran">Rekam Pelanggaran Siswa</TabsTrigger>
                    <TabsTrigger value="mediasi">Laporan Tindak Lanjut (Mediasi)</TabsTrigger>
                </TabsList>

                {/* TAB 1: LAPORAN PELANGGARAN */}
                <TabsContent value="pelanggaran" className="space-y-4 outline-none">
                    <div className="bg-card rounded-xl border border-border">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-2 items-center">
                                <Select value={filterKelas} onValueChange={setFilterKelas}>
                                    <SelectTrigger className="w-[140px] h-9 text-sm">
                                        <SelectValue placeholder="Semua Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kelas</SelectItem>
                                        {kelasOptions.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <Select value={filterJurusan} onValueChange={setFilterJurusan}>
                                    <SelectTrigger className="w-[160px] h-9 text-sm">
                                        <SelectValue placeholder="Semua Jurusan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jurusan</SelectItem>
                                        {jurusanOptions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <Select value={filterBulan} onValueChange={setFilterBulan}>
                                    <SelectTrigger className="w-[160px] h-9 text-sm">
                                        <SelectValue placeholder="Semua Bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Bulan</SelectItem>
                                        {bulanOptions.map(b => (
                                            <SelectItem key={b} value={b}>
                                                {new Date(b + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {(filterKelas !== "all" || filterJurusan !== "all" || filterBulan !== "all") && (
                                    <Button variant="ghost" size="sm" onClick={() => { setFilterKelas("all"); setFilterJurusan("all"); setFilterBulan("all"); }} className="text-muted-foreground h-9">
                                        <X className="h-4 w-4 mr-1" /> Reset
                                    </Button>
                                )}
                            </div>
                            <Button variant="outline" size="sm" onClick={handleExport} className="shrink-0 h-9">
                                <Download className="h-4 w-4 mr-2" /> Export Excel
                            </Button>
                        </div>

                        {/* Table Pelanggaran */}
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
                        ) : filteredPelanggaran.length === 0 ? (
                            <EmptyState title="Tidak ada data" description="Tidak ada catatan pelanggaran yang sesuai kriteria pencarian." />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Siswa</TableHead>
                                            <TableHead>Kelas</TableHead>
                                            <TableHead>Pelanggaran</TableHead>
                                            <TableHead className="text-right">Poin</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPelanggaran.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {new Date(p.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{p.nama_siswa}</div>
                                                    <div className="text-xs text-muted-foreground">{p.nis}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="whitespace-nowrap">{p.kelas} {p.jurusan}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{p.nama_pelanggaran}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{p.keterangan || "-"}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-destructive">
                                                    +{p.poin}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* TAB 2: MEDIASI */}
                <TabsContent value="mediasi" className="space-y-4 outline-none">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => openForm()} size="sm">
                            <Plus className="h-4 w-4 mr-2" /> Tambah Laporan Tindak Lanjut
                        </Button>
                    </div>
                    <div className="bg-card rounded-xl border border-border">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
                        ) : laporanList.length === 0 ? (
                            <EmptyState title="Belum ada riwayat laporan" description="Klik Tambah Laporan untuk membuat berita acara hasil pertemuan surat panggilan." />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal Laporan</TableHead>
                                            <TableHead>No. Surat Rujukan</TableHead>
                                            <TableHead>Nama Siswa</TableHead>
                                            <TableHead>Jenis Laporan</TableHead>
                                            <TableHead>Keterangan Mediasi</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {laporanList.map((l) => (
                                            <TableRow key={l.id}>
                                                <TableCell className="font-medium">{new Date(l.created_at).toLocaleDateString("id-ID")}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-blue-600 dark:text-blue-400">{l.nomor_surat}</div>
                                                    <div className="text-xs text-muted-foreground">{l.jenis_surat}</div>
                                                </TableCell>
                                                <TableCell>{l.nama_siswa}</TableCell>
                                                <TableCell>{l.jenis_laporan}</TableCell>
                                                <TableCell className="max-w-xs truncate">{l.keterangan}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => openForm(l)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(l.id)}>
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
                </TabsContent>
            </Tabs>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editId ? "Edit Laporan" : "Buat Laporan Baru"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">

                        <div className="space-y-2">
                            <Label>Nomor Surat Panggilan (Rujukan)</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={formData.id_surat || ""}
                                onChange={(e) => setFormData({ ...formData, id_surat: Number(e.target.value) })}
                            >
                                <option value="">-- Pilih Surat yang Ditindaklanjuti --</option>
                                {suratList.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.nomor_surat} - {s.nama_siswa} ({new Date(s.tanggal_surat).toLocaleDateString("id-ID")})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Jenis Laporan</Label>
                            <Input
                                placeholder="Contoh: Mediasi Berhasil"
                                value={formData.jenis_laporan || ""}
                                onChange={(e) => setFormData({ ...formData, jenis_laporan: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Keterangan / Hasil Mediasi</Label>
                            <Textarea
                                placeholder="Tuliskan detail kesepakatan, janji siswa, atau hasil mediasi..."
                                rows={5}
                                value={formData.keterangan || ""}
                                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button onClick={handleSave}>Simpan Laporan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Laporan Lanjut" description="Apakah Anda yakin ingin menghapus data laporan ini?" />
        </div>
    );
}
