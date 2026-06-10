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
      ENDPOINTS.AUTH.VERIFY_EMAIL,
      verificationData,
    );
    return response.data;
  },

  // Gửi lại OTP
  resendOTP: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.RESEND_OTP, data);
    return response.data;
  },

  // login = gg
  socialLogin: async (socialData) => {
    const response = await axiosClient.post(
      ENDPOINTS.AUTH.SOCIAL_LOGIN,
      socialData,
    );
    return response.data;
  },

  // send otp reset password
  forgotPassword: async (data) => {
    const response = await axiosClient.post(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data,
    );
    return response.data;
  },

  // verify reset otp
  verifyResetOtp: async (data) => {
    const response = await axiosClient.post(
      ENDPOINTS.AUTH.VERIFY_RESET_OTP,
      data,
    );
    return response.data;
  },

  // reset password
  resetPassword: async (data) => {
    const response = await axiosClient.post(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      data,
    );
    return response.data;
  },

  // send change password otp
  sendChangePasswordOtp: async (data) => {
    const response = await axiosClient.post(
      ENDPOINTS.AUTH.SEND_CHANGE_PASSWORD_OTP,
      data,
    );
    return response.data;
  },

  // verify change password otp
  verifyChangePasswordOtp: async (data) => {
    const response = await axiosClient.post(
      ENDPOINTS.AUTH.VERIFY_CHANGE_PASSWORD_OTP,
      data,
    );
    return response.data;
  },

  // change password with otp
  changePasswordWithOtp: async (data) => {
    const response = await axiosClient.put(
      ENDPOINTS.AUTH.CHANGE_PASSWORD_OTP,
      data,
    );
    return response.data;
  },

  // get current user info
  getMe: async () => {
    const response = await axiosClient.get("/auth/me");
    return response.data;
  },

  // refresh token
  refreshToken: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, data);
    return response.data;
  },

  // logout
  logout: async (data) => {
    const response = await axiosClient.post(ENDPOINTS.AUTH.LOGOUT, data);
    return response.data;
  },
};
