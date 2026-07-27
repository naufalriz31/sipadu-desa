import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

// GET /api/admin/account -> ambil data akun admin yang sedang login
export async function getAdminAccount(req, res) {
  try {
    const [rows] = await pool.query("SELECT id, name, username, email, role FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

// PUT /api/admin/account -> update username, name, dan/atau password admin
export async function updateAdminAccount(req, res) {
  try {
    const { name, username, current_password, new_password } = req.body;
    const userId = req.user.id;

    // Ambil data admin saat ini
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    const user = rows[0];

    // Verifikasi password lama (wajib untuk keamanan)
    if (!current_password) {
      return res.status(400).json({ message: "Password saat ini wajib diisi untuk konfirmasi" });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password saat ini salah" });
    }

    // Cek apakah username baru sudah dipakai oleh user lain
    if (username && username !== user.username) {
      const [existing] = await pool.query("SELECT id FROM users WHERE username = ? AND id != ?", [username, userId]);
      if (existing.length > 0) {
        return res.status(409).json({ message: "Username sudah digunakan oleh akun lain" });
      }
    }

    // Update name & username
    const newName = name || user.name;
    const newUsername = username || user.username;

    // Update password jika ada
    if (new_password) {
      if (new_password.length < 6) {
        return res.status(400).json({ message: "Password baru minimal 6 karakter" });
      }
      const hashedPassword = await bcrypt.hash(new_password, 10);
      await pool.query("UPDATE users SET name = ?, username = ?, password = ? WHERE id = ?", [newName, newUsername, hashedPassword, userId]);
    } else {
      await pool.query("UPDATE users SET name = ?, username = ? WHERE id = ?", [newName, newUsername, userId]);
    }

    // Generate token baru dengan data yang sudah diperbarui
    const newToken = jwt.sign(
      { id: userId, username: newUsername, role: user.role, name: newName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.json({
      message: "Akun berhasil diperbarui",
      token: newToken,
      user: { id: userId, name: newName, username: newUsername, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}
