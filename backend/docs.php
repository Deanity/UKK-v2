<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <!-- Highlight.js for JSON formatting -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
        }
        pre, code {
            font-family: 'Fira Code', monospace;
        }
        .method-badge {
            display: inline-block;
            padding: 0.25rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .method-GET { background-color: #0ea5e9; color: #fff; }
        .method-POST { background-color: #10b981; color: #fff; }
        .method-PUT { background-color: #f59e0b; color: #fff; }
        .method-DELETE { background-color: #ef4444; color: #fff; }
        
        .endpoint-card {
            transition: all 0.3s ease;
        }
        .endpoint-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        }

        /* Nav active state styling */
        .nav-link.active {
            color: #818cf8; /* Indigo-400 */
        }
        
        /* Underline animation for top nav */
        .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -2px;
            left: 50%;
            background-color: #818cf8;
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }
        .nav-link:hover::after, .nav-link.active::after {
            width: 100%;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #0f172a; 
        }
        ::-webkit-scrollbar-thumb {
            background: #334155; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #475569; 
        }

        /* Hide scrollbar for Horizontal top nav but keep functionality */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
    </style>
</head>
<body class="antialiased min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white bg-[#0B1120]">

    <!-- Top Navbar -->
    <header class="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6">
            <div class="flex items-center justify-between h-20">
                <!-- Logo -->
                <div class="flex items-center gap-3 shrink-0">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">API Docs</h1>
                        <p class="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Version 1.0.0</p>
                    </div>
                </div>

                <!-- Navigation Links (Scrollable on small screens) -->
                <nav id="top-nav" class="flex-1 overflow-x-auto no-scrollbar ml-8 flex items-center space-x-8 px-4">
                    <!-- Navigation Items Injected via JS -->
                </nav>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <header class="mb-16 border-b border-slate-800/60 pb-10 max-w-4xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-6 border border-indigo-500/20">
                <span class="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></span>
                Sistem Pelanggaran API
            </div>
            <h2 class="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white leading-tight">Dokumentasi Endpoints</h2>
            <p class="text-slate-400 text-lg md:text-xl leading-relaxed max-w-3xl">Referensi lengkap untuk integrasi API backend Sistem Pelanggaran Siswa. Semua permintaan masuk melalui prefix base URL <code class="bg-slate-800/80 px-2.5 py-1 rounded text-cyan-400 text-base font-mono border border-slate-700">/api</code>.</p>
            
            <!-- Global Config Card -->
            <div class="mt-8 p-6 bg-slate-800/40 border border-slate-700/80 rounded-2xl max-w-3xl flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="shrink-0 flex items-start justify-center md:pt-1">
                    <div class="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"></path></svg>
                    </div>
                </div>
                <div class="relative z-10">
                    <h4 class="text-base font-bold text-slate-200 mb-2">Konfigurasi Header Autentikasi</h4>
                    <p class="text-sm text-slate-400 mb-4 leading-relaxed">Untuk endpoint yang membutuhkan autentikasi (selain Login), selalu sertakan HTTP headers berikut pada setiap request untuk memvalidasi akses Bearer Token Anda.</p>
                    <code class="block bg-[#050914] p-4 rounded-xl text-emerald-400 text-sm border border-slate-700/50 shadow-inner font-mono leading-loose">
                        Authorization: Bearer <span class="text-slate-500">&lt;token_didapat_dari_login&gt;</span><br>
                        Accept: application/json<br>
                        Content-Type: application/json
                    </code>
                </div>
            </div>
        </header>

        <!-- Grid Layout for Content -->
        <div id="content-container" class="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-24 pb-24">
            <!-- Content Injected via JS -->
        </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 bg-slate-900/50 py-8 text-center text-slate-500 text-sm mt-auto">
        <p>&copy; 2026 Admin Panel &bull; Dokumen API Sistem Pelanggaran</p>
    </footer>

    <script>
        const apiData = [
            {
                category: "Authentication",
                id: "authentication",
                description: "Endpoint mengelola sesi login dan kredensial akses pengguna.",
                endpoints: [
                    { 
                        method: "POST", 
                        path: "/api/login", 
                        desc: "Melakukan verifikasi login pengguna dan menghasilkan token sesi.",
                        body: {
                            email: "admin@example.com",
                            password: "password123"
                        }
                    },
                    { 
                        method: "POST", 
                        path: "/api/logout", 
                        desc: "Mengakhiri sesi dan membersihkan kredensial login pengguna.",
                        headers: "Authorization: Bearer <token>"
                    }
                ]
            },
            {
                category: "User Session",
                id: "user-session",
                description: "Endpoint mendapatkan informasi terkait sesi aktif.",
                endpoints: [
                    { 
                        method: "GET", 
                        path: "/api/me", 
                        desc: "Mengambil data profil lengkap dari user yang sedang terautentikasi.",
                        headers: "Authorization: Bearer <token>"
                    }
                ]
            },
            {
                category: "Admin - Manajemen Siswa",
                id: "admin-siswa",
                description: "Operasi mengelola secara penuh data master siswa.",
                endpoints: [
                    { method: "GET", path: "/api/admin/siswa/show", desc: "Menampilkan daftar seluruh siswa terdaftar.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "POST", 
                        path: "/api/admin/siswa/create", 
                        desc: "Mendaftarkan data siswa baru.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            nis: "123456",
                            nama_lengkap: "Budi Santoso",
                            kelas: "X RPL 1",
                            jurusan: "RPL",
                            jenis_kelamin: "L"
                        }
                    },
                    { method: "GET", path: "/api/admin/siswa/{id}", desc: "Menampilkan atribut detail dari satu data siswa spesifik.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "PUT", 
                        path: "/api/admin/siswa/{id}", 
                        desc: "Memperbarui informasi pada data siswa terpilih.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            kelas: "XI RPL 1",
                            jurusan: "RPL"
                        }
                    },
                    { method: "DELETE", path: "/api/admin/siswa/{id}", desc: "Menghapus data siswa dari sistem secara permanen.", headers: "Authorization: Bearer <token>" }
                ]
            },
            {
                category: "Admin - Orang Tua",
                id: "admin-orang-tua",
                description: "Pengelolaan relasi data siswa dan wali terkait.",
                endpoints: [
                    { method: "GET", path: "/api/admin/siswa/{id}/orangtua", desc: "Mengambil daftar informasi seluruh orang tua yang direlasikan ke seorang siswa.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "POST", 
                        path: "/api/admin/siswa/{id}/orangtua", 
                        desc: "Menambah data orang tua dan menghubungkannya ke siswa.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            nama_lengkap: "Siti Nurhaliza",
                            hubungan: "Ibu",
                            no_telp: "08987654321",
                            alamat: "Jl. Mawar No. 12"
                        }
                    },
                    { 
                        method: "PUT", 
                        path: "/api/admin/orangtua/{id}", 
                        desc: "Mengubah atribut informasi orang tua.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            no_telp: "08111222333"
                        }
                    },
                    { method: "DELETE", path: "/api/admin/orangtua/{id}", desc: "Menghapus data rekaman orang tua spesifik dari sistem.", headers: "Authorization: Bearer <token>" }
                ]
            },
            {
                category: "Admin - Referensi Pelanggaran",
                id: "admin-jenis-pelanggaran",
                description: "Manajemen katalog referensi jenis pelanggaran.",
                endpoints: [
                    { method: "GET", path: "/api/admin/jenis-pelanggaran", desc: "Menampilkan semua list master data jenis pelanggaran.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "POST", 
                        path: "/api/admin/jenis-pelanggaran", 
                        desc: "Menambahkan parameter jenis pelanggaran baru (nama dan bobot).",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            nama_pelanggaran: "Terlambat Masuk Sekolah",
                            kategori: "Ringan",
                            poin: 10
                        }
                    },
                    { method: "GET", path: "/api/admin/jenis-pelanggaran/{id}", desc: "Menelusuri informasi detail dari jenis pelanggaran yang ada.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "PUT", 
                        path: "/api/admin/jenis-pelanggaran/{id}", 
                        desc: "Memperbarui informasi pada master jenis pelanggaran.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            poin: 15,
                            kategori: "Sedang"
                        }
                    },
                    { method: "DELETE", path: "/api/admin/jenis-pelanggaran/{id}", desc: "Mencabut jenis pelanggaran dari master data.", headers: "Authorization: Bearer <token>" }
                ]
            },
            {
                category: "Guru & Pencatatan",
                id: "guru-pelanggaran",
                description: "Operasional melapor dan mengelola catatan pelanggaran siswa.",
                endpoints: [
                    { method: "GET", path: "/api/guru/pelanggaran", desc: "Mengambil daftar laporan pelanggaran, dapat difilter sesuai role.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "POST", 
                        path: "/api/guru/pelanggaran", 
                        desc: "Memasukkan rekaman pelanggaran riil yang terjadi pada siswa.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            siswa_id: 1,
                            jenis_pelanggaran_id: 2,
                            catatan: "Terlambat 15 menit.",
                            tanggal: "2023-10-27"
                        }
                    },
                    { method: "GET", path: "/api/guru/pelanggaran/{id}", desc: "Membaca detail dari sebuah catatan pelanggaran spesifik.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "PUT", 
                        path: "/api/guru/pelanggaran/{id}", 
                        desc: "Mengoreksi atau mengubah rekaman riwayat laporan pelanggaran.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            catatan: "Terlambat 30 menit."
                        }
                    },
                    { method: "DELETE", path: "/api/guru/pelanggaran/{id}", desc: "Membatalkan / menghapus sebuah laporan pelanggaran.", headers: "Authorization: Bearer <token>" }
                ]
            },
            {
                category: "Admin - Manajemen Guru",
                id: "admin-guru",
                description: "Mengelola hak dan entitas guru dalam sistem.",
                endpoints: [
                    { method: "GET", path: "/api/admin/guru", desc: "Menampilkan semua daftar guru / pegawai terkait.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "POST", 
                        path: "/api/admin/guru", 
                        desc: "Mencatat atau meregistrasikan guru baru dalam sistem.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            nama: "Pak Budi Sujarwo",
                            nip: "198001012010011001",
                            mata_pelajaran: "Matematika",
                            password: "password123",
                            role: "guru"
                        }
                    },
                    { method: "GET", path: "/api/admin/guru/{id}", desc: "Mengakses detail data diri atau informasi login guru.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "PUT", 
                        path: "/api/admin/guru/{id}", 
                        desc: "Memperbarui identitas maupun password guru.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            mata_pelajaran: "Fisika"
                        }
                    },
                    { method: "DELETE", path: "/api/admin/guru/{id}", desc: "Menonaktifkan / menghapus guru dari sistem.", headers: "Authorization: Bearer <token>" }
                ]
            },
            {
                category: "Layanan BK - Dokumen & Surat",
                id: "bk-modul",
                description: "Layanan pembuatan dokumen resmi disiplin siswa.",
                endpoints: [
                    { method: "GET", path: "/api/bk/surat/panggilan/{id}", desc: "Melakukan rendering dokumen PDF Surat Panggilan.", headers: "Authorization: Bearer <token>" },
                    { method: "GET", path: "/api/bk/surat/pernyataan/{id}", desc: "Melakukan rendering dokumen PDF Surat Pernyataan / Pemberhentian.", headers: "Authorization: Bearer <token>" },
                    { method: "GET", path: "/api/bk/surat", desc: "Mengambil tabel histori dokumen surat yang dikeluarkan.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "POST", 
                        path: "/api/bk/surat", 
                        desc: "Membuat rekaman catatan untuk pengeluaran dokumen surat baru.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            siswa_id: 1,
                            jenis_surat: "Panggilan Orang Tua",
                            tanggal_surat: "2023-10-27"
                        }
                    },
                    { method: "GET", path: "/api/bk/surat/{id}", desc: "Menelusuri rincian spesifik satu dokumen surat.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "PUT", 
                        path: "/api/bk/surat/{id}", 
                        desc: "Memperbarui data pencatatan pengeluaran surat.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            status: "Terkirim ke Wali Kelas"
                        }
                    },
                    { method: "DELETE", path: "/api/bk/surat/{id}", desc: "Menghapus catatan histori pengeluaran surat.", headers: "Authorization: Bearer <token>" },
                    { method: "GET", path: "/api/bk/laporan", desc: "Menampilkan rekapitulasi pelaporan dari aktivitas Mediasi.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "POST", 
                        path: "/api/bk/laporan", 
                        desc: "Menambah input hasil mediasi atau pelaporan.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            siswa_id: 1,
                            tanggal_mediasi: "2023-10-28",
                            hasil_mediasi: "Siswa telah dinasehati.",
                            tindak_lanjut: "Pemantauan 1 bulan."
                        }
                    },
                    { method: "GET", path: "/api/bk/laporan/{id}", desc: "Menarik rangkuman catatan mediasi/pelaporan terpilih.", headers: "Authorization: Bearer <token>" },
                    { 
                        method: "PUT", 
                        path: "/api/bk/laporan/{id}", 
                        desc: "Mengubah rincian dan tindak lanjut laporan.",
                        headers: "Authorization: Bearer <token>",
                        body: {
                            tindak_lanjut: "Selesai dibina, poin diputihkan bertahap."
                        }
                    },
                    { method: "DELETE", path: "/api/bk/laporan/{id}", desc: "Menghapus dokumentasi laporan yang telah dibuat.", headers: "Authorization: Bearer <token>" }
                ]
            }
        ];

        const navContainer = document.getElementById('top-nav');
        const contentContainer = document.getElementById('content-container');

        // Function to copy text
        function copyText(button, textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = button.innerHTML;
                button.innerHTML = '<svg class="w-3.5 h-3.5 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Copied!';
                button.classList.add('text-emerald-400', 'bg-emerald-400/10');
                button.classList.remove('text-slate-300', 'bg-slate-800');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('text-emerald-400', 'bg-emerald-400/10');
                    button.classList.add('text-slate-300', 'bg-slate-800');
                }, 2000);
            });
        }

        apiData.forEach((section, index) => {
            // Render Top Nav Link
            const link = document.createElement('a');
            link.href = `#${section.id}`;
            link.className = "nav-link whitespace-nowrap relative py-2 text-slate-400 hover:text-white transition-colors duration-200 text-sm font-semibold tracking-wide";
            link.innerText = section.category;
            
            // Set first item active manually as default
            if(index === 0) {
                link.classList.add('text-indigo-400', 'active');
                link.classList.remove('text-slate-400');
            }

            navContainer.appendChild(link);

            // Render Content Section
            let endpointsHtml = section.endpoints.map((ep, epIndex) => {
                const bodyStr = ep.body ? JSON.stringify(ep.body, null, 2) : null;
                const headerStr = ep.headers || null;

                return `
                <div class="endpoint-card bg-slate-800/20 backdrop-blur-sm border border-slate-700/60 rounded-2xl overflow-hidden mb-6 group hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all duration-300 flex flex-col h-full shadow-lg shadow-black/10">
                    <div class="p-5 md:p-6 border-b border-slate-700/50 bg-slate-800/10 transition-colors">
                        <div class="flex items-center gap-4 mb-4">
                            <span class="method-badge method-${ep.method} min-w-[60px] text-center shadow-md">${ep.method}</span>
                            <span class="text-slate-200 font-mono text-sm md:text-[15px] font-semibold opacity-90 group-hover:text-indigo-300 transition-colors break-all">${ep.path}</span>
                        </div>
                        <div class="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700/50 pl-3">
                            ${ep.desc}
                        </div>
                    </div>
                    
                    ${(headerStr || bodyStr) ? `
                    <div class="p-5 md:p-6 flex flex-col gap-5 bg-[#070b14] flex-1">
                        ${headerStr ? `
                        <div>
                            <div class="flex items-center gap-2 mb-2.5">
                                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Headers Required</h4>
                            </div>
                            <code class="block w-full bg-[#0B1120] p-3 rounded-lg text-emerald-400/90 text-xs border border-slate-700/50 font-mono shadow-inner">${headerStr}</code>
                        </div>
                        ` : ''}

                        ${bodyStr ? `
                        <div class="mt-auto">
                            <div class="flex justify-between items-end mb-2.5">
                                <div class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Raw Body (JSON)</h4>
                                </div>
                                <button onclick='copyText(this, \`${bodyStr.replace(/`/g, "\\`")}\`)' class="flex items-center text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md transition-colors border border-slate-700 hover:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500">
                                    <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    Copy
                                </button>
                            </div>
                            <div class="relative rounded-lg overflow-hidden border border-slate-700/50 shadow-inner group/code">
                                <pre><code class="language-json text-xs p-4">${bodyStr}</code></pre>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    ` : `
                    <div class="p-6 flex flex-col items-center justify-center bg-[#070b14] flex-1 border-t border-slate-700/20">
                        <span class="text-xs font-medium text-slate-600 uppercase tracking-widest">No Payload Required</span>
                    </div>
                    `}
                </div>
            `;
            }).join('');

            const sectionHtml = `
                <section id="${section.id}" class="scroll-mt-32">
                    <div class="mb-10 flex items-center gap-4">
                        <div class="h-[1px] flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
                        <h3 class="text-3xl font-extrabold text-white tracking-tight shrink-0 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                            ${section.category}
                        </h3>
                        <div class="h-[1px] flex-1 bg-gradient-to-l from-slate-800 to-transparent"></div>
                    </div>
                    <p class="text-slate-400 mb-8 leading-relaxed text-[15px] max-w-lg mx-auto text-center">${section.description}</p>
                    <div class="grid grid-cols-1 gap-6">
                        ${endpointsHtml}
                    </div>
                </section>
            `;

            contentContainer.insertAdjacentHTML('beforeend', sectionHtml);
        });

        // Initialize Highlight.js
        hljs.highlightAll();

        // Highlight active navbar item on scroll
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        const topNav = document.getElementById('top-nav');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= sectionTop - 180) { // Offset for fixed navbar
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('text-indigo-400', 'active');
                link.classList.add('text-slate-400');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('text-indigo-400', 'active');
                    link.classList.remove('text-slate-400');
                    
                    // Smooth scroll navbar to active item
                    const navRect = topNav.getBoundingClientRect();
                    const linkRect = link.getBoundingClientRect();
                    if (linkRect.left < navRect.left || linkRect.right > navRect.right) {
                        topNav.scrollTo({
                            left: link.offsetLeft - topNav.offsetLeft - 40,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    </script>
</body>
</html>
