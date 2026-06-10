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
    // Nếu gửi file (FormData), phải xóa Content-Type để trình duyệt tự thêm boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Moi token từ LocalStorage hoặc SessionStorage
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      // Gắn vào Header theo chuẩn Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Truyền ngôn ngữ hiện tại của UI xuống Backend
    const currentLang = localStorage.getItem("i18nextLng") || "vi";
    config.headers["Accept-Language"] = currentLang;

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
      // Dựa vào API endpoint bị lỗi thay vì hardcode tên trang web
      const url = error.config?.url || "";
      // Các API auth (đăng nhập, quên pass...) trả về 401/403 là do sai thông tin -> Không đá văng
      // Ngoại trừ /auth/me (dùng để check session) nếu lỗi 401 thì chắc chắn token hỏng -> Đá văng
      const isAuthBusinessError = url.includes("/auth/") && !url.includes("/auth/me");

      if (!isAuthBusinessError) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        
        // Tránh redirect nếu đang ở sẵn trang login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
