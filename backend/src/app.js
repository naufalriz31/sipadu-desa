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

// Akses foto pengaduan yang sudah diupload (untuk file lokal / legacy)
const uploadsPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));
app.use("/uploads/complaint-photos", express.static(path.join(uploadsPath, "complaint-photos")));

// Routes (support both /api prefix and Vercel serverless function rewrites)
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);
app.use("/admin", adminRoutes);
app.use("/", publicRoutes);

app.get("/", (req, res) => {
  res.json({ message: "SIPADU Desa API berjalan dengan baik" });
});

// Handler error umum (termasuk error dari multer)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ message: err.message || "Terjadi kesalahan" });
});

export default app;
