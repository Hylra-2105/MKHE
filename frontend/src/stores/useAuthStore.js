import { create } from "zustand";
import { authApi } from "@/api/authApi";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isLoading: false,

  // REGISTER
  registerAction: async (userData) => {
    set({ isLoading: true });
    try {
      const data = await authApi.register(userData);
      set({ isLoading: false });
      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      return { success: false, message: errorMsg };
    }
  },

  // LOGIN
  loginAction: async (credentials) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(credentials);

      // Lưu vào LocalStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Cập nhật State
      set({
        user: data.user,
        token: data.token,
        isLoading: false,
      });

      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      return { success: false, message: errorMsg };
    }
  },

  // VERIFY OTP
  verifyOTPAction: async (verificationData) => {
    set({ isLoading: true });
    try {
      const data = await authApi.verifyOTP(verificationData);

      // Tự động reset loading sau 2 giây (khi chuyển trang xong)
      setTimeout(() => {
        set({ isLoading: false });
      }, 2000);

      return { success: true, message: data.message };
    } catch (error) {
      // Bị lỗi thì phải set về false để người dùng nhập lại mã khác
      set({ isLoading: false });
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      return { success: false, message: errorMsg };
    }
  },

  // RESEND OTP
  resendOTPAction: async (email) => {
    try {
      const data = await authApi.resendOTP({ email });
      return { success: true, message: data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      return { success: false, message: errorMsg };
    }
  },

  // SOCIAL LOGIN
  socialLoginAction: async (socialData) => {
    set({ isLoading: true });
    try {
      const data = await authApi.socialLogin(socialData);

      // Lưu Token và User vào LocalStorage y hệt đăng nhập thường
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        isLoading: false,
      });

      return { success: true, message: "LOGIN_SUCCESS" };
    } catch (error) {
      set({ isLoading: false });
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      return { success: false, message: errorMsg };
    }
  },

  // LOGOUT
  logoutAction: () => {
    // Xóa bộ nhớ trình duyệt
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Xóa State
    set({ user: null, token: null });
  },
}));
