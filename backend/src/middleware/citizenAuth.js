import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "../utils/googleAuth.js";

export async function verifyCitizen(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Akses ditolak: Anda wajib login menggunakan akun Google terlebih dahulu." });
  }

  const token = authHeader.split(" ")[1];

  // Direct Google ID Token verification attempt (if passed as Bearer token directly)
  if (process.env.GOOGLE_CLIENT_ID) {
    try {
      const googleUser = await verifyGoogleToken(token);
      req.citizen = {
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        role: "citizen"
      };
      return next();
    } catch (err) {
      // Proceed to check backend JWT token if token is backend-issued JWT
    }
  }

  // Backend JWT Token verification
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== "citizen") {
      return res.status(403).json({ message: "Akses ditolak: Peran akun tidak diizinkan." });
    }

    req.citizen = decoded; // { name, email, picture, role: 'citizen' }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token atau sesi login Google telah kedaluwarsa. Silakan login ulang." });
  }
}

