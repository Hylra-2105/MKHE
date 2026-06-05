import { create } from "zustand";
import { authService } from "@/features/auth/auth.service";

// 🔥 Hàm an toàn để lấy User từ LocalStorage (chống sập web)
const getSafeUser = () => {
  try {
    const userString = localStorage.getItem("user");
    if (!userString || userString === "undefined" || userString === "null") {
      return null;
    }
    return JSON.parse(userString);
  } catch (error) {
    console.warn("Lỗi khi đọc user từ localStorage, đã tự động dọn dẹp.", error);
    localStorage.removeItem("user");
    return null;
  }
};

const getSafeToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("token");
    return null;
  }
  return token;
};

export const useAuthStore = create((set) => ({
  user: getSafeUser(),
  token: getSafeToken(),
  isLoading: false,

  setUser: (newUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    set({ user: newUser });
  },

  // REGISTER
  registerAction: async (userData) => {
    set({ isLoading: true });
    try {
      const data = await authService.register(userData);
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
      const data = await authService.login(credentials);

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
      const data = await authService.verifyOTP(verificationData);

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
      const data = await authService.resendOTP({ email });
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
      const data = await authService.socialLogin(socialData);

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
      const data = await authService.forgotPassword({ email });
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
      const data = await authService.verifyResetOtp({ email, otp });
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
      const data = await authService.resetPassword({
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
