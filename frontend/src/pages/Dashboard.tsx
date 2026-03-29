import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { dummyStudents, dummyViolations } from "@/data/dummy";
import { Users, AlertTriangle, AlertOctagon, TrendingUp, Calendar, ClipboardList, GraduationCap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboardStats, DashboardStats, getPelanggaranPerBulan, getPelanggaranTerbaru, Pelanggaran } from "@/services/dashboardService";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<{ month: string, pelanggaran: number }[]>([]);
  const [recentViolations, setRecentViolations] = useState<Pelanggaran[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Gagal mengambil dashboard stats:", error);
      }
    };

    const fetchChart = async () => {
      try {
        const data = await getPelanggaranPerBulan();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const formatted = data.map(item => {
          const [year, month] = item.bulan.split('-');
          const monthIndex = parseInt(month, 10) - 1;
          return {
            month: monthNames[monthIndex] || item.bulan,
            pelanggaran: item.total
          };
        });
        setChartData(formatted);
      } catch (error) {
        console.error("Gagal mengambil chart stats:", error);
      }
    };

    const fetchRecentViolations = async () => {
      try {
        const data = await getPelanggaranTerbaru();
        setRecentViolations(data.slice(0, 5));
      } catch (error) {
        console.error("Gagal mengambil pelanggaran terbaru:", error);
      }
    };

    fetchStats();
    fetchChart();
    fetchRecentViolations();
  }, []);

  if (!user) return null;

  const totalStudents = stats?.total_siswa ?? dummyStudents.length;
  const totalViolations = stats?.total_pelanggaran ?? dummyViolations.length;
  const totalTeachers = stats?.total_guru ?? 0;
  const highPointStudents = dummyStudents.filter((s) => s.status === "critical").length;

  const roleGreeting: Record<string, string> = {
    admin: "Kelola data sekolah dan pantau pelanggaran siswa.",
    guru: "Laporkan pelanggaran siswa dengan mudah.",
    bk: "Kelola data pelanggaran dan surat panggilan.",
    siswa: "Lihat riwayat pelanggaran dan poin Anda.",
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="page-header">Selamat Datang, {user.nama}!</h1>
        <p className="text-muted-foreground mt-1">{roleGreeting[user.role]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Siswa" value={totalStudents} icon={Users} variant="primary" trend="Aktif" />
        <StatCard title="Total Guru" value={totalTeachers} icon={GraduationCap} variant="success" trend="Aktif" />
        <StatCard title="Total Pelanggaran" value={totalViolations} icon={AlertTriangle} variant="warning" trend="Semester ini" />
        {/* <StatCard title="Siswa Kritis" value={highPointStudents} icon={AlertOctagon} variant="destructive" trend="Perlu perhatian" /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Tren Pelanggaran Bulanan</h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full flex flex-col justify-center">
            {chartData.length === 0 ? (
              <EmptyState title="Belum Ada Data" description="Grafik pelanggaran akan muncul di sini." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" interval={0} />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="pelanggaran" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Pelanggaran Terbaru</h3>
          </div>
          <div className="space-y-3 mt-4">
            {recentViolations.length === 0 ? (
              <div className="py-12 flex items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">Belum ada pelanggaran terbaru</p>
              </div>
            ) : (
              recentViolations.map((v) => (
                <div key={v.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {v.poin}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{v.nama_siswa}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.nama_pelanggaran}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(v.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Students at Risk */}
      {/* {(user.role === "admin" || user.role === "bk") && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-sm mb-4">Siswa Beresiko Tinggi</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Poin</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyStudents
                  .filter((s) => s.status !== "safe")
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.nis}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.kelas} {s.jurusan}</TableCell>
                      <TableCell className="font-bold">{s.totalPoints}</TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )} */}
    </div>
  );
}
