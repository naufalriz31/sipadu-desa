import pool from "../config/db.js";

// Menghasilkan nomor tiket berformat ADU-0001, ADU-0002, dst
export async function generateTicketNumber() {
  const [rows] = await pool.query(
    "SELECT id FROM complaints ORDER BY id DESC LIMIT 1"
  );

  const nextId = rows.length > 0 ? rows[0].id + 1 : 1;
  const padded = String(nextId).padStart(4, "0");

  return `ADU-${padded}`;
}
