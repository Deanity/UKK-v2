SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `guru` (
  `id` int NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `kode_guru` varchar(20) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','guru','bk') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `guru` (`id`, `username`, `password`, `nama`, `kode_guru`, `jenis_kelamin`, `email`, `role`, `created_at`, `updated_at`, `deleted_at`) VALUES
(11, 'admin', '$2y$10$QchxcBg.etuUEM9f3Ji0Pupkb2K.Cra9iMX.5PPtNLptFcTF88/pW', 'Pak Budi', 'ADM001', 'L', 'budi@guru.id', 'admin', '2026-02-12 20:25:13', NULL, NULL),
(12, 'guru1', '$2y$10$qIUwwoCRz7o4cb6UAKlnHOYJz5U90GgdFrImjTSYM6VF5cGaLm0LK', 'Pak Yoga', 'GR001', 'L', 'yoga@guru.id', 'guru', '2026-02-12 20:26:16', NULL, NULL),
(13, 'bk1', '$2y$10$.4H2EkWR08Lgw6Onh.tQ2.D7lByXD2IqE2p1Nh3Z3tsvuHctxL9S.', 'Ibu Yeni', 'BK001', 'P', 'yeni@guru.id', 'bk', '2026-02-12 20:27:03', NULL, NULL);

CREATE TABLE `jenis_pelanggaran` (
  `id` int NOT NULL,
  `kode_pelanggaran` varchar(20) DEFAULT NULL,
  `nama_pelanggaran` varchar(100) DEFAULT NULL,
  `sanksi_poin` int DEFAULT NULL,
  `deskripsi_sanksi` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `jenis_pelanggaran` (`id`, `kode_pelanggaran`, `nama_pelanggaran`, `sanksi_poin`, `deskripsi_sanksi`, `created_at`, `updated_at`, `deleted_at`) VALUES
(7, 'SS', 'Seragam Sekolah', 10, 'Tidak Bawa Dasi', '2026-02-21 06:04:08', NULL, NULL),
(8, 'KS', 'Kehadiran Di Sekolah', 20, 'Telat Masuk Sekolah', '2026-02-21 06:04:33', NULL, NULL),
(9, 'PBM', 'Proses Belajar Mengajar', 15, 'Main Handphone Saat Guru Menjelaskan', '2026-02-21 06:05:15', NULL, NULL),
(10, 'PNN', 'Pelanggaran Norma Norma', 20, 'Tidak Sopan Pada Guru', '2026-02-21 06:05:45', NULL, NULL),
(11, 'PB', 'Pelanggaran Berat', 50, 'Narkoba', '2026-02-21 06:06:07', NULL, NULL),
(12, 'KB', 'Kesopanan Berkendara', 15, 'Tidak Memakai Helm ', '2026-02-21 06:06:34', NULL, NULL),
(13, 'UB', 'Upacara Bendera', 15, 'Tidak Membawa Topi', '2026-02-21 06:07:09', NULL, NULL);

CREATE TABLE `laporan` (
  `id` int NOT NULL,
  `jenis_laporan` varchar(50) DEFAULT NULL,
  `id_surat` int DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `orang_tua` (
  `id` int NOT NULL,
  `id_siswa` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `hubungan` enum('ayah','ibu') NOT NULL,
  `telp` varchar(20) DEFAULT NULL,
  `pekerjaan` varchar(100) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `pelanggaran` (
  `id` int NOT NULL,
  `id_jenis_pelanggaran` int DEFAULT NULL,
  `id_siswa` int DEFAULT NULL,
  `poin` int DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `siswa` (
  `id` int NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `nis` int NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `jurusan` varchar(50) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `alamat` varchar(255) NOT NULL,
  `no_telp` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `poin` int NOT NULL DEFAULT '0',
  `total_poin` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `surat` (
  `id` int NOT NULL,
  `jenis_surat` varchar(50) DEFAULT NULL,
  `nomor_surat` varchar(50) DEFAULT NULL,
  `tanggal_surat` date DEFAULT NULL,
  `id_siswa` int DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `guru`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

ALTER TABLE `jenis_pelanggaran`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `laporan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_laporan_surat` (`id_surat`);

ALTER TABLE `orang_tua`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orangtua_siswa` (`id_siswa`);

ALTER TABLE `pelanggaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pelanggaran_jenis` (`id_jenis_pelanggaran`),
  ADD KEY `fk_pelanggaran_siswa` (`id_siswa`);

ALTER TABLE `siswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

ALTER TABLE `surat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_surat_siswa` (`id_siswa`);

ALTER TABLE `guru`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

ALTER TABLE `jenis_pelanggaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

ALTER TABLE `laporan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `orang_tua`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

ALTER TABLE `pelanggaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

ALTER TABLE `siswa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

ALTER TABLE `surat`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `laporan`
  ADD CONSTRAINT `fk_laporan_surat` FOREIGN KEY (`id_surat`) REFERENCES `surat` (`id`);

ALTER TABLE `orang_tua`
  ADD CONSTRAINT `fk_orangtua_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`);

ALTER TABLE `pelanggaran`
  ADD CONSTRAINT `fk_pelanggaran_jenis` FOREIGN KEY (`id_jenis_pelanggaran`) REFERENCES `jenis_pelanggaran` (`id`),
  ADD CONSTRAINT `fk_pelanggaran_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`);

ALTER TABLE `surat`
  ADD CONSTRAINT `fk_surat_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`);

COMMIT;