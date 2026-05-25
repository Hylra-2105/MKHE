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
  }
);

// KIỂM SOÁT KHI NHẬN VỀ (Xử lý lỗi Token hết hạn)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu Backend báo lỗi 401 (Unauthorized - Token sai hoặc hết hạn)
    if (error.response && error.response.status === 401) {
      // Xóa thông tin cũ và đá văng ra log in
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;