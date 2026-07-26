import pool from "../config/db.js";

function slugify(text) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export async function listCategories(req, res) {
  const [rows] = await pool.query("SELECT * FROM categories ORDER BY name ASC");
  res.json(rows);
}

export async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama kategori wajib diisi" });

    const slug = slugify(name);
    const [result] = await pool.query(
      "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
      [name, slug, description || null]
    );

    res.status(201).json({ message: "Kategori berhasil ditambahkan", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan kategori" });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const slug = name ? slugify(name) : undefined;

    await pool.query(
      "UPDATE categories SET name = COALESCE(?, name), slug = COALESCE(?, slug), description = ? WHERE id = ?",
      [name, slug, description || null, id]
    );

    res.json({ message: "Kategori berhasil diperbarui" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui kategori" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus kategori (kemungkinan masih dipakai pengaduan)" });
  }
}
