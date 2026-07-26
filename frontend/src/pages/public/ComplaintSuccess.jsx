import { Link, useLocation, Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function ComplaintSuccess() {
  const { state } = useLocation();

  if (!state?.ticket) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Pengaduan Berhasil Dikirim!</h1>
        <p className="text-slate-500 mb-6">Simpan nomor tiket berikut untuk cek status pengaduan</p>

        <div className="bg-white border-2 border-primary-500 rounded-xl py-4 text-2xl font-bold text-primary-700 tracking-wider mb-8">
          {state.ticket}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/cek-status"
            className="bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Cek Status Sekarang
          </Link>
          <Link to="/" className="text-slate-500 text-sm hover:text-slate-700">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}
