import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Pool koneksi ke MySQL (database dikelola lewat phpMyAdmin / Aiven Cloud)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "sipadu-mysql-sipadudesa.c.aivencloud.com",
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "defaultdb",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 14261,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
});

export default pool;
