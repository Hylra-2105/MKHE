import axios from "axios";
import { ENDPOINTS } from "@/constants/endpoints";

export const authApi = {
  // Gọi API Đăng ký
  register: async (userData) => {
    const response = await axios.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },
  
  // Hàm Login để dành cho bước sau...
  login: async (credentials) => {
    // ...
  }
};
