import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleLoginModal from "./GoogleLoginModal";
import { loginCitizen } from "../api/authApi";

export default function Navbar() {
  const { user: adminUser } = useAuth();
  
  // State for citizen
  const [citizen, setCitizen] = useState(() => {
    const saved = localStorage.getItem("sipadu_citizen");
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync state if localStorage changes
  useEffect(() => {
    const checkCitizen = () => {
      const saved = localStorage.getItem("sipadu_citizen");
      setCitizen(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener("storage", checkCitizen);
    return () => window.removeEventListener("storage", checkCitizen);
  }, []);

  const handleLoginSuccess = async (googleUser) => {
    try {
      const res = await loginCitizen(googleUser);
      localStorage.setItem("sipadu_citizen_token", res.data.token);
      localStorage.setItem("sipadu_citizen", JSON.stringify(res.data.user));
      setCitizen(res.data.user);
      
      // Dispatch a storage event so other components sync up immediately
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sipadu_citizen_token");
    localStorage.removeItem("sipadu_citizen");
    setCitizen(null);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-primary-700 text-lg flex items-center gap-2">
          <span>SIPADU Desa</span>
        </Link>
        
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/cek-status" className="text-slate-600 hover:text-primary-600 font-medium">
            Cek Status
          </Link>
          
          <Link
            to="/buat-pengaduan"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Buat Pengaduan
          </Link>

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-slate-200" />

          {/* Citizen Section */}
          {citizen ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 pl-2 pr-3 py-1 rounded-full">
                <img
                  src={citizen.picture}
                  alt={citizen.name}
                  className="w-6 h-6 rounded-full bg-slate-200 object-cover"
                />
                <span className="font-medium text-xs text-slate-700 max-w-[100px] truncate border-none">
                  {citizen.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-slate-600 hover:text-primary-600 font-medium"
            >
              Masuk Warga
            </button>
          )}

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-slate-200" />

          {/* Admin Link Section */}
          {adminUser ? (
            <Link
              to="/admin/dashboard"
              className="border border-primary-600 text-primary-650 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition text-xs font-semibold"
            >
              Dashboard Admin
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="text-slate-500 hover:text-primary-600 text-xs font-semibold"
            >
              Login Admin
            </Link>
          )}
        </nav>
      </div>

      <GoogleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
}
