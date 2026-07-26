import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/complaintApi";

export default function CategoryManage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadCategories = () => {
    getAdminCategories().then((res) => setCategories(res.data));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateCategory(editingId, { name, description });
    } else {
      await createCategory({ name, description });
    }
    resetForm();
    loadCategories();
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus kategori ini?")) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <AdminLayout title="Kelola Kategori">
      <div className="max-w-3xl space-y-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kategori"
            required
            className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi (opsional)"
            className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <button className="bg-primary-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary-700 transition text-sm flex-1 sm:flex-none shadow-sm">
              {editingId ? "Simpan" : "Tambah"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-slate-500 text-sm px-3 hover:text-slate-700"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-slate-50 text-slate-500 text-left border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Nama</th>
                  <th className="px-4 py-3.5 font-semibold">Deskripsi</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-800">{cat.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{cat.description || "-"}</td>
                    <td className="px-4 py-3.5 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-primary-600 hover:underline font-medium text-xs bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-600 hover:underline font-medium text-xs bg-red-50 px-2.5 py-1 rounded-md border border-red-100"
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
      </div>
    </AdminLayout>
  );
}
