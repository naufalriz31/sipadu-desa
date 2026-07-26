import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "../utils/googleAuth.js";

export async function citizenLogin(req, res) {
  try {
    const { credential, name, email, picture } = req.body;
    let userData = null;

    if (credential) {
      // Real Google verification
      try {
        userData = await verifyGoogleToken(credential);
      } catch (authErr) {
        return res.status(401).json({ message: `Token Google tidak valid: ${authErr.message}` });
      }
    } else {
      // Mock / fallback mode
      const isGoogleClientIdConfigured = !!process.env.GOOGLE_CLIENT_ID;
      
      if (isGoogleClientIdConfigured) {
        return res.status(400).json({ 
          message: "Aplikasi ini mewajibkan masuk menggunakan Google asli. Kredensial tidak ditemukan." 
        });
      }

      // If developer hasn't configured Client ID, allow mock payload for local testing
      if (!name || !email) {
        return res.status(400).json({ message: "Nama dan email wajib terisi dari login Google" });
      }
      
      userData = { 
        name, 
        email, 
        picture: picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}` 
      };
    }

    // Sign JWT token for the citizen
    const secret = process.env.JWT_SECRET || "sipadu_desa_default_jwt_secret_key";
    const token = jwt.sign(
      { name: userData.name, email: userData.email, picture: userData.picture, role: "citizen" },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Login warga berhasil",
      token,
      user: { name: userData.name, email: userData.email, picture: userData.picture, role: "citizen" },
    });
  } catch (err) {
    console.error("Citizen Login Error:", err);
    res.status(500).json({ message: err.message || "Terjadi kesalahan pada server" });
  }
}
