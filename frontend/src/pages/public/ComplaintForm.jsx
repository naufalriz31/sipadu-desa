import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import GoogleLoginModal from "../../components/GoogleLoginModal";
import { getCategories, submitComplaint } from "../../api/complaintApi";
import { loginCitizen } from "../../api/authApi";

const initialForm = {
  reporter_name: "",
  phone: "",
  category_id: "",
  location: "",
  title: "",
  description: "",
};

export default function ComplaintForm() {
  const [citizen, setCitizen] = useState(() => {
    const saved = localStorage.getItem("sipadu_citizen");
    return saved ? JSON.parse(saved) : null;
  });

  const [form, setForm] = useState({
    ...initialForm,
    reporter_name: citizen ? citizen.name : "",
  });

  const [categories, setCategories] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  // Sync state if localStorage changes
  useEffect(() => {
    const checkCitizen = () => {
      const saved = localStorage.getItem("sipadu_citizen");
      const currentCitizen = saved ? JSON.parse(saved) : null;
      setCitizen(currentCitizen);
      if (currentCitizen) {
        setForm((prev) => ({ ...prev, reporter_name: currentCitizen.name }));
      } else {
        setForm((prev) => ({ ...prev, reporter_name: "" }));
      }
    };
    window.addEventListener("storage", checkCitizen);
    return () => window.removeEventListener("storage", checkCitizen);
  }, []);

  useEffect(() => {
    // Only load categories if user is authenticated to optimize loads
    if (citizen) {
      getCategories()
        .then((res) => setCategories(res.data))
        .catch(() => setError("Gagal memuat kategori"));
    }
  }, [citizen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran foto melebihi batas maksimal 5 MB. Silakan pilih foto yang lebih kecil.");
        e.target.value = "";
        setPhoto(null);
        return;
      }
      setError("");
      setPhoto(file);
    }
  };

  const handleLoginSuccess = async (googleUser) => {
    try {
      const res = await loginCitizen(googleUser);
      localStorage.setItem("sipadu_citizen_token", res.data.token);
      localStorage.setItem("sipadu_citizen", JSON.stringify(res.data.user));
      setCitizen(res.data.user);
      setForm((prev) => ({ ...prev, reporter_name: res.data.user.name }));
      
      // Dispatch a storage event so other components sync up immediately
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!citizen) {
      setError("Silakan login menggunakan Google terlebih dahulu");
      setIsLoginModalOpen(true);
      return;
    }
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (photo) formData.append("photo", photo);

      const res = await submitComplaint(formData);
      navigate("/pengaduan-berhasil", { state: { ticket: res.data.ticket_number } });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim pengaduan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-slate-800 mb-6 text-center md:text-left">
          Buat Pengaduan Baru
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        {!citizen ? (
          // Call-to-action Login Google untuk warga
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-5 py-12">
            <div className="mx-auto w-14 h-14 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-2xl shadow-inner">
              🔑
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-800">Verifikasi Login Diperlukan</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Untuk menghindari laporan fiktif, iseng, atau tidak bertanggung jawab, warga wajib
                masuk menggunakan Google sebelum mengisi berkas pengaduan.
              </p>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-2.5 bg-white border border-slate-350 text-slate-700 font-semibold px-5 py-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 shadow-sm transition"
            >
              {/* Google Brand Logo */}
              <div className="flex gap-0.5 text-base leading-none font-bold select-none mr-0.5">
                <span className="text-blue-600">G</span>
                <span className="text-red-500">o</span>
                <span className="text-yellow-500">o</span>
                <span className="text-blue-600">g</span>
                <span className="text-green-500">l</span>
                <span className="text-red-500">e</span>
              </div>
              Masuk dengan Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Nama Pelapor</label>
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1 pr-1 bg-green-50/60 rounded px-1.5 py-0.5 border border-green-150">
                  ✓ Akun Google Aktif
                </span>
              </div>
              <input
                name="reporter_name"
                value={form.reporter_name}
                readOnly
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none text-slate-550 select-none cursor-default font-medium border-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1 select-none pr-1">
                Identitas diverifikasi melalui Google: <span className="font-semibold text-slate-500">{citizen.email}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. HP (opsional)</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Contoh: 08123456789"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi/Alamat Kejadian</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="Contoh: RT 03 / RW 02, Dusun Krajan"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Judul Pengaduan</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Contoh: Jalan ambles dekat pos kamling"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Pengaduan</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Deskripsikan kronologi atau laporan secara detail..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Upload Foto Lampiran (opsional)</label>
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">Maks 5 MB</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Format: <strong>JPG, PNG, WEBP</strong> (Maksimal <strong>5 MB</strong>)
              </p>
              {photo && (
                <div className="mt-2.5 flex items-center justify-between bg-primary-50/50 border border-primary-150 p-2.5 rounded-xl text-xs">
                  <span className="truncate max-w-[240px] text-slate-700 font-medium flex items-center gap-1.5">
                    📷 {photo.name} <span className="text-primary-700 font-bold">({(photo.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="text-red-500 hover:text-red-700 font-semibold text-xs ml-2 bg-white px-2 py-1 rounded-lg border border-red-200 shadow-xs"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-60"
            >
              {loading ? "Mengirim..." : "Kirim Pengaduan"}
            </button>
          </form>
        )}
      </main>

      <GoogleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
