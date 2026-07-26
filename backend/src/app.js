import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Akses foto pengaduan yang sudah diupload
const uploadsPath = process.env.VERCEL ? "/tmp/uploads" : path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "SIPADU Desa API berjalan dengan baik" });
});

// Handler error umum (termasuk error dari multer)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ message: err.message || "Terjadi kesalahan" });
});

export default app;
