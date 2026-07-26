import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
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
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 max-w-3xl">
        <h1 className="text-xl font-bold text-slate-800 mb-6">Kelola Kategori</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-5 mb-6 flex flex-col md:flex-row gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kategori"
            required
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi (opsional)"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <button className="bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition">
            {editingId ? "Simpan" : "Tambah"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-500 text-sm px-3"
            >
              Batal
            </button>
          )}
        </form>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                  <td className="px-4 py-3 text-slate-500">{cat.description || "-"}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => handleEdit(cat)} className="text-primary-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:underline">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
