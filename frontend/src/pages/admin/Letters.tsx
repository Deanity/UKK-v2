import { useState, useEffect } from "react";
import { dummyLetterTemplates } from "@/data/dummy";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAllSiswa, getSiswaDetail, ApiStudent, ApiStudentDetail } from "@/services/studentService";
import { createSurat, getSuratList, Surat } from "@/services/suratService";
import { getPelanggaranList, ApiPelanggaran } from "@/services/guruPelanggaranService";
import { getAllGuru, ApiTeacher } from "@/services/teacherService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function BKLetters() {
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [violations, setViolations] = useState<ApiPelanggaran[]>([]);
  const [studentDetail, setStudentDetail] = useState<ApiStudentDetail | null>(null);
  const [suratHistory, setSuratHistory] = useState<Surat[]>([]);
  const [studentId, setStudentId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customKeperluan, setCustomKeperluan] = useState("");
  const [step, setStep] = useState(1);
  const [parentTTL, setParentTTL] = useState("");
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [guruBKId, setGuruBKId] = useState("");
  const [guruWaliId, setGuruWaliId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getAllSiswa();
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };
    const fetchViolations = async () => {
      try {
        const data = await getPelanggaranList();
        setViolations(data);
      } catch (error) {
        console.error("Failed to fetch violations:", error);
      }
    };
    const fetchHistory = async () => {
      try {
        const data = await getSuratList();
        setSuratHistory(data);
      } catch (error) {
        console.error("Failed to fetch surat history:", error);
      }
    };
    fetchStudents();
    fetchViolations();
    fetchHistory();
    const fetchTeachers = async () => {
      try {
        const data = await getAllGuru();
        setTeachers(data);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!studentId) {
        setStudentDetail(null);
        return;
      }
      try {
        const detail = await getSiswaDetail(Number(studentId));
        setStudentDetail(detail);
        
        // Auto-fill parent TTL from database if available
        if (detail.orang_tua && detail.orang_tua.length > 0) {
          const mainParent = detail.orang_tua.find(ot => ot.hubungan.toLowerCase() === 'ayah') || detail.orang_tua[0];
          const place = mainParent.tempat_lahir || "";
          const date = mainParent.tanggal_lahir || "";
          if (place || date) {
            setParentTTL(`${place}${place && date ? ', ' : ''}${date}`);
          } else {
            setParentTTL("");
          }
        } else {
          setParentTTL("");
        }
      } catch (error) {
        console.error("Failed to fetch student detail:", error);
      }
    };
    fetchDetail();
  }, [studentId]);

  const student = students.find((s) => s.id.toString() === studentId);
  const template = dummyLetterTemplates.find((t) => t.id === templateId);
  const studentViolations = student ? violations.filter((v) => v.nis === student.nis?.toString()) : [];

  const nextNumber = (suratHistory.length + 1).toString().padStart(3, '0');
  const generatedNomorSurat = `${nextNumber}/SMKTI/B/I/${new Date().getFullYear()}`;

  const handlePrint = async () => {
    if (!student || !template) return;

    const baseUrl = window.location.origin;
    const today = new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' });
    const printDate = customDate ? new Date(customDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' }) : today;
    const printKeperluan = customKeperluan || `Pembahasan Poin Pelanggaran (${student.total_poin} poin)`;
    let printContent = "";

    let parentName = "Orang Tua / Wali";
    let parentAddress = "";
    let parentPhone = "";
    let parentJob = "";
    if (studentDetail && studentDetail.orang_tua && studentDetail.orang_tua.length > 0) {
      const ayah = studentDetail.orang_tua.find(ot => ot.hubungan.toLowerCase() === 'ayah');
      if (ayah) {
        parentName = ayah.nama;
        parentAddress = ayah.alamat;
        parentPhone = ayah.telp;
        parentJob = ayah.pekerjaan;
      } else {
        parentName = studentDetail.orang_tua[0].nama;
        parentAddress = studentDetail.orang_tua[0].alamat;
        parentPhone = studentDetail.orang_tua[0].telp;
        parentJob = studentDetail.orang_tua[0].pekerjaan;
      }
    }

    // Generate nomor surat
    const nomorSurat = generatedNomorSurat;

    if (template.id === "lt7") {
      const bkTeacher = teachers.find(t => t.id.toString() === guruBKId)?.nama || "..............................................";
      const waliTeacher = teachers.find(t => t.id.toString() === guruWaliId)?.nama || "..............................................";

      printContent = `
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Surat Pernyataan Siswa - ${student.nama}</title>
    <style>
      @page { size: A4; margin: 0; }
      body { font-family: "Times New Roman", serif; font-size: 11pt; line-height: 1.4; padding: 0cm 2cm; }
      p { margin: 8px 0; }
      .judul { text-align: center; font-weight: bold; text-transform: uppercase; margin-top: 15px; margin-bottom: 20px; font-size: 13pt; border-bottom: none; }
      .identitas { margin-bottom: 10px; width: 100%; border-collapse: collapse; }
      .identitas td { vertical-align: top; padding: 3px 0; line-height: 1.6; }
      .identitas td:first-child { width: 160px; }
      .identitas td:nth-child(2) { width: 20px; text-align: center; }
      .paragraf { text-align: justify; margin-top: 15px; }
      .ttd-table { width: 100%; margin-top: 30px; border-collapse: collapse; }
      .ttd-table td { text-align: center; vertical-align: top; padding: 10px 0; border: none; width: 50%; }
      .spasi-ttd { height: 60px; }
      .kop { text-align: center; margin-bottom: 10px; border-bottom: 3px double black; padding-bottom: 5px; }
      .kop img { width: 100%; object-fit: contain; }
      .masalah-box { min-height: 40px; margin-bottom: 15px; }
    </style>
  </head>
  <body>
    <div class="kop">
        <img src="${baseUrl}/kop_surat.jpg" alt="Kop Surat">
    </div>
    
    <div class="judul">SURAT PERNYATAAN SISWA</div>

    <p>Yang bertandatangan di bawah ini :</p>

    <table class="identitas">
      <tr><td>Nama</td><td>:</td><td><strong>${student.nama}</strong></td></tr>
      <tr><td>NIS</td><td>:</td><td>${student.nis}</td></tr>
      <tr><td>Kelas</td><td>:</td><td>${student.kelas}</td></tr>
      <tr><td>Program Keahlian</td><td>:</td><td>${student.jurusan}</td></tr>
      <tr>
        <td style="vertical-align: top;">Masalah</td>
        <td style="vertical-align: top;">:</td>
        <td style="white-space: pre-line; vertical-align: top; padding-bottom: 10px;">${printKeperluan}</td>
      </tr>
    </table>

    <table class="identitas" style="margin-top: 20px;">
      <tr><td>Nama Orang Tua</td><td>:</td><td><strong>${parentName}</strong></td></tr>
      <tr><td>Pekerjaan</td><td>:</td><td>${parentJob || '..............................................'}</td></tr>
      <tr><td>Alamat Rumah</td><td>:</td><td>${parentAddress}</td></tr>
      <tr><td>No. Hp./Telp.</td><td>:</td><td>${parentPhone}</td></tr>
    </table>

    <p class="paragraf">
      Menyatakan dan berjanji akan bersungguh-sungguh berubah dan bersedia mentaati aturan dan tata tertib sekolah. Apabila selama masa pembinaan tidak mengalami perubahan, maka siswa yang bersangkutan dikembalikan kepada orang tua/wali.
    </p>

    <p class="paragraf">
      Demikian surat pernyataan ini saya buat dengan sesungguhnya tanpa ada paksaan dari siapapun.
    </p>

    <table class="ttd-table">
      <tr>
        <td>
          Mengetahui,<br />
          Orang Tua/Wali siswa
          <div class="spasi-ttd"></div>
          <strong>${parentName}</strong>
        </td>
        <td>
          Denpasar, ${printDate}<br />
          Siswa yang bersangkutan
          <div class="spasi-ttd"></div>
          <strong>${student.nama}</strong>
        </td>
      </tr>
      <tr>
        <td>
          Guru Bimbingan Konseling
          <div class="spasi-ttd"></div>
          <strong>${bkTeacher}</strong>
        </td>
        <td>
          Guru Wali Kelas
          <div class="spasi-ttd"></div>
          <strong>${waliTeacher}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <br/>Mengetahui,<br />
          Wakasek Kesiswaan
          <div class="spasi-ttd" style="height: 50px;"></div>
          <strong>Bagus Putu Eka Wijaya, S.Kom</strong>
        </td>
      </tr>
    </table>
  </body>
</html>
      `;
    } else if (template.name.includes("Berhenti") || template.type === "Pemberhentian") {
      printContent = `
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Surat Pemberhentian - ${student.nama}</title>
    <style>
      @page { size: A4; margin: 0; }
      body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.5; padding: 0cm 2cm; }
      p { margin: 12px 0; }
      .judul { text-align: center; font-weight: bold; text-transform: uppercase; margin-bottom: 30px; }
      .identitas { margin-bottom: 20px; }
      .identitas td:first-child { width: 100px; }
      .paragraf { text-align: justify; margin-top: 20px; }
      .ttd-container { width: 100%; margin-top: 50px; display: flex; justify-content: flex-end; }
      .ttd { width: 40%; text-align: left; }
      .spasi-ttd { height: 70px; }
      .kop { text-align: center; margin-bottom: 20px; }
      .kop img { width: 100%; object-fit: contain; }
    </style>
  </head>
  <body>
    <div class="kop">
        <img src="${baseUrl}/kop_surat.jpg" alt="Kop Surat">
    </div>
    <p>
      Kepada<br />
      Yth. Bapak Kepala Sekolah<br />
      SMK TI Bali Global Denpasar<br />
      Di Tempat
    </p>

    <p>Dengan Hormat, yang bertanda tangan dibawah ini :</p>

    <table class="identitas">
      <tr><td>Nama</td><td>: <strong>${parentName}</strong></td></tr>
      <tr><td>Alamat</td><td>: ${parentAddress}</td></tr>
      <tr><td>Telp</td><td>: ${parentPhone}</td></tr>
    </table>

    <p>Dengan ini menerangkan bahwa anak kami :</p>

    <table class="identitas">
      <tr><td>Nama</td><td>: <strong>${student.nama}</strong></td></tr>
      <tr><td>Kelas/Jurusan</td><td>: ${student.kelas} ${student.jurusan}</td></tr>
      <tr><td>NIS</td><td>: ${student.nis}</td></tr>
    </table>

    <p class="paragraf">
      Menyatakan bahwa mengundurkan diri dari sekolah SMK TI Bali Global
      Denpasar dikarenakan <strong>${printKeperluan}</strong>, serta telah menyelesaikan seluruh administrasi sekolah.
      <br/><br/>
      Demikian surat ini kami buat dengan sebenarnya tanpa ada paksaan apapun
      dan agar Bapak/Ibu maklum adanya.
    </p>

    <div class="ttd-container">
      <div class="ttd">
        Denpasar, ${printDate}<br />
        Hormat Kami,
        <div class="spasi-ttd"></div>
        <b>${parentName}</b>
      </div>
    </div>
  </body>
</html>
      `;
    } else if (template.id === "lt6" || template.name.includes("Pernyataan")) {
      // Calculate 1 month later for NB
      const baseDate = customDate ? new Date(customDate) : new Date();
      const nextMonth = new Date(baseDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nbMonthStr = nextMonth.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' });

      printContent = `
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Surat Pernyataan Orang Tua - ${student.nama}</title>
    <style>
      @page { size: A4; margin: 0; }
      body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.5; padding: 0cm 2cm; }
      p { margin: 10px 0; }
      .judul { text-align: center; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin-top: 20px; margin-bottom: 30px; font-size: 14pt; }
      .identitas { margin-bottom: 20px; width: 100%; }
      .identitas td { vertical-align: top; padding: 2px 0; }
      .identitas td:first-child { width: 180px; }
      .identitas td:nth-child(2) { width: 20px; text-align: center; }
      .paragraf { text-align: justify; margin-top: 20px; text-indent: 0; }
      .ttd-container { width: 100%; margin-top: 40px; display: flex; justify-content: flex-end; }
      .ttd { width: 50%; text-align: center; }
      .spasi-ttd { height: 80px; }
      .kop { text-align: center; margin-bottom: 10px; border-bottom: 3px solid black; padding-bottom: 5px; }
      .kop img { width: 100%; object-fit: contain; }
      .nb { margin-top: 40px; font-weight: normal; }
      .nb-line { text-decoration: underline; margin-top: 5px; display: block; }
    </style>
  </head>
  <body>
    <div class="kop">
        <img src="${baseUrl}/kop_surat.jpg" alt="Kop Surat">
    </div>
    
    <div class="judul">SURAT PERNYATAAN ORANG TUA</div>

    <p>Yang bertandatangan di bawah ini orang tua/ wali siswa SMK TI Bali Global Denpasar :</p>

    <table class="identitas">
      <tr><td>Nama</td><td>:</td><td><strong>${parentName}</strong></td></tr>
      <tr><td>Tempat/ tanggal Lahir</td><td>:</td><td>${parentTTL || '..............................................'}</td></tr>
      <tr><td>Pekerjaan</td><td>:</td><td>${parentJob || '..............................................'}</td></tr>
      <tr><td>Alamat Rumah</td><td>:</td><td>${parentAddress}</td></tr>
      <tr><td>No. Hp./Telp.</td><td>:</td><td>${parentPhone}</td></tr>
    </table>

    <p class="paragraf">
      Menyatakan memang benar sanggup membina anak kami yang bernama <strong>${student.nama}</strong>, 
      Kelas : <strong>${student.kelas} ${student.jurusan}</strong> untuk lebih disiplin mengikuti proses pembelajaran dan mengikuti Tata Tertib Sekolah.
    </p>

    <p class="paragraf">
      Demikianlah pernyataan kami dan jika tidak sesuai dengan pernyataan diatas, anak kami dapat dikeluarkan dari sekolah ini dengan rekomendasi pindah ke SMK lain yang serumpun.
    </p>

    <div class="ttd-container">
      <div class="ttd">
        Denpasar, ${printDate}<br />
        Yang membuat pernyataan<br />
        Orang Tua/Wali siswa
        <div class="spasi-ttd"></div>
        ${parentName}
      </div>
    </div>

    <div class="nb">
      <strong>NB:</strong>
      <p class="nb-line">Jika siswa tidak bisa mengikuti proses pembelajaran sampai bulan ${nbMonthStr} maka</p>
      <p class="nb-line">Siswa dinyatakan mengundurkan diri.</p>
    </div>
  </body>
</html>
      `;
    } else {
      printContent = `
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Pemanggilan Orang Tua - ${student.nama}</title>
    <style>
      @page { size: A4; margin: 0; }
      body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.5; padding: 0cm 2cm; }
      table { border-collapse: collapse; }
      p { margin: 0; }
      .kop { text-align: center; margin-bottom: 20px; }
      .kop img { width: 100%; object-fit: contain; }
      .header td { vertical-align: top; }
      .header td:first-child { width: 80px; }
      .identitas{ margin-left: 30px; }
      .identitas td { padding: 2px 6px; }
      .identitas td:first-child { width: 200px; }
      .pembuka { margin-top: 20px; }
      .detail { margin-left: 30px; margin-top: 10px; }
      .detail td { padding: 2px 6px; }
      .detail td:first-child { width: 150px; }
      .ttd { width: 100%; margin-top: 50px; text-align: center; }
      .ttd td { width: 50%; vertical-align: top; border: none; padding: 0; }
      .spasi-ttd { height: 70px; }
      .table-pelanggaran { width: 100%; border-collapse: collapse; margin-top: 10px; text-align: left; }
      .table-pelanggaran th, .table-pelanggaran td { border: 1px solid black; padding: 8px; }
    </style>
  </head>
  <body>
    <div class="kop">
        <img src="${baseUrl}/kop_surat.jpg" alt="Kop Surat">
    </div>

    <table class="header">
      <tr><td>No.</td><td>: ${nomorSurat}</td></tr>
      <tr><td>Lamp.</td><td>: -</td></tr>
      <tr><td>Perihal</td><td>: ${template.name}</td></tr>
    </table>
    <br />

    <div class="tujuan">
      <p>Kepada</p>
      <p>Yth. Bapak / Ibu</p>
      <table class="identitas">
        <tr><td>Nama Orang Tua/Wali</td><td>: ${parentName}</td></tr>
        <tr><td>Siswa</td><td>: ${student.nama}</td></tr>
        <tr><td>Kelas / NIS</td><td>: ${student.kelas} ${student.jurusan} / ${student.nis}</td></tr>
      </table>
    </div>

    <p class="pembuka">Dengan hormat,</p>
    <p class="isi">
      ${template.content} Bersama surat ini, kami mengharapkan kehadiran Bapak / Ibu pada :
    </p>

    <table class="detail">
      <tr><td>Hari / Tanggal</td><td>: ${customDate ? printDate : `Besok, ${printDate}`}</td></tr>
      <tr><td>Pukul</td><td>: 08.00 WITA</td></tr>
      <tr><td>Tempat</td><td>: Ruang BK SMK TI Bali Global Denpasar</td></tr>
      <tr><td>Keperluan</td><td>: ${printKeperluan}</td></tr>
    </table>

    ${studentViolations.length > 0 ? `
    <div style="margin-top: 20px;">
      <p>Berikut adalah catatan pelanggaran terakhir siswa:</p>
      <table class="table-pelanggaran">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Pelanggaran</th>
            <th>Poin</th>
          </tr>
        </thead>
        <tbody>
          ${studentViolations.slice(0, 3).map(v => `
            <tr>
              <td>${new Date(v.created_at).toLocaleDateString("id-ID")}</td>
              <td>${v.nama_pelanggaran}</td>
              <td>${v.poin}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <p class="penutup">
      Demikian surat ini kami sampaikan, besar harapan kami pertemuan ini agar
      tidak diwakilkan. Atas perhatian dan kerjasamanya, kami ucapkan
      terimakasih.
    </p>

    <table class="ttd">
      <tr>
        <td>
          Mengetahui,<br />
          Waka Kesiswaan
          <div class="spasi-ttd"></div>
          <b>Bagus Putu Eka Wijaya, S.Kom</b>
        </td>
        <td>
          Denpasar, ${today}<br />
          Guru BK
          <div class="spasi-ttd"></div>
          <b>I Gusti Ayu Rinjani, M.Pd</b>
        </td>
      </tr>
    </table>
  </body>
</html>
      `;
    }

    // Save log to database via API
    try {
      const payloadDate = customDate || new Date().toISOString().split('T')[0];
      await createSurat({
        id_siswa: student.id,
        jenis_surat: template.type || "Panggilan",
        nomor_surat: nomorSurat,
        tanggal_surat: payloadDate,
        keterangan: customKeperluan ? `Mencetak ${template.name} - ${customKeperluan}` : `Mencetak ${template.name} untuk ${student.nama}`
      });
      toast({ title: "Berhasil", description: "Riwayat surat berhasil disimpan." });

      // Refetch history
      try {
        const updatedHistory = await getSuratList();
        setSuratHistory(updatedHistory);
      } catch (err) {
        console.error("Failed to refetch history:", err);
      }

    } catch (error) {
      console.error("Gagal menyimpan riwayat surat:", error);
      toast({ title: "Gagal", description: "Terjadi kesalahan saat menyimpan riwayat surat.", variant: "destructive" });
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      // Delay to ensure the image is loaded before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 800);
    } else {
      toast({ title: "Gagal memuat popup", description: "Buka blokir pop-up browser Anda untuk mencetak surat.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="page-header">Cetak Surat Panggilan</h1>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s ? "bg-primary text-primary-foreground" :
                  step > s ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-primary/20" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Pilih Jenis Surat</h2>
                <p className="text-sm text-muted-foreground">Tentukan format surat yang ingin dicetak</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dummyLetterTemplates.map((t) => (
                  <div
                    key={t.id}
                    className={`p-6 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-lg ${templateId === t.id
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                      }`}
                    onClick={() => {
                      setTemplateId(t.id);
                      setStep(2);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg transition-colors ${templateId === t.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                        }`}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{t.name}</h3>
                        <p className="text-sm text-muted-foreground">{t.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Masukkan Data</h2>
                <p className="text-sm text-muted-foreground">Lengkapi informasi siswa dan detail pemanggilan</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pilih Siswa</Label>
                    <Select value={studentId} onValueChange={setStudentId}>
                      <SelectTrigger><SelectValue placeholder="Cari nama siswa..." /></SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.nama} - {s.kelas} {s.jurusan}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal Pemanggilan</Label>
                    <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Kosongkan untuk menggunakan tanggal besok (otomatis)</p>
                  </div>

                  {templateId !== "lt6" && (
                    <div className="space-y-2">
                      <Label>{templateId === "lt7" ? "Masalah (Input Manual)" : "Keterangan / Keperluan (Opsional)"}</Label>
                      <Textarea
                        placeholder={templateId === "lt7" ? "Sebutkan masalah atau pelanggaran yang dilakukan..." : "Contoh: Diskusi pelanggaran kedisplinan"}
                        className="min-h-[100px]"
                        value={customKeperluan}
                        onChange={(e) => setCustomKeperluan(e.target.value)}
                      />
                    </div>
                  )}

                  {templateId === "lt7" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <Label>Pilih Guru BK</Label>
                        <Select value={guruBKId} onValueChange={setGuruBKId}>
                          <SelectTrigger><SelectValue placeholder="Pilih Guru BK..." /></SelectTrigger>
                          <SelectContent>
                            {teachers.filter(t => t.role === 'bk' || t.role === 'admin').map((t) => (
                              <SelectItem key={t.id} value={t.id.toString()}>{t.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Pilih Wali Kelas</Label>
                        <Select value={guruWaliId} onValueChange={setGuruWaliId}>
                          <SelectTrigger><SelectValue placeholder="Pilih Wali Kelas..." /></SelectTrigger>
                          <SelectContent>
                            {teachers.map((t) => (
                              <SelectItem key={t.id} value={t.id.toString()}>{t.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {templateId === "lt6" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label>Tempat/Tanggal Lahir Orang Tua</Label>
                      <Input
                        placeholder="Contoh: Denpasar, 12 Mei 1980"
                        value={parentTTL}
                        onChange={(e) => setParentTTL(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground font-medium text-emerald-600 dark:text-emerald-400">Data otomatis terisi dari basis data.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Pratinjau Data Siswa</Label>
                  {student ? (
                    <div className="p-5 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                          {student.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-lg leading-tight">{student.nama}</p>
                          <p className="text-sm text-muted-foreground">{student.kelas} {student.jurusan} • {student.nis}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 rounded-lg bg-background border border-border/50">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Total Poin</p>
                          <p className="text-lg font-bold text-primary">{student.total_poin}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-background border border-border/50">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Pelanggaran</p>
                          <p className="text-lg font-bold">{studentViolations.length}</p>
                        </div>
                      </div>

                      {studentDetail && (
                        <div className="space-y-2 pt-2 border-t border-border/50 mt-2">
                          <p className="text-xs flex justify-between">
                            <span className="text-muted-foreground">Orang Tua/Wali:</span>
                            <span className="font-medium">{studentDetail.orang_tua && studentDetail.orang_tua.length > 0 ? (studentDetail.orang_tua.find(ot => ot.hubungan.toLowerCase() === 'ayah')?.nama || studentDetail.orang_tua[0].nama) : '-'}</span>
                          </p>
                          <p className="text-xs flex justify-between">
                            <span className="text-muted-foreground">Template:</span>
                            <span className="font-medium text-primary">{template?.name}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[250px] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-6 bg-muted/10">
                      <div className="p-3 bg-muted rounded-full mb-3 text-muted-foreground">
                        <Printer className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Silakan pilih siswa untuk melihat detail</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border/50">
                <Button variant="ghost" onClick={() => setStep(1)}>Kembali</Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!studentId}
                  className="px-8"
                >
                  Lanjut ke Ringkasan
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Tinjauan & Cetak</h2>
                <p className="text-sm text-muted-foreground">Periksa kembali data sebelum surat dicetak</p>
              </div>

              <div className="bg-muted/20 rounded-2xl border border-border p-8 space-y-8 max-w-2xl mx-auto shadow-inner">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 bg-primary/10 text-primary rounded-2xl mb-2">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold">{template?.name}</h3>
                  <p className="text-muted-foreground">Nomor Surat: <span className="text-foreground font-mono">{generatedNomorSurat}</span></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-border/50">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Informasi Siswa</p>
                      <p className="font-bold text-lg">{student?.nama}</p>
                      <p className="text-sm text-muted-foreground">{student?.kelas} {student?.jurusan} / {student?.nis}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Orang Tua / Wali</p>
                      <p className="font-semibold text-base">{studentDetail?.orang_tua && studentDetail.orang_tua.length > 0 ? (studentDetail.orang_tua.find(ot => ot.hubungan.toLowerCase() === 'ayah')?.nama || studentDetail.orang_tua[0].nama) : '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Jadwal Pemanggilan</p>
                      <p className="font-bold text-lg">{customDate ? new Date(customDate).toLocaleDateString("id-ID", { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : `Besok, ${new Date(Date.now() + 86400000).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })}`}</p>
                      <p className="text-sm text-muted-foreground">Pukul 08.00 WITA</p>
                    </div>
                    {templateId !== "lt6" && (
                      <div className={templateId === "lt7" ? "md:col-span-2" : ""}>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{templateId === "lt7" ? "Masalah" : "Keperluan"}</p>
                        <p className="text-sm">{customKeperluan || (templateId === "lt7" ? "-" : `Pembahasan Poin Pelanggaran`)}</p>
                      </div>
                    )}
                    {templateId === "lt7" && (
                      <>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Guru BK</p>
                          <p className="font-semibold text-base">{teachers.find(t => t.id.toString() === guruBKId)?.nama || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Wali Kelas</p>
                          <p className="font-semibold text-base">{teachers.find(t => t.id.toString() === guruWaliId)?.nama || '-'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 flex items-start gap-3">
                  <div className="p-1 bg-primary text-primary-foreground rounded-full mt-0.5">
                    <Printer className="h-3 w-3" />
                  </div>
                  <p className="text-xs text-gray leading-relaxed text-muted-foreground">
                    Menekan tombol cetak akan membuka jendela print browser dan otomatis menyimpan riwayat pembuatan surat ini di database.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border/50">
                <Button variant="ghost" onClick={() => setStep(2)}>Kembali</Button>
                <Button
                  onClick={handlePrint}
                  className="px-10 h-12 text-lg font-bold"
                >
                  <Printer className="h-5 w-5 mr-2" /> Cetak Sekarang
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6 flex flex-col h-[600px] sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-muted rounded-lg">
              <Printer className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Riwayat Terakhir</h2>
          </div>

          <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
            {suratHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-3 bg-muted rounded-full mb-3">
                  <Printer className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Belum ada riwayat</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Riwayat cetak surat akan muncul di sini.
                </p>
              </div>
            ) : (
              suratHistory.map((surat) => (
                <div key={surat.id} className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-all group">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-xs truncate max-w-[120px]">{surat.jenis_surat}</h3>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {new Date(surat.tanggal_surat).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-primary mb-1 truncate">{surat.nama_siswa}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{surat.nomor_surat}</p>
                </div>
              ))
            )}
          </div>

          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => {
            // Future link to full library
          }}> Lihat Semua Riwayat </Button>
        </div>
      </div>
    </div>
  );
}
