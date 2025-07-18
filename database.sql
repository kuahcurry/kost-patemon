-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 26, 2025 at 04:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kost_patemon`
--

CREATE DATABASE IF NOT EXISTS `kost_patemon`;
USE `kost_patemon`;

-- --------------------------------------------------------

--
-- Table structure for table `kamar`
--

CREATE TABLE `kamar` (
  `No_Kamar` INT(10) NOT NULL AUTO_INCREMENT,
  `Nama_Kamar` VARCHAR(50) NOT NULL,
  `Letak` VARCHAR(50) NOT NULL,
  `Ketersediaan` TINYINT(1) NOT NULL,
  PRIMARY KEY (`No_Kamar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `user`
CREATE TABLE `user` (
  `Nama` VARCHAR(70) NOT NULL,
  `No_telp` VARCHAR(20) NOT NULL,
  `Alamat` VARCHAR(200) NOT NULL,
  `Email` VARCHAR(100) NOT NULL PRIMARY KEY,
  `Password` VARCHAR(255) NOT NULL,  -- Changed to VARCHAR for password hash
  `Foto` VARCHAR(255) DEFAULT NULL,
  `Role` ENUM('admin','penyewa') NOT NULL DEFAULT 'penyewa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `ulasan`
CREATE TABLE `ulasan` (
  `No_kamar` INT(10) NOT NULL,
  `Email` VARCHAR(100) NOT NULL,
  `Tanggal` DATE NOT NULL,
  `Rating` INT(1) NOT NULL CHECK (`Rating` BETWEEN 1 AND 5),  -- Added CHECK constraint
  `Ulasan` VARCHAR(1000) NOT NULL,
  PRIMARY KEY (`No_kamar`, `Email`),  -- Composite primary key
  FOREIGN KEY (`No_kamar`) REFERENCES `kamar`(`No_Kamar`) ON DELETE CASCADE,
  FOREIGN KEY (`Email`) REFERENCES `user`(`Email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `reservasi`
CREATE TABLE `reservasi` (
  `ID_Reservasi` INT(11) NOT NULL AUTO_INCREMENT,
  `No_Kamar` INT(10) NOT NULL,
  `Email` VARCHAR(100) NOT NULL,
  `Tanggal_Reservasi` DATETIME NOT NULL,  -- Changed to DATETIME for time tracking
  `Status` ENUM('Menunggu','Diterima','Ditolak') NOT NULL DEFAULT 'Menunggu',
  PRIMARY KEY (`ID_Reservasi`),
  FOREIGN KEY (`No_Kamar`) REFERENCES `kamar`(`No_Kamar`) ON DELETE CASCADE,
  FOREIGN KEY (`Email`) REFERENCES `user`(`Email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `pembayaran`
CREATE TABLE `pembayaran` (
  `ID_Pembayaran` INT(11) NOT NULL AUTO_INCREMENT,
  `ID_Reservasi` INT(11) NOT NULL,
  `Tanggal_Bayar` DATETIME NOT NULL,
  `Jumlah` DECIMAL(12,2) NOT NULL,
  `Status` ENUM('Belum Bayar','Lunas','Terlambat') NOT NULL DEFAULT 'Belum Bayar',
  PRIMARY KEY (`ID_Pembayaran`),
  FOREIGN KEY (`ID_Reservasi`) REFERENCES `reservasi`(`ID_Reservasi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `tmp` 
-- This table stores temporary user data before admin approval (same structure as user table)
CREATE TABLE `tmp` (
  `ID_Tmp` INT(11) NOT NULL AUTO_INCREMENT,
  `Nama` VARCHAR(70) NOT NULL,
  `No_telp` VARCHAR(20) NOT NULL,
  `Alamat` VARCHAR(200) NOT NULL,
  `Email` VARCHAR(100) NOT NULL,
  `Password` VARCHAR(255) NOT NULL,  -- Hashed password
  `Foto` VARCHAR(255) DEFAULT NULL,
  `Role` ENUM('admin','penyewa') NOT NULL DEFAULT 'penyewa',
  `No_Kamar` INT(10) NOT NULL,  -- Additional field for room reservation
  `Bukti_Pembayaran` VARCHAR(255) DEFAULT NULL,  -- File path for payment proof
  `Created_At` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `Updated_At` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_Tmp`),
  UNIQUE KEY `unique_email_tmp` (`Email`),
  FOREIGN KEY (`No_Kamar`) REFERENCES `kamar`(`No_Kamar`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `user_tokens`
-- This table stores temporary tokens for approved users (1 day validity)
CREATE TABLE `user_tokens` (
  `ID_Token` INT(11) NOT NULL AUTO_INCREMENT,
  `Email` VARCHAR(100) NOT NULL,
  `Token` VARCHAR(255) NOT NULL,
  `Expires_At` DATETIME NOT NULL,
  `Used` TINYINT(1) NOT NULL DEFAULT 0,
  `Created_At` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_Token`),
  UNIQUE KEY `unique_token` (`Token`),
  INDEX `idx_email` (`Email`),
  INDEX `idx_token_expires` (`Token`, `Expires_At`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dummy Data Insertions
-- Deleting old data first to avoid primary key conflicts
DELETE FROM `pembayaran`;
DELETE FROM `reservasi`;
DELETE FROM `ulasan`;
DELETE FROM `user`;
DELETE FROM `kamar`;
DELETE FROM `pending_reservations`;
DELETE FROM `user_tokens`;

-- Insert data for `user` table
INSERT INTO `user` (`Nama`, `NIK`, `No_telp`, `Alamat`, `Email`, `Password`, `Foto`, `Role`) VALUES
('Admin Kost', 12345678901234567, '81234567890', 'Jl. Serayu IV No. 13, Patemon', 'admin@kost.com', '123456', 'admin.jpg', 'admin'),
('Putri A', 3201010101010001, '81211112222', 'Jl. Mawar No. 1, Gombong', 'putria@mail.com', '111111', 'putria.jpg', 'penyewa'),
('Putri B', 3201010101010002, '81222223333', 'Jl. Melati No. 2, Gombong', 'putrib@mail.com', '222222', 'putrib.jpg', 'penyewa'),
('Putri C', 3201010101010003, '81233334444', 'Jl. Kenanga No. 3, Gombong', 'putric@mail.com', '333333', 'putric.jpg', 'penyewa');

-- Insert data for `kamar` table
INSERT INTO `kamar` (`No_Kamar`, `Nama_Kamar`, `Letak`, `Ketersediaan`) VALUES
(1, 'Kamar Mawar', 'Lantai 1', 1),
(2, 'Kamar Melati', 'Lantai 1', 1),
(3, 'Kamar Kenanga', 'Lantai 2', 0);

-- Insert data for `reservasi` table
SET FOREIGN_KEY_CHECKS=0;
INSERT INTO `reservasi` (`ID_Reservasi`, `No_Kamar`, `Email`, `Tanggal_Reservasi`, `Status`) VALUES
(1, 1, 'putria@mail.com', '2025-07-01 12:00:00', 'Diterima'),
(2, 2, 'putrib@mail.com', '2025-07-02 14:00:00', 'Menunggu'),
(3, 3, 'putric@mail.com', '2025-07-02 16:00:00', 'Ditolak');
SET FOREIGN_KEY_CHECKS=1;

-- Insert data for `pembayaran` table
SET FOREIGN_KEY_CHECKS=0;
INSERT INTO `pembayaran` (`ID_Pembayaran`, `ID_Reservasi`, `Tanggal_Bayar`, `Jumlah`, `Status`) VALUES
(1, 1, '2025-07-01 12:00:00', 1200000.00, 'Lunas'),
(2, 2, NULL, 1200000.00, 'Belum Bayar'),
(3, 3, '2025-07-03 17:30:00', 1200000.00, 'Terlambat');
SET FOREIGN_KEY_CHECKS=1;

-- Insert data for `ulasan` table
SET FOREIGN_KEY_CHECKS=0;
INSERT INTO `ulasan` (`No_kamar`, `Email`, `Tanggal`, `Rating`, `Ulasan`) VALUES
(1, 'putria@mail.com', '2025-07-03', 5, 'Kamar bersih dan nyaman!'),
(2, 'putrib@mail.com', '2025-07-03', 4, 'Fasilitas lengkap, recommended.'),
(3, 'putric@mail.com', '2025-07-03', 3, 'Cukup baik, tapi parkiran sempit.');
SET FOREIGN_KEY_CHECKS=1;

-- Insert data for `pending_reservations` table
INSERT INTO `pending_reservations` (`ID_Pending`, `Nama`, `No_telp`, `Alamat`, `Email`, `Password`, `No_Kamar`, `Tanggal_Reservasi`, `Bukti_Pembayaran`, `Status`) VALUES
(1, 'Putri D', '81244445555', 'Jl. Anggrek No. 4, Gombong', 'putrid@mail.com', '444444', 1, '2025-07-04 10:00:00', NULL, 'Menunggu'),
(2, 'Putra A', '81255556666', 'Jl. Cempaka No. 5, Gombong', 'putraa@mail.com', '555555', 2, '2025-07-05 11:00:00', NULL, 'Menunggu');
SET FOREIGN_KEY_CHECKS=1;

-- Insert data for `user_tokens` table
INSERT INTO `user_tokens` (`ID_Token`, `Email`, `Token`, `Expires_At`, `Used`, `Created_At`) VALUES
(1, 'admin@kost.com', 'token_admin_123456', '2025-07-02 16:00:00', 0, '2025-06-26 16:00:00'),
(2, 'putria@mail.com', 'token_putria_111111', '2025-07-03 16:00:00', 0, '2025-06-26 16:00:00'),
(3, 'putrib@mail.com', 'token_putrib_222222', '2025-07-03 16:00:00', 0, '2025-06-26 16:00:00'),
(4, 'putric@mail.com', 'token_putric_333333', '2025-07-03 16:00:00', 0, '2025-06-26 16:00:00');
SET FOREIGN_KEY_CHECKS=1;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
