import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getAdminAccount, updateAdminAccount } from "../../api/complaintApi";
import { useAuth } from "../../context/AuthContext";

export default function AccountSettings() {
  const { login: authLogin } = useAuth();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const res = await getAdminAccount();
      setAccount(res.data);
      setName(res.data.name || "");
      setUsername(res.data.username || "");
    } catch (err) {
      setError("Gagal memuat data akun");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validasi
    if (!currentPassword) {
      setError("Password saat ini wajib diisi untuk konfirmasi perubahan");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    if (!username.trim()) {
      setError("Username tidak boleh kosong");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        username: username.trim(),
        current_password: currentPassword,
      };

      if (newPassword) {
        payload.new_password = newPassword;
      }

      const res = await updateAdminAccount(payload);

      // Update session dengan token + data baru
      authLogin(res.data.token, res.data.user);

      setSuccess(res.data.message || "Akun berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Refresh data akun
      fetchAccount();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui akun");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Pengaturan Akun">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pengaturan Akun">
      <div className="max-w-lg mx-auto">

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-xl mb-5 flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-5 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Informasi Profil */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-base">👤</span> Informasi Profil
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Nama admin"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Username untuk login"
                />
                <p className="text-[11px] text-slate-400 mt-1">Username ini digunakan untuk login ke dashboard admin</p>
              </div>

              {account?.email && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <input
                    type="text"
                    value={account.email}
                    disabled
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ubah Password */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-base">🔒</span> Ubah Password
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Password Saat Ini <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                  >
                    {showCurrentPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-[11px] text-amber-600 mt-1">⚠️ Wajib diisi untuk mengkonfirmasi setiap perubahan</p>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Password Baru <span className="text-slate-400 font-normal">(kosongkan jika tidak ingin mengubah)</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                  >
                    {showNewPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                      confirmPassword && confirmPassword !== newPassword
                        ? "border-red-300 bg-red-50/50"
                        : confirmPassword && confirmPassword === newPassword
                        ? "border-green-300 bg-green-50/50"
                        : "border-slate-300"
                    }`}
                    placeholder="Ulangi password baru"
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[11px] text-red-500 mt-1">❌ Password tidak cocok</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-[11px] text-green-600 mt-1">✅ Password cocok</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || !currentPassword}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Menyimpan...
              </span>
            ) : (
              "💾 Simpan Perubahan"
            )}
          </button>

        </form>
      </div>
    </AdminLayout>
  );
}
