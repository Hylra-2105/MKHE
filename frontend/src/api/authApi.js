import axiosClient from "./axiosClient";
import { ENDPOINTS } from "@/constants/endpoints";

export const authApi = {
  // Đăng ký
  register: async (userData) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  // API login
  login: async (credentials) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  // Xác thực OTP
  verifyOTP: async (verificationData) => {
    const response = await axiosClient.post(
      "/auth/verify-email",
      verificationData,
    );
    return response.data;
  },

  // Gửi lại OTP
  resendOTP: async (data) => {
    const response = await axiosClient.post("/auth/resend-otp", data);
    return response.data;
  },

  socialLogin: async (socialData) => {
    const response = await axiosClient.post("/auth/social-login", socialData);
    return response.data;
  },
};
