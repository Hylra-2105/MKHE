import { create } from "zustand";
import { authApi } from "@/api/authApi";

// 🔥 Hàm an toàn để lấy User từ LocalStorage (chống sập web)
const getSafeUser = () => {
  try {
    const userString = localStorage.getItem("user");
    // Kiểm tra kỹ xem nó có bị lỗi kiểu chuỗi "undefined" hay không
    if (!userString || userString === "undefined") {
      return null;
    }
    return JSON.parse(userString);
  } catch (error) {
    console.warn(
      "Lỗi khi đọc user từ localStorage, đã tự động dọn dẹp.",
      error,
    );
    localStorage.removeItem("user"); // Dọn luôn cái rác gây lỗi
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getSafeUser(), // Xài hàm an toàn ở đây
  token: localStorage.getItem("token") || null,
  isLoading: false,

  setUser: (newUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    set({ user: newUser });
  },

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

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

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

      setTimeout(() => {
        set({ isLoading: false });
      }, 2000);

      return { success: true, message: data.message };
    } catch (error) {
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

  // send otp reset password
  forgotPasswordAction: async (email) => {
    set({ isLoading: true });
    try {
      const data = await authApi.forgotPassword({ email });
      set({ isLoading: false });
      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      return { success: false, message: errorMsg };
    }
  },

  // verify reset otp
  verifyResetOtpAction: async (email, otp) => {
    set({ isLoading: true });
    try {
      const data = await authApi.verifyResetOtp({ email, otp });
      set({ isLoading: false });
      // Trả về resetToken để component lưu lại mang sang trang ResetPassword
      return { success: true, resetToken: data.resetToken };
    } catch (error) {
      set({ isLoading: false });
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      return { success: false, message: errorMsg };
    }
  },

  // reser password
  resetPasswordAction: async (email, resetToken, newPassword) => {
    set({ isLoading: true });
    try {
      const data = await authApi.resetPassword({
        email,
        resetToken,
        newPassword,
      });
      set({ isLoading: false });
      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      return { success: false, message: errorMsg };
    }
  },

  // LOGOUT
  logoutAction: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({ user: null, token: null });
  },
}));
