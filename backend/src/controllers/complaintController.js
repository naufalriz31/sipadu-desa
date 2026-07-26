import pool from "../config/db.js";
import { generateTicketNumber } from "../utils/generateTicket.js";

// ---------- PUBLIK ----------

// POST /api/complaints  -> warga membuat pengaduan baru
export async function createComplaint(req, res) {
  try {
    const { reporter_name, phone, category_id, location, title, description } = req.body;

    if (!reporter_name || !category_id || !location || !title || !description) {
      return res.status(400).json({ message: "Semua field wajib diisi (kecuali No. HP)" });
    }

    const reporterEmail = req.citizen?.email;
    const reporterName = req.citizen?.name || reporter_name;

    if (!reporterEmail) {
      return res.status(401).json({ message: "Pengaduan ditolak: Wajib login dengan akun Google terverifikasi." });
    }

    const ticketNumber = await generateTicketNumber();
    const photoPath = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      `INSERT INTO complaints
        (ticket_number, category_id, reporter_name, reporter_email, phone, location, title, description, photo_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'menunggu')`,
      [ticketNumber, category_id, reporterName, reporterEmail, phone || null, location, title, description, photoPath]
    );

    res.status(201).json({
      message: "Pengaduan berhasil dikirim",
      ticket_number: ticketNumber,
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan pengaduan" });
  }
}

// GET /api/complaints/status/:ticket -> cek status berdasarkan nomor tiket
export async function checkStatus(req, res) {
  try {
    const { ticket } = req.params;

    const [rows] = await pool.query(
      `SELECT c.ticket_number, c.title, c.description, c.status, c.location, c.resolution_note, c.photo_path, c.created_at,
              cat.name AS category_name
       FROM complaints c
       JOIN categories cat ON cat.id = c.category_id
       WHERE c.ticket_number = ?`,
      [ticket]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Nomor tiket tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

// GET /api/complaints/my-complaints -> daftar pengaduan milik warga yang sedang login
export async function getMyComplaints(req, res) {
  try {
    const reporterEmail = req.citizen?.email;

    if (!reporterEmail) {
      return res.status(401).json({ message: "Anda harus login menggunakan Google terlebih dahulu" });
    }

    const [rows] = await pool.query(
      `SELECT c.id, c.ticket_number, c.title, c.description, c.location, c.status, c.resolution_note, c.created_at, c.photo_path,
              cat.name AS category_name
       FROM complaints c
       JOIN categories cat ON cat.id = c.category_id
       WHERE c.reporter_email = ?
       ORDER BY c.created_at DESC`,
      [reporterEmail]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}


// GET /api/categories -> daftar kategori untuk dropdown form
export async function getCategories(req, res) {
  try {
    const [rows] = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

// ---------- ADMIN ----------

// GET /api/admin/complaints -> daftar seluruh pengaduan (dengan filter status opsional)
export async function listComplaints(req, res) {
  try {
    const { status } = req.query;

    let query = `
      SELECT c.*, cat.name AS category_name
      FROM complaints c
      JOIN categories cat ON cat.id = c.category_id
    `;
    const params = [];

    if (status) {
      query += " WHERE c.status = ?";
      params.push(status);
    }

    query += " ORDER BY c.created_at DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

// GET /api/admin/complaints/:id -> detail pengaduan
export async function getComplaintDetail(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT c.*, cat.name AS category_name
       FROM complaints c
       JOIN categories cat ON cat.id = c.category_id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pengaduan tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

// PATCH /api/admin/complaints/:id/status -> ubah status + catatan penyelesaian
export async function updateStatus(req, res) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status, resolution_note } = req.body;
    const validStatus = ["menunggu", "diproses", "selesai"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    await connection.beginTransaction();

    const [current] = await connection.query("SELECT status FROM complaints WHERE id = ?", [id]);
    if (current.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Pengaduan tidak ditemukan" });
    }

    const oldStatus = current[0].status;

    await connection.query(
      `UPDATE complaints
       SET status = ?, resolution_note = COALESCE(?, resolution_note), handled_by = ?
       WHERE id = ?`,
      [status, resolution_note || null, req.user.id, id]
    );

    await connection.query(
      `INSERT INTO complaint_logs (complaint_id, user_id, old_status, new_status, note)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.id, oldStatus, status, resolution_note || null]
    );

    await connection.commit();
    res.json({ message: "Status pengaduan berhasil diperbarui" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui status" });
  } finally {
    connection.release();
  }
}

// GET /api/admin/dashboard -> ringkasan statistik untuk dashboard
export async function getDashboardStats(req, res) {
  try {
    const [[totalRow]] = await pool.query("SELECT COUNT(*) AS total FROM complaints");
    const [statusRows] = await pool.query(
      "SELECT status, COUNT(*) AS jumlah FROM complaints GROUP BY status"
    );
    const [categoryRows] = await pool.query(
      `SELECT cat.name AS kategori, COUNT(c.id) AS jumlah
       FROM categories cat
       LEFT JOIN complaints c ON c.category_id = cat.id
       GROUP BY cat.id, cat.name`
    );

    res.json({
      total: totalRow.total,
      per_status: statusRows,
      per_kategori: categoryRows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

// DELETE /api/admin/complaints/:id -> hapus pengaduan (admin)
export async function deleteComplaint(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM complaints WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pengaduan tidak ditemukan" });
    }

    res.json({ message: "Pengaduan berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus pengaduan" });
  }
}

