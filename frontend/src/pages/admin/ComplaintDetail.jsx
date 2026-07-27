import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import { getComplaintDetail, updateComplaintStatus, deleteComplaint } from "../../api/complaintApi";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadDetail = () => {
    getComplaintDetail(id).then((res) => {
      setComplaint(res.data);
      setStatus(res.data.status);
      setNote(res.data.resolution_note || "");
    });
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateComplaintStatus(id, { status, resolution_note: note });
      setMessage("Perubahan berhasil disimpan");
      loadDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  if (!complaint) {
    return (
      <AdminLayout title="Detail Pengaduan">
        <div className="py-12 text-center text-slate-500">Memuat data detail pengaduan...</div>
      </AdminLayout>
    );
  }

  const backButton = (
    <button
      onClick={() => navigate(-1)}
      className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
    >
      ← Kembali
    </button>
  );

  return (
    <AdminLayout title={`Detail: ${complaint.ticket_number}`} action={backButton}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-slate-400 block">Nomor Tiket</span>
              <h2 className="text-xl font-bold text-slate-800">{complaint.ticket_number}</h2>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          {complaint.photo_path && (
            <div>
              <span className="block text-xs font-semibold text-slate-500 mb-1.5">Foto Lampiran:</span>
              <img
                src={
                  complaint.photo_path.startsWith("data:") || complaint.photo_path.startsWith("http")
                    ? complaint.photo_path
                    : `${API_BASE}/uploads/${complaint.photo_path}`
                }
                alt="Foto pengaduan"
                className="w-full max-h-96 object-contain bg-slate-900/5 rounded-xl border border-slate-200"
                onError={(e) => {
                  if (!e.target.dataset.triedFallback && !complaint.photo_path.startsWith("data:")) {
                    e.target.dataset.triedFallback = "true";
                    e.target.src = `${API_BASE}/uploads/complaint-photos/${complaint.photo_path}`;
                  }
                }}
              />
            </div>
          )}

          {/* User & Info Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border border-slate-100 p-4 rounded-xl bg-slate-50/70">
            <div>
              <p className="text-xs font-medium text-slate-400">Nama Pelapor</p>
              <p className="font-semibold text-slate-800">{complaint.reporter_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Email Google (Terverifikasi)</p>
              <p className="font-semibold text-primary-700">{complaint.reporter_email || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">No. HP</p>
              <p className="font-semibold text-slate-800">{complaint.phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Kategori</p>
              <p className="font-semibold text-slate-800">{complaint.category_name}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-slate-400">Lokasi Kejadian</p>
              <p className="font-semibold text-slate-800">{complaint.location}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1">Judul & Deskripsi</p>
            <h3 className="font-bold text-slate-800 text-base mb-1">{complaint.title}</h3>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Action Form */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-slate-800 text-sm">Tindak Lanjut & Update Status</h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ubah Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="menunggu">Menunggu</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan Penyelesaian (Akan Dilihat oleh Pelapor)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Tuliskan tindak lanjut atau keterangan penyelesaian..."
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {message && <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">{message}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-60 text-sm shadow-sm"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>

              <button
                onClick={async () => {
                  if (window.confirm(`Apakah Anda yakin ingin menghapus pengaduan (${complaint.ticket_number}) ini secara permanen?`)) {
                    try {
                      await deleteComplaint(id);
                      navigate("/admin/pengaduan");
                    } catch (err) {
                      alert(err.response?.data?.message || "Gagal menghapus pengaduan");
                    }
                  }
                }}
                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
              >
                Hapus Pengaduan
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
