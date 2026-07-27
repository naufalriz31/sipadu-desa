import axiosClient from "./axiosClient";

export const getCategories = () => axiosClient.get("/categories");

export const submitComplaint = (formData) =>
  axiosClient.post("/complaints", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const checkComplaintStatus = (ticket) =>
  axiosClient.get(`/complaints/status/${ticket}`);

export const getMyComplaints = () => axiosClient.get("/complaints/my-complaints");


// ---- Admin ----
export const getDashboardStats = () => axiosClient.get("/admin/dashboard");

export const getAdminComplaints = (status) =>
  axiosClient.get("/admin/complaints", { params: status ? { status } : {} });

export const getComplaintDetail = (id) => axiosClient.get(`/admin/complaints/${id}`);

export const updateComplaintStatus = (id, payload) =>
  axiosClient.patch(`/admin/complaints/${id}/status`, payload);

export const deleteComplaint = (id) => axiosClient.delete(`/admin/complaints/${id}`);


export const getAdminCategories = () => axiosClient.get("/admin/categories");
export const createCategory = (payload) => axiosClient.post("/admin/categories", payload);
export const updateCategory = (id, payload) => axiosClient.put(`/admin/categories/${id}`, payload);
export const deleteCategory = (id) => axiosClient.delete(`/admin/categories/${id}`);

// ---- Admin Account ----
export const getAdminAccount = () => axiosClient.get("/admin/account");
export const updateAdminAccount = (payload) => axiosClient.put("/admin/account", payload);
