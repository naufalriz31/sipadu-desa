import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Pool koneksi ke MySQL (database dikelola lewat phpMyAdmin / Aiven Cloud)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  user: process.env.DB_USER || "smDurcawabJxfUb.root",
  password: process.env.DB_PASSWORD || "LnVG8vB34G12G78H",
  database: process.env.DB_NAME || "test",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 4000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false },
});

export default pool;
