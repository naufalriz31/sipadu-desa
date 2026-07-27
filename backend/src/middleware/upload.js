import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) || allowedTypes.test(file.mimetype);

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (JPG, JPEG, PNG, WEBP) yang diizinkan"));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // maks 5MB
});

export default upload;
