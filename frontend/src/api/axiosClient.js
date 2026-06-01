import axios from "axios";

const axiosClient = axios.create({
  // Thay thế bằng Base URL của bạn
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// KIỂM SOÁT TRƯỚC KHI GỬI (Gắn Token)
axiosClient.interceptors.request.use(
  (config) => {
    // Moi token từ LocalStorage ra
    const token = localStorage.getItem("token");
    if (token) {
      // Gắn vào Header theo chuẩn Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// KIỂM SOÁT KHI NHẬN VỀ (Xử lý lỗi Token hết hạn hoặc Bị khóa)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu Backend báo lỗi 401 (Hết hạn token) HOẶC 403 (Bị khóa/Không đủ quyền)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Không redirect nếu đang ở auth pages (login, register, verify-otp, etc)
      // Để user có thời gian đọc error message từ form
      const currentPath = window.location.pathname;
      const authPages = [
        "/login",
        "/register",
        "/verify-otp",
        "/forgot-password",
        "/reset-password",
        "/home",
      ];

      const isAuthPage = authPages.some((page) => currentPath.includes(page));

      if (!isAuthPage) {
        // Chỉ redirect nếu ở page khác (admin, user management, etc)
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
