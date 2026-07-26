import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from "../../components/Sidebar";
import { getDashboardStats } from "../../api/complaintApi";
import { useAuth } from "../../context/AuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const STATUS_LABEL = { menunggu: "Menunggu", diproses: "Diproses", selesai: "Selesai" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  useEffect(() => {
    getDashboardStats().then((res) => setStats(res.data));
  }, []);

  if (!stats) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">Memuat data...</main>
      </div>
    );
  }

  const getByStatus = (key) => stats.per_status.find((s) => s.status === key)?.jumlah || 0;

  const summaryCards = [
    { label: "Total Pengaduan", value: stats.total, color: "bg-primary-600" },
    { label: "Menunggu", value: getByStatus("menunggu"), color: "bg-amber-500" },
    { label: "Diproses", value: getByStatus("diproses"), color: "bg-blue-500" },
    { label: "Selesai", value: getByStatus("selesai"), color: "bg-emerald-500" },
  ];

  const barData = {
    labels: stats.per_kategori.map((k) => k.kategori),
    datasets: [
      {
        label: "Jumlah Pengaduan",
        data: stats.per_kategori.map((k) => k.jumlah),
        backgroundColor: "#2563eb",
        borderRadius: 6,
      },
    ],
  };

  const pieData = {
    labels: stats.per_status.map((s) => STATUS_LABEL[s.status]),
    datasets: [
      {
        data: stats.per_status.map((s) => s.jumlah),
        backgroundColor: ["#f59e0b", "#3b82f6", "#10b981"],
      },
    ],
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-xs text-slate-500">Selamat datang, {user?.name || "Admin"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg ${card.color} mb-3`} />
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-sm text-slate-500">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="font-semibold text-slate-700 mb-4">Pengaduan per Kategori</p>
            <Bar data={barData} />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="font-semibold text-slate-700 mb-4">Pengaduan per Status</p>
            <Pie data={pieData} />
          </div>
        </div>
      </main>
    </div>
  );
}

