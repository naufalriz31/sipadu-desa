-- ============================================================
-- Migration: Add reporter_email to complaints table
-- Gunakan file ini jika database sipadu_desa sudah ada / pernah diimport sebelumnya
-- ============================================================

USE `sipadu_desa`;

ALTER TABLE `complaints`
ADD COLUMN `reporter_email` VARCHAR(100) DEFAULT NULL AFTER `reporter_name`;
