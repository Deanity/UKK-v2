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
  `hubungan` enum('ayah','ibu') NOT NULL,
  `telp` varchar(20) DEFAULT NULL,
  `pekerjaan` varchar(100) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `orang_tua` (`id`, `id_siswa`, `nama`, `hubungan`, `telp`, `pekerjaan`, `alamat`, `created_at`, `updated_at`, `deleted_at`) VALUES
(23, 19, 'Ayah', 'ayah', '1234567890', 'Presiden', 'Sidakarya Street No.144 AD', '2026-04-01 14:46:27', '2026-04-02 15:41:10', NULL),
(24, 19, 'Ibu', 'ibu', '1234567890', 'Istri Presiden', 'Sidakarya Street No.144 AD', '2026-04-02 15:41:10', NULL, NULL);

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

INSERT INTO `pelanggaran` (`id`, `id_jenis_pelanggaran`, `id_siswa`, `poin`, `keterangan`, `created_at`, `updated_at`, `deleted_at`) VALUES
(48, 12, 19, 15, 'Kesopanan Berkendara. Tidak Memakai Helm', '2026-04-01 14:46:41', NULL, NULL),
(49, 8, 19, 20, 'Telat Masuk Sekolah', '2026-01-05 07:15:00', NULL, NULL),
(50, 9, 19, 15, 'Main HP Saat Pelajaran', '2026-01-10 09:20:00', NULL, NULL),
(51, 7, 19, 10, 'Tidak Memakai Dasi', '2026-01-15 07:10:00', NULL, NULL),
(52, 8, 19, 20, 'Telat Masuk Sekolah', '2026-02-03 07:25:00', NULL, NULL),
(53, 13, 19, 15, 'Tidak Membawa Topi Upacara', '2026-02-10 07:05:00', NULL, NULL),
(54, 9, 19, 15, 'Main HP Saat Pelajaran', '2026-02-18 10:00:00', NULL, NULL),
(55, 10, 19, 20, 'Tidak Sopan Pada Guru', '2026-03-02 08:30:00', NULL, NULL),
(56, 8, 19, 20, 'Telat Masuk Sekolah', '2026-03-08 07:40:00', NULL, NULL),
(57, 12, 19, 15, 'Tidak Memakai Helm', '2026-03-12 07:50:00', NULL, NULL),
(58, 9, 19, 15, 'Main HP Saat Pelajaran', '2026-04-01 09:10:00', NULL, NULL),
(59, 7, 19, 10, 'Tidak Memakai Dasi', '2026-04-05 07:05:00', NULL, NULL),
(60, 8, 19, 20, 'Telat Masuk Sekolah', '2026-04-09 07:30:00', NULL, NULL),
(61, 10, 19, 20, 'Tidak Sopan Pada Guru', '2026-05-06 08:45:00', NULL, NULL),
(62, 13, 19, 15, 'Tidak Membawa Topi Upacara', '2026-05-12 07:00:00', NULL, NULL),
(63, 12, 19, 15, 'Tidak Memakai Helm', '2026-05-20 07:55:00', NULL, NULL),
(64, 8, 19, 20, 'Telat Masuk Sekolah', '2026-06-03 07:35:00', NULL, NULL),
(65, 9, 19, 15, 'Main HP Saat Pelajaran', '2026-06-10 09:15:00', NULL, NULL),
(66, 7, 19, 10, 'Tidak Memakai Dasi', '2026-06-18 07:00:00', NULL, NULL),
(67, 8, 19, 20, 'Telat Masuk Sekolah', '2026-07-02 07:30:00', NULL, NULL),
(68, 8, 19, 20, 'Telat Masuk Sekolah', '2026-07-04 07:45:00', NULL, NULL),
(69, 9, 19, 15, 'Main HP Saat Pelajaran', '2026-07-08 09:00:00', NULL, NULL),
(70, 10, 19, 20, 'Tidak Sopan Pada Guru', '2026-07-12 08:20:00', NULL, NULL),
(71, 7, 19, 10, 'Tidak Memakai Dasi', '2026-08-05 07:10:00', NULL, NULL),
(72, 9, 19, 15, 'Main HP Saat Pelajaran', '2026-08-11 09:30:00', NULL, NULL),
(73, 8, 19, 20, 'Telat Masuk Sekolah', '2026-09-03 07:25:00', NULL, NULL),
(74, 8, 19, 20, 'Telat Masuk Sekolah', '2026-09-06 07:40:00', NULL, NULL),
(75, 12, 19, 15, 'Tidak Memakai Helm', '2026-09-10 07:50:00', NULL, NULL),
(76, 9, 19, 15, 'Main HP Saat Pelajaran', '2026-09-15 10:10:00', NULL, NULL),
(77, 7, 19, 10, 'Tidak Memakai Dasi', '2026-10-02 07:05:00', NULL, NULL),
(78, 13, 19, 15, 'Tidak Membawa Topi Upacara', '2026-10-09 07:00:00', NULL, NULL),
(79, 8, 19, 20, 'Telat Masuk Sekolah', '2026-11-01 07:30:00', NULL, NULL),
(80, 8, 19, 20, 'Telat Masuk Sekolah', '2026-11-03 07:35:00', NULL, NULL),
(81, 9, 19, 15, 'Main HP Saat Pelajaran', '2026-11-07 09:25:00', NULL, NULL),
(82, 10, 19, 20, 'Tidak Sopan Pada Guru', '2026-11-14 08:50:00', NULL, NULL),
(83, 12, 19, 15, 'Tidak Memakai Helm', '2026-11-20 07:55:00', NULL, NULL),
(84, 7, 19, 10, 'Tidak Memakai Dasi', '2026-12-05 07:00:00', NULL, NULL);

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

INSERT INTO `siswa` (`id`, `username`, `password`, `nama`, `nis`, `kelas`, `jurusan`, `jenis_kelamin`, `alamat`, `no_telp`, `email`, `poin`, `total_poin`, `created_at`, `updated_at`, `deleted_at`) VALUES
(19, 'siswa1', '$2y$10$nt5vDvRRadmmScmF4fM/1OYuMGp7YxLnY2aVfWA9SYFiRDHymMTi.', 'Anindhity', 6672, 'X ', 'RPL', 'P', 'Sidakarya Street No.144 AD', '0987654321', 'anin@gmail.com', 15, 15, '2026-04-01 14:46:27', '2026-04-02 15:41:10', NULL);

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

INSERT INTO `surat` (`id`, `jenis_surat`, `nomor_surat`, `tanggal_surat`, `id_siswa`, `keterangan`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(6, 'Panggilan', '001/SMKTI/B/I/2026', '2026-04-06', 19, 'Mencetak Surat Panggilan Orang Tua untuk Anindhity', 'Sistem', '2026-04-02 15:39:25', NULL, NULL);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

ALTER TABLE `pelanggaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

ALTER TABLE `siswa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

ALTER TABLE `surat`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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