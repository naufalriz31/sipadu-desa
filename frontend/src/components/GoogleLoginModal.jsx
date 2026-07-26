import { useState, useEffect } from "react";

export default function GoogleLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [useCustom, setUseCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Real Google Sign-In credential callback
  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError("");
    try {
      await onLoginSuccess({ credential: response.credential });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memverifikasi login Google dengan backend");
    } finally {
      setLoading(false);
    }
  };

  // Inject Google GIS library and render real button if Client ID exists
  useEffect(() => {
    if (!isOpen || !clientId) return;

    const scriptId = "google-gsi-client-script";
    let script = document.getElementById(scriptId);

    const initializeGoogleButton = () => {
      try {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
          });

          const buttonContainer = document.getElementById("google-real-button-wrapper");
          if (buttonContainer) {
            window.google.accounts.id.renderButton(buttonContainer, {
              theme: "outline",
              size: "large",
              width: 320,
              text: "signin_with",
              shape: "rectangular",
            });
          }
        }
      } catch (err) {
        console.error("Gagal menginisialisasi tombol login Google:", err);
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleButton;
      document.body.appendChild(script);
    } else {
      // Small timeout to ensure DOM container is rendered
      setTimeout(initializeGoogleButton, 100);
    }
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  const demoAccounts = [
    {
      name: "Naufal Azhar",
      email: "naufal@gmail.com",
      picture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Naufal",
    },
    {
      name: "Budi Santoso",
      email: "budisantoso67@gmail.com",
      picture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Budi",
    },
    {
      name: "Siti Rahma",
      email: "sitirahma.desa@gmail.com",
      picture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Siti",
    },
  ];

  const handleSelectAccount = (account) => {
    setLoading(true);
    setError("");
    setTimeout(async () => {
      try {
        await onLoginSuccess(account);
        onClose();
      } catch (err) {
        setError(err.response?.data?.message || "Gagal masuk menggunakan Google");
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      setError("Nama dan email wajib diisi");
      return;
    }
    if (!customEmail.includes("@")) {
      setError("Format email tidak valid");
      return;
    }

    const account = {
      name: customName,
      email: customEmail,
      picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customName)}`,
    };

    handleSelectAccount(account);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden relative transition-all duration-300">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">Menghubungkan ke Google...</p>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 pt-8 pb-4 text-center">
          {/* Logo Google */}
          <div className="flex justify-center gap-0.5 mb-4 text-2xl font-bold tracking-tight">
            <span className="text-blue-600">G</span>
            <span className="text-red-500">o</span>
            <span className="text-yellow-500">o</span>
            <span className="text-blue-600">g</span>
            <span className="text-green-500">l</span>
            <span className="text-red-500">e</span>
          </div>
          <h2 className="text-[20px] font-medium text-slate-800 tracking-tight">Login Warga</h2>
          <p className="text-sm text-slate-500 mt-1">
            untuk melanjutkan ke <span className="font-semibold text-primary-700">SIPADU Desa</span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 my-2 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Modal Content */}
        <div className="px-6 pb-6">
          {clientId ? (
            // REAL GOOGLE LOGIN BUTTON CONTAINER
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div id="google-real-button-wrapper" className="w-full flex justify-center"></div>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Anda akan masuk menggunakan Single Sign-On Google resmi. Masuk untuk membuktikan keaslian laporan Anda.
              </p>
            </div>
          ) : (
            // SANDBOX FALLBACK DEVELOPMENT USER INTERFACE
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-[11px] leading-relaxed">
                <span className="font-bold">⚠️ Mode Simulasi (Sandbox):</span>
                <br />
                Kunci `VITE_GOOGLE_CLIENT_ID` belum diatur pada berkas `.env` frontend. 
                Silakan isi environment variable untuk menjalankan Google Login Resmi. Gunakan akun demo di bawah untuk pengetesan lokal:
              </div>

              {!useCustom ? (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {demoAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAccount(acc)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition text-left"
                    >
                      <img
                        src={acc.picture}
                        alt={acc.name}
                        className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{acc.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{acc.email}</p>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => setUseCustom(true)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition text-xs font-semibold text-slate-600"
                  >
                    Gunakan akun simulasi lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Contoh: Muhammad Naufal"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Email Google</label>
                    <input
                      type="email"
                      placeholder="Contoh: naufal@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustom(false);
                        setError("");
                      }}
                      className="flex-1 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-650 hover:bg-slate-50 transition"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Masuk
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center text-xs text-slate-400 border-t border-slate-100">
          <span>Koneksi Google Aman</span>
          <button
            onClick={onClose}
            className="text-slate-550 hover:text-slate-800 font-bold transition"
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  );
}
