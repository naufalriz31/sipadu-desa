-- =============================================
-- Database: sipadu_desa
-- Sistem Pengaduan Masyarakat Desa
-- Import file ini lewat phpMyAdmin > Import
-- =============================================

CREATE DATABASE IF NOT EXISTS `sipadu_desa` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sipadu_desa`;

-- ---------------------------------------------
-- Tabel: users (admin / petugas desa)
-- ---------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','petugas') NOT NULL DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Tabel: categories
-- ---------------------------------------------
CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Tabel: complaints
-- ---------------------------------------------
CREATE TABLE `complaints` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `ticket_number` VARCHAR(20) NOT NULL UNIQUE,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `reporter_name` VARCHAR(100) NOT NULL,
  `reporter_email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `location` VARCHAR(255) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `photo_path` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('menunggu','diproses','selesai') NOT NULL DEFAULT 'menunggu',
  `resolution_note` TEXT DEFAULT NULL,
  `handled_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_complaints_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_complaints_handler` FOREIGN KEY (`handled_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Tabel: complaint_logs (riwayat perubahan status)
-- ---------------------------------------------
CREATE TABLE `complaint_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `old_status` ENUM('menunggu','diproses','selesai') NOT NULL,
  `new_status` ENUM('menunggu','diproses','selesai') NOT NULL,
  `note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_logs_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Seed data awal
-- ---------------------------------------------

-- Admin default -> username: admin, password: admin123
-- (password di bawah adalah hash bcrypt dari "admin123", cocok dipakai backend Node.js bcrypt)
INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`) VALUES
('Admin Desa', 'admin', 'admin@desa.id', '$2b$10$wJ1HZ8vY5qgq3s0Bv2G3yOeYQvhk1s7yq6qzR0zHkNQeF2/vLh1Wu', 'admin');

INSERT INTO `categories` (`name`, `slug`, `description`) VALUES
('Infrastruktur', 'infrastruktur', 'Jalan rusak, jembatan, penerangan jalan, dll'),
('Kebersihan', 'kebersihan', 'Sampah, saluran air, lingkungan kotor'),
('Keamanan', 'keamanan', 'Gangguan keamanan dan ketertiban warga'),
('Sosial', 'sosial', 'Bantuan sosial, administrasi kependudukan, lainnya');
