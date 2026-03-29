-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Feb 21, 2026 at 06:36 AM
-- Server version: 8.0.45
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_ukk`
--
CREATE DATABASE IF NOT EXISTS `db_ukk`;
USE `db_ukk`;

-- --------------------------------------------------------

--
-- Table structure for table `guru`
--

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

--
-- Dumping data for table `guru`
--

INSERT INTO `guru` (`id`, `username`, `password`, `nama`, `kode_guru`, `jenis_kelamin`, `email`, `role`, `created_at`, `updated_at`, `deleted_at`) VALUES
(11, 'admin', '$2y$10$QchxcBg.etuUEM9f3Ji0Pupkb2K.Cra9iMX.5PPtNLptFcTF88/pW', 'Pak Budi', 'ADM001', 'L', 'budi@guru.id', 'admin', '2026-02-12 20:25:13', NULL, NULL),
(12, 'guru1', '$2y$10$qIUwwoCRz7o4cb6UAKlnHOYJz5U90GgdFrImjTSYM6VF5cGaLm0LK', 'Pak Yoga', 'GR001', 'L', 'yoga@guru.id', 'guru', '2026-02-12 20:26:16', NULL, NULL),
(13, 'bk1', '$2y$10$.4H2EkWR08Lgw6Onh.tQ2.D7lByXD2IqE2p1Nh3Z3tsvuHctxL9S.', 'Ibu Yeni', 'BK001', 'P', 'yeni@guru.id', 'bk', '2026-02-12 20:27:03', NULL, NULL),
(14, 'bk2', '$2y$10$iG.kRhdloxVZsfRhOcfRuOa61y1vNCQN2Y0RnWDwdmQRiJEvhslci', 'Pak Budi', 'ADM001', 'L', 'budi@guru.id', 'bk', '2026-02-20 00:42:37', NULL, NULL),
(15, 'guru3', '$2y$10$6U0VjdyE.jwfeXBRzGBHR.puPX8sk4EklL8bb/U3AI9vjUH0N2SWy', 'Mis Tini', 'ING1', 'P', 'tini@gmail.com', 'guru', '2026-02-21 05:57:21', '2026-02-21 05:57:43', '2026-02-21 05:57:45');

-- --------------------------------------------------------

--
-- Table structure for table `jenis_pelanggaran`
--

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

--
-- Dumping data for table `jenis_pelanggaran`
--

INSERT INTO `jenis_pelanggaran` (`id`, `kode_pelanggaran`, `nama_pelanggaran`, `sanksi_poin`, `deskripsi_sanksi`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'P001', 'Terlambat', 5, 'Terlambat masuk sekolah', '2026-02-04 01:06:32', NULL, '2026-02-06 02:43:35'),
(2, 'P002', 'Tidak Pakai Seragam', 10, 'Tidak sesuai atribut', '2026-02-04 01:06:32', NULL, '2026-02-21 06:03:40'),
(3, 'P003', 'Bolos', 20, 'Tidak masuk tanpa keterangan', '2026-02-04 01:06:32', NULL, '2026-02-21 06:03:37'),
(4, 'P004', 'Merokok', 25, 'Merokok di lingkungan sekolah', '2026-02-04 01:06:32', NULL, '2026-02-21 06:03:39'),
(5, 'P005', 'Berkelahi', 30, 'Perkelahian antar siswa', '2026-02-04 01:06:32', NULL, '2026-02-21 06:03:34'),
(6, 'PLG-001', 'Bokep', 15, 'Bokep', '2026-02-06 01:47:58', '2026-02-06 01:51:50', '2026-02-21 06:03:35'),
(7, 'SS', 'Seragam Sekolah', 10, 'Tidak Bawa Dasi', '2026-02-21 06:04:08', NULL, NULL),
(8, 'KS', 'Kehadiran Di Sekolah', 20, 'Telat Masuk Sekolah', '2026-02-21 06:04:33', NULL, NULL),
(9, 'PBM', 'Proses Belajar Mengajar', 15, 'Main Handphone Saat Guru Menjelaskan', '2026-02-21 06:05:15', NULL, NULL),
(10, 'PNN', 'Pelanggaran Norma Norma', 20, 'Tidak Sopan Pada Guru', '2026-02-21 06:05:45', NULL, NULL),
(11, 'PB', 'Pelanggaran Berat', 50, 'Narkoba', '2026-02-21 06:06:07', NULL, NULL),
(12, 'KB', 'Kesopanan Berkendara', 15, 'Tidak Memakai Helm ', '2026-02-21 06:06:34', NULL, NULL),
(13, 'UB', 'Upacara Bendera', 15, 'Tidak Membawa Topi', '2026-02-21 06:07:09', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `laporan`
--

CREATE TABLE `laporan` (
  `id` int NOT NULL,
  `jenis_laporan` varchar(50) DEFAULT NULL,
  `id_surat` int DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orang_tua`
