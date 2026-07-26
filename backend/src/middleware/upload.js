import multer from "multer";
import path from "path";
import fs from "fs";

const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const uploadDir = isVercel ? "/tmp" : (process.env.UPLOAD_DIR || "uploads/complaint-photos");

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn("Upload dir warning:", err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  },
});

function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan"));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // maks 2MB
});

export default upload;
