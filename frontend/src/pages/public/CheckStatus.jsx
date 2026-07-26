import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import StatusBadge from "../../components/StatusBadge";
import GoogleLoginModal from "../../components/GoogleLoginModal";
import { checkComplaintStatus, getMyComplaints } from "../../api/complaintApi";
import { loginCitizen } from "../../api/authApi";

export default function CheckStatus() {
  const [ticket, setTicket] = useState("");
  const [result, setResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Citizen auth state
  const [citizen, setCitizen] = useState(() => {
    const saved = localStorage.getItem("sipadu_citizen");
    return saved ? JSON.parse(saved) : null;
  });

  const [myComplaints, setMyComplaints] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");

  // Sync state if localStorage changes
  useEffect(() => {
    const checkCitizen = () => {
      const saved = localStorage.getItem("sipadu_citizen");
      setCitizen(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener("storage", checkCitizen);
    return () => window.removeEventListener("storage", checkCitizen);
  }, []);

  // Fetch logged in citizen's complaint history
  const fetchHistory = async () => {
    if (!citizen) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await getMyComplaints();
      setMyComplaints(res.data);
    } catch (err) {
      console.error(err);
      setHistoryError("Gagal memuat riwayat pengaduan");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [citizen]);

  const handleCheck = async (e) => {
    e.preventDefault();
    setSearchError("");
    setResult(null);
    setSearchLoading(true);

    try {
      const res = await checkComplaintStatus(ticket.trim());
      setResult(res.data);
    } catch (err) {
      setSearchError(err.response?.data?.message || "Nomor tiket tidak ditemukan");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLoginSuccess = async (googleUser) => {
    try {
      const res = await loginCitizen(googleUser);
      localStorage.setItem("sipadu_citizen_token", res.data.token);
      localStorage.setItem("sipadu_citizen", JSON.stringify(res.data.user));
      setCitizen(res.data.user);
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Cek Status & Riwayat Pengaduan</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Pantau perkembangan pengaduan Anda atau cari pengaduan spesifik berdasarkan nomor tiket.
          </p>
        </div>

        {/* Section 1: Cari dengan Nomor Tiket */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-3">Cari Berdasarkan Nomor Tiket</h2>
          <form onSubmit={handleCheck} className="flex gap-2">
            <input
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              placeholder="Contoh: ADU-0001"
              required
              className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              disabled={searchLoading}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-60 text-sm shadow-sm"
            >
              {searchLoading ? "Mencari..." : "Cari Tiket"}
            </button>
          </form>

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {searchError}
            </div>
          )}

          {/* Result Card for Ticket Lookup */}
          {result && (
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs text-slate-400 block">Nomor Tiket</span>
                  <span className="font-bold text-primary-700 text-base">{result.ticket_number}</span>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-base">{result.title}</h3>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-1">
                  <span>📂 Kategori: <strong>{result.category_name}</strong></span>
                  <span>📍 Lokasi: <strong>{result.location}</strong></span>
                  <span>📅 Tanggal: <strong>{new Date(result.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                </div>
              </div>

              {result.description && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold block text-slate-700 mb-1">Deskripsi Laporan:</span>
                  {result.description}
                </div>
              )}

              {result.photo_path && (
                <div>
                  <span className="font-semibold block text-xs text-slate-700 mb-1">Foto Lampiran:</span>
                  <img
                    src={`${apiBaseUrl}/uploads/${result.photo_path}`}
                    alt="Foto Lampiran"
                    className="max-h-48 rounded-lg border border-slate-200 object-cover"
                  />
                </div>
              )}

              {result.resolution_note && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800">
                  <span className="font-semibold block mb-0.5">💡 Catatan Penanganan Petugas:</span>
                  {result.resolution_note}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Riwayat Pengaduan Saya */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Riwayat Pengaduan Saya</h2>
              {citizen && (
                <p className="text-xs text-slate-500">
                  Menampilkan laporan dari akun: <span className="font-semibold text-primary-700">{citizen.email}</span>
                </p>
              )}
            </div>

            {citizen && (
              <button
                onClick={fetchHistory}
                disabled={historyLoading}
                className="text-xs font-semibold text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 transition"
              >
                {historyLoading ? "Memuat..." : "🔄 Refresh"}
              </button>
            )}
          </div>

          {!citizen ? (
            /* Banner jika belum login */
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-150 rounded-xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-xl shadow-sm">
                📋
              </div>
              <h3 className="font-bold text-slate-800">Ingin melihat daftar seluruh pengaduan Anda?</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Masuk dengan akun Google yang Anda gunakan saat membuat pengaduan untuk memantau seluruh riwayat laporan Anda.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 shadow-sm transition"
              >
                Login dengan Google
              </button>
            </div>
          ) : historyLoading ? (
            <div className="py-8 text-center text-sm text-slate-500">Memuat riwayat pengaduan Anda...</div>
          ) : historyError ? (
            <div className="p-4 bg-red-50 text-red-600 text-xs rounded-xl text-center">{historyError}</div>
          ) : myComplaints.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-3xl">📭</p>
              <p className="font-semibold text-slate-700 text-sm">Belum ada pengaduan</p>
              <p className="text-xs text-slate-400">Anda belum pernah membuat pengaduan dengan akun Google ini.</p>
            </div>
          ) : (
            /* Daftar Kartu Pengaduan Saya */
            <div className="space-y-4">
              {myComplaints.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition space-y-3 bg-slate-50/50">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary-700 text-sm">{item.ticket_number}</span>
                      <span className="text-xs bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {item.category_name}
                      </span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>📍 Lokasi: <strong className="text-slate-600">{item.location}</strong></span>
                    <span>📅 {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {item.photo_path && (
                    <div className="pt-2">
                      <img
                        src={`${apiBaseUrl}/uploads/${item.photo_path}`}
                        alt="Foto Lampiran"
                        className="max-h-36 rounded-lg border border-slate-200 object-cover"
                      />
                    </div>
                  )}

                  {item.resolution_note && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 mt-2">
                      <span className="font-semibold block mb-0.5">💡 Catatan Penyelesaian dari Desa:</span>
                      {item.resolution_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <GoogleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