--

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

--
-- Dumping data for table `orang_tua`
--

INSERT INTO `orang_tua` (`id`, `id_siswa`, `nama`, `hubungan`, `telp`, `pekerjaan`, `alamat`, `created_at`, `updated_at`, `deleted_at`) VALUES
(12, 12, 'Budi Saputra', 'ayah', '08123456789', 'Karyawan', 'Jl. Melati No.99', '2026-02-04 01:47:42', '2026-02-20 05:01:27', '2026-02-20 05:11:06'),
(13, 12, 'Siti Aminah', 'ibu', '08198765432', 'Ibu Rumah Tangga', 'Jl. Melati No.99', '2026-02-04 01:47:42', '2026-02-20 05:01:27', '2026-02-20 05:11:06'),
(14, 13, 'Ahmad Santoso', 'ayah', '0811111111', 'Wiraswasta', 'Jl. Merdeka No 10', '2026-02-12 20:18:57', NULL, '2026-02-20 05:11:11'),
(15, 13, 'Siti Aminah', 'ibu', '0822222222', 'Ibu Rumah Tangga', 'Jl. Merdeka No 10', '2026-02-12 20:18:58', NULL, '2026-02-20 05:11:11'),
(16, 14, 'Ahmad Santoso', 'ayah', '0811111111', 'Wiraswasta', 'Jl. Merdeka No 10', '2026-02-20 04:53:51', NULL, '2026-02-20 05:11:09'),
(17, 14, 'Siti Aminah', 'ibu', '0822222222', 'Ibu Rumah Tangga', 'Jl. Merdeka No 10', '2026-02-20 04:53:51', NULL, '2026-02-20 05:11:09'),
(18, 15, 'SADSA', 'ayah', '12312312', 'SDASDA', 'Sidakarya Street No.144 AD', '2026-02-20 04:57:16', NULL, '2026-02-20 05:10:43'),
(19, 15, 'SADASDA', 'ibu', '123123132', 'ASDASDA', 'Sidakarya Street No.144 AD', '2026-02-20 04:57:16', NULL, '2026-02-20 05:10:43'),
(20, 17, 'Prabowo Subianto', 'ayah', '08123456789', 'Presiden', 'Rumah Presiden, Jakarta Raya', '2026-02-20 05:12:59', '2026-02-20 07:39:08', NULL),
(21, 17, 'Titiek Soeharto', 'ibu', '08123456789', 'Istri Presiden', 'Rumah Presiden, Jakarta Raya', '2026-02-20 07:39:08', NULL, NULL),
(22, 18, 'Jokowi', 'ayah', '08123456789', 'Mantan Presiden', 'Keraton Solo', '2026-02-20 07:41:46', '2026-02-20 07:41:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pelanggaran`
--

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

--
-- Dumping data for table `pelanggaran`
--

INSERT INTO `pelanggaran` (`id`, `id_jenis_pelanggaran`, `id_siswa`, `poin`, `keterangan`, `created_at`, `updated_at`, `deleted_at`) VALUES
(44, 3, 12, 20, 'Terlambat masuk kelas', '2026-02-12 20:29:00', NULL, NULL),
(45, 3, 12, 20, 'Terlambat masuk kelas', '2026-02-12 20:29:04', NULL, NULL),
(46, 3, 12, 20, 'Terlambat masuk kelas', '2026-02-12 20:29:18', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

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

--
-- Dumping data for table `siswa`
--

INSERT INTO `siswa` (`id`, `username`, `password`, `nama`, `nis`, `kelas`, `jurusan`, `jenis_kelamin`, `alamat`, `no_telp`, `email`, `poin`, `total_poin`, `created_at`, `updated_at`, `deleted_at`) VALUES
(12, 'siswa3', '$2y$10$tL5LptZjdAzT3awGGnGCfOUZ0tgI5YFphr863vy3QvuFdi7l8oVQm', 'Dendra De Tama', 12301, 'XII RPL 2', 'RPL', 'L', 'Jl. Melati No.99', '081111111999', 'andi_update@siswa.id', 15, 15, '2026-02-04 01:47:42', '2026-02-20 05:01:27', '2026-02-20 05:11:06'),
(13, 'siswa5', '$2y$10$JMR5yPCYsXFoycQZ7CF6duq2oUfiqfUUjsv1aZCBq0s2NF/rGXaVm', 'Budi Santoso', 2026001, 'XI RPL 2', 'DKV', 'L', 'Jl. Merdeka No 10', '081234567890', 'budi@example.com', 0, 0, '2026-02-12 20:18:57', NULL, '2026-02-20 05:11:11'),
(14, 'siswa2', '$2y$10$44hGJgEULBftNgf3jH1jp.ImTFciEf8tsQcAkdHvViwSONwUhE6.K', 'Budi Santoso', 2026001, 'X RPL 2', 'TKJ', 'L', 'Jl. Merdeka No 10', '081234567890', 'budi@example.com', 0, 0, '2026-02-20 04:53:51', NULL, '2026-02-20 05:11:09'),
(15, 'deden', '$2y$10$m915OSQo/8u.p7rJRBIYF.K1sVc/ipA3Eml/l9luSfpDcY0cIuOam', 'Dendra De Tama', 6672, 'XII RPL 2', 'AN', 'L', 'Sidakarya Street No.144 AD', '081239021528', 'dendradetama2@gmail.com', 0, 0, '2026-02-20 04:57:16', NULL, '2026-02-20 05:10:43'),
(17, 'siswa1', '$2y$10$9se1gXsP0wtyDcHJR5iK0u.tm3KaXsdrsx0WFmc3rDcf.dRTx9F/C', 'Dendra De Tama', 6672, 'XI', 'RPL ', 'L', 'Sidakarya Street No.144 AD', '081239021528', 'dendradetama2@gmail.com', 0, 0, '2026-02-20 05:12:59', '2026-02-20 07:39:08', NULL),
(18, 'siswa6', '$2y$10$YzDbzMrTA3OcypXefDKsA.aU.bPA5zpiKftksFXFIuChHKI.u6VGG', 'Dewa Ayu Putu Anindhity Mayra Putri ', 6673, 'XI', 'DKV', 'P', 'Jalan Raya Renon ', '08123456789', 'anin@gmail.com', 0, 0, '2026-02-20 07:41:46', '2026-02-20 07:41:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `surat`
--

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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `guru`
--
ALTER TABLE `guru`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `jenis_pelanggaran`
--
ALTER TABLE `jenis_pelanggaran`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `laporan`
--
ALTER TABLE `laporan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_laporan_surat` (`id_surat`);

--
-- Indexes for table `orang_tua`
--
ALTER TABLE `orang_tua`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orangtua_siswa` (`id_siswa`);

--
-- Indexes for table `pelanggaran`
--
ALTER TABLE `pelanggaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pelanggaran_jenis` (`id_jenis_pelanggaran`),
  ADD KEY `fk_pelanggaran_siswa` (`id_siswa`);

--
-- Indexes for table `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `surat`
--
ALTER TABLE `surat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_surat_siswa` (`id_siswa`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `guru`
--
ALTER TABLE `guru`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `jenis_pelanggaran`
--
ALTER TABLE `jenis_pelanggaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `laporan`
--
ALTER TABLE `laporan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orang_tua`
--
ALTER TABLE `orang_tua`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `pelanggaran`
--
ALTER TABLE `pelanggaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `siswa`
--
ALTER TABLE `siswa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `surat`
--
ALTER TABLE `surat`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `laporan`
--
ALTER TABLE `laporan`
  ADD CONSTRAINT `fk_laporan_surat` FOREIGN KEY (`id_surat`) REFERENCES `surat` (`id`);

--
-- Constraints for table `orang_tua`
--
ALTER TABLE `orang_tua`
  ADD CONSTRAINT `fk_orangtua_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`);

--
-- Constraints for table `pelanggaran`
--
ALTER TABLE `pelanggaran`
  ADD CONSTRAINT `fk_pelanggaran_jenis` FOREIGN KEY (`id_jenis_pelanggaran`) REFERENCES `jenis_pelanggaran` (`id`),
  ADD CONSTRAINT `fk_pelanggaran_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`);

--
-- Constraints for table `surat`
--
ALTER TABLE `surat`
  ADD CONSTRAINT `fk_surat_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;