import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/StatusBadge";
import { getComplaintDetail, updateComplaintStatus } from "../../api/complaintApi";

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
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">Memuat data...</main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 max-w-3xl">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 mb-4">
          ← Kembali
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-slate-800">{complaint.ticket_number}</h1>
            <StatusBadge status={complaint.status} />
          </div>

          {complaint.photo_path && (
            <img
              src={`${API_BASE}/uploads/complaint-photos/${complaint.photo_path}`}
              alt="Foto pengaduan"
              className="w-full max-h-64 object-cover rounded-lg mb-4 border border-slate-200"
            />
          )}

          <div className="grid grid-cols-2 gap-4 text-sm mb-4 border border-slate-100 p-4 rounded-xl bg-slate-50/50">
            <div>
              <p className="text-slate-405 font-medium text-slate-500">Nama Pelapor</p>
              <p className="font-semibold text-slate-800">{complaint.reporter_name}</p>
            </div>
            <div>
              <p className="text-slate-405 font-medium text-slate-500">Email Google</p>
              <p className="font-semibold text-slate-800">{complaint.reporter_email || "-"}</p>
            </div>
            <div>
              <p className="text-slate-405 font-medium text-slate-500">No. HP</p>
              <p className="font-semibold text-slate-800">{complaint.phone || "-"}</p>
            </div>
            <div>
              <p className="text-slate-405 font-medium text-slate-500">Kategori</p>
              <p className="font-semibold text-slate-800">{complaint.category_name}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-450 font-medium text-slate-500">Lokasi</p>
              <p className="font-semibold text-slate-800">{complaint.location}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-1">Deskripsi</p>
            <p className="text-slate-700 text-sm">{complaint.description}</p>
          </div>

          <hr className="mb-4 border-slate-200" />

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubah Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="menunggu">Menunggu</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Catatan Penyelesaian
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {message && <p className="text-sm text-primary-600 mb-3">{message}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </main>
    </div>
  );
}
