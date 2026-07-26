import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleLoginModal from "./GoogleLoginModal";
import { loginCitizen } from "../api/authApi";

export default function Navbar() {
  const { user: adminUser } = useAuth();
  const location = useLocation();
  
  // State for citizen
  const [citizen, setCitizen] = useState(() => {
    const saved = localStorage.getItem("sipadu_citizen");
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-primary-700 text-lg flex items-center gap-2">
          <span>SIPADU Desa</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/cek-status" className="text-slate-600 hover:text-primary-600 font-medium transition">
            Cek Status
          </Link>
          
          <Link
            to="/buat-pengaduan"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium shadow-sm"
          >
            Buat Pengaduan
          </Link>

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-slate-200" />

          {/* Citizen Section */}
          {citizen ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2 pr-3 py-1 rounded-full">
                <img
                  src={citizen.picture}
                  alt={citizen.name}
                  className="w-6 h-6 rounded-full bg-slate-200 object-cover"
                />
                <span className="font-medium text-xs text-slate-700 max-w-[100px] truncate">
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
              className="text-slate-600 hover:text-primary-600 font-medium transition"
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
              className="border border-primary-600 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition text-xs font-semibold"
            >
              Dashboard Admin
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="text-slate-500 hover:text-primary-600 text-xs font-semibold transition"
            >
              Login Admin
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-slate-700 hover:text-primary-600 p-2 rounded-lg focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-lg">
          <Link
            to="/cek-status"
            className="block text-slate-700 font-medium py-2 px-3 rounded-lg hover:bg-slate-50 text-sm"
          >
            🔍 Cek Status
          </Link>
          <Link
            to="/buat-pengaduan"
            className="block bg-primary-600 text-white font-medium py-2.5 px-3 rounded-lg text-center text-sm shadow-sm"
          >
            + Buat Pengaduan
          </Link>

          <hr className="border-slate-100" />

          {citizen ? (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                <img
                  src={citizen.picture}
                  alt={citizen.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="font-semibold text-xs text-slate-800">{citizen.name}</p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[160px]">{citizen.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg font-medium"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLoginModalOpen(true);
              }}
              className="w-full text-left font-medium text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50 text-sm"
            >
              🔑 Masuk Warga dengan Google
            </button>
          )}

          <hr className="border-slate-100" />

          {adminUser ? (
            <Link
              to="/admin/dashboard"
              className="block text-center border border-primary-600 text-primary-700 font-semibold py-2 px-3 rounded-lg text-xs hover:bg-primary-50"
            >
              Dashboard Admin
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="block text-center text-slate-500 font-medium py-2 px-3 rounded-lg text-xs hover:text-slate-700"
            >
              Login Admin
            </Link>
          )}
        </div>
      )}

      <GoogleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
}
