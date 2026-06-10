import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const axiosClient = axios.create({
  // Thay thế bằng Base URL của bạn
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
  async (error) => {
    const originalRequest = error.config;

    // Nếu Backend báo lỗi 401 (Hết hạn token) HOẶC 403 (Bị khóa/Không đủ quyền)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      const url = originalRequest?.url || "";

      // Ngăn chặn Vòng Lặp Vô Hạn: Nếu lỗi đến từ chính API refresh-token -> Kick ngay!
      if (url.includes("/auth/refresh-token")) {
        useAuthStore.getState().logoutAction();
        if (window.location.pathname !== "/login") window.location.href = "/login";
        return Promise.reject(error);
      }

      // Các API auth (đăng nhập, quên pass...) trả về 401/403 là do sai thông tin -> Không đá văng
      const isAuthBusinessError = url.includes("/auth/") && !url.includes("/auth/me");
      if (isAuthBusinessError) {
        return Promise.reject(error);
      }

      // NẾU LỖI LÀ DO HẾT HẠN ACCESS TOKEN (SẼ TIẾN HÀNH REFRESH)
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          // Xếp hàng đợi nếu đang có 1 request khác đang đi xin token mới rồi
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              return axiosClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        const refreshToken =
          localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          useAuthStore.getState().logoutAction();
          if (window.location.pathname !== "/login") window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          // Xin token mới bằng axios gốc (không dùng axiosClient để tránh dính interceptor)
          const response = await axios.post("http://localhost:5000/api/auth/refresh-token", {
            refreshToken,
          });

          const newAccessToken = response.data.data.token;
          const newRefreshToken = response.data.data.refreshToken;

          // Lưu token mới vào kho tương ứng (Local hoặc Session)
          if (localStorage.getItem("refreshToken")) {
            localStorage.setItem("token", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
          } else {
            sessionStorage.setItem("token", newAccessToken);
            sessionStorage.setItem("refreshToken", newRefreshToken);
          }

          // Cập nhật lên Zustand Store
          useAuthStore.setState({ token: newAccessToken, refreshToken: newRefreshToken });

          // Gắn token mới vào API đang bị lỗi và chạy lại nó
          originalRequest.headers.Authorization = "Bearer " + newAccessToken;
          
          processQueue(null, newAccessToken);
          return axiosClient(originalRequest);
          
        } catch (refreshError) {
          // Xin token thất bại (refresh token cũng hết hạn) -> Xóa hàng đợi và kick user
          processQueue(refreshError, null);
          useAuthStore.getState().logoutAction();
          if (window.location.pathname !== "/login") window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Lỗi 403 (Bị khóa) -> Kick ngay
        useAuthStore.getState().logoutAction();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
