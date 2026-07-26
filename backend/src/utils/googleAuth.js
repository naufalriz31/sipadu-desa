import { OAuth2Client } from "google-auth-library";

/**
 * Verifies a Google ID Token directly against Google's OAuth2 token verification API.
 * @param {string} idToken Google Credential JWT Token from Google Identity Services (GIS)
 * @returns {Promise<object>} Object containing name, email, and picture of verified Google user
 */
export async function verifyGoogleToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID belum diatur di server backend (.env)");
  }

  const client = new OAuth2Client(clientId);

  // Verifies token signature, expiration, and audience against Google
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  
  if (!payload || !payload.email) {
    throw new Error("Payload token Google tidak valid atau email tidak terdeteksi");
  }

  return {
    name: payload.name || "Warga",
    email: payload.email,
    picture: payload.picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(payload.name || "warga")}`,
  };
}


