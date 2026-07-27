import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/pengaduan", label: "Pengaduan", icon: "📝" },
  { to: "/admin/kategori", label: "Kategori", icon: "📂" },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: "⚙️" },
];

export default function Sidebar({ isMobileOpen, onCloseMobile, isCollapsed, toggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-sm ${
          isMobileOpen ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-20" : "md:w-60"}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between h-16">
          {!isCollapsed ? (
            <div>
              <p className="font-bold text-primary-700 text-base">SIPADU Desa</p>
              <p className="text-xs text-slate-500 truncate max-w-[150px]">{user?.name || "Admin"}</p>
            </div>
          ) : (
            <div className="mx-auto text-primary-700 font-bold text-lg">S</div>
          )}

          {/* Desktop Toggle Collapse Button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          >
            {isCollapsed ? "▶" : "◀"}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                } ${isCollapsed ? "justify-center" : ""}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition w-full ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Keluar" : undefined}
          >
            <span className="text-lg">🚪</span>
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
