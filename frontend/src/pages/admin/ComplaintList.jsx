import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import { getAdminComplaints, deleteComplaint } from "../../api/complaintApi";

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComplaints = () => {
    setLoading(true);
    getAdminComplaints(statusFilter)
      .then((res) => setComplaints(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleDelete = async (c) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengaduan (${c.ticket_number}) "${c.title}"?`)) {
      try {
        await deleteComplaint(c.id);
        setComplaints((prev) => prev.filter((item) => item.id !== c.id));
      } catch (err) {
        alert(err.response?.data?.message || "Gagal menghapus pengaduan");
      }
    }
  };

  const filterSelect = (
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="">Semua Status</option>
      <option value="menunggu">Menunggu</option>
      <option value="diproses">Diproses</option>
      <option value="selesai">Selesai</option>
    </select>
  );

  return (
    <AdminLayout title="Daftar Pengaduan" action={filterSelect}>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-500 text-left border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 font-semibold">No. Tiket</th>
                <th className="px-4 py-3.5 font-semibold">Judul</th>
                <th className="px-4 py-3.5 font-semibold">Kategori</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              )}
              {!loading && complaints.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Belum ada pengaduan
                  </td>
                </tr>
              )}
              {complaints.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5 font-bold text-primary-700">{c.ticket_number}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{c.title}</td>
                  <td className="px-4 py-3.5 text-slate-500">{c.category_name}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-3 whitespace-nowrap">
                    <Link
                      to={`/admin/pengaduan/${c.id}`}
                      className="text-primary-600 hover:text-primary-800 hover:underline font-medium text-xs bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100"
                    >
                      Lihat
                    </Link>
                    <button
                      onClick={() => handleDelete(c)}
                      className="text-red-600 hover:text-red-800 hover:underline font-medium text-xs bg-red-50 px-2.5 py-1 rounded-md border border-red-100"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
