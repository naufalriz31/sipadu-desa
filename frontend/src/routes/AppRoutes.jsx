import { Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import ComplaintForm from "../pages/public/ComplaintForm";
import ComplaintSuccess from "../pages/public/ComplaintSuccess";
import CheckStatus from "../pages/public/CheckStatus";

import Login from "../pages/admin/Login";
import Dashboard from "../pages/admin/Dashboard";
import ComplaintList from "../pages/admin/ComplaintList";
import ComplaintDetail from "../pages/admin/ComplaintDetail";
import CategoryManage from "../pages/admin/CategoryManage";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Publik */}
      <Route path="/" element={<Home />} />
      <Route path="/buat-pengaduan" element={<ComplaintForm />} />
      <Route path="/pengaduan-berhasil" element={<ComplaintSuccess />} />
      <Route path="/cek-status" element={<CheckStatus />} />

      {/* Admin */}
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pengaduan"
        element={
          <ProtectedRoute>
            <ComplaintList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pengaduan/:id"
        element={
          <ProtectedRoute>
            <ComplaintDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kategori"
        element={
          <ProtectedRoute>
            <CategoryManage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
