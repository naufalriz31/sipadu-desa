import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

// Sisipkan token secara otomatis jika ada
axiosClient.interceptors.request.use((config) => {
  const isAdminRequest = config.url.includes("/admin");
  const token = isAdminRequest
    ? (sessionStorage.getItem("sipadu_token") || localStorage.getItem("sipadu_token"))
    : (localStorage.getItem("sipadu_citizen_token") || sessionStorage.getItem("sipadu_token") || localStorage.getItem("sipadu_token"));
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jika token kedaluwarsa/invalid -> paksa logout sesuai session
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAdminRequest = err.config?.url?.includes("/admin");
      if (isAdminRequest) {
        sessionStorage.removeItem("sipadu_token");
        sessionStorage.removeItem("sipadu_user");
        localStorage.removeItem("sipadu_token");
        localStorage.removeItem("sipadu_user");
        window.location.href = "/admin/login";
      } else {
        localStorage.removeItem("sipadu_citizen_token");
        localStorage.removeItem("sipadu_citizen");
      }
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
