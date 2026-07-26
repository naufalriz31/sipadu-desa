import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/pengaduan", label: "Pengaduan" },
  { to: "/admin/kategori", label: "Kategori" },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-60 bg-white border-r border-slate-200 min-h-screen flex flex-col">
      <div className="p-5 border-b border-slate-200">
        <p className="font-bold text-primary-700">SIPADU Desa</p>
        <p className="text-xs text-slate-500">{user?.name}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

