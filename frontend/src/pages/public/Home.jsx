import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
          Sampaikan Keluhan Anda dengan Mudah
        </h1>
        <p className="text-slate-500 mb-8">
          Sistem pengaduan digital untuk warga Desa — laporkan masalah, pantau prosesnya
          secara transparan.
        </p>
        <Link
          to="/buat-pengaduan"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          + Buat Pengaduan
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14 text-left">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-800">Cepat</p>
            <p className="text-sm text-slate-500 mt-1">
              Kirim pengaduan dalam hitungan menit tanpa perlu datang ke kantor desa.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-800">Mudah Dipantau</p>
            <p className="text-sm text-slate-500 mt-1">
              Cek status pengaduan kapan saja hanya dengan nomor tiket.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-800">Transparan</p>
            <p className="text-sm text-slate-500 mt-1">
              Setiap pengaduan tercatat dan ditindaklanjuti oleh perangkat desa.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
