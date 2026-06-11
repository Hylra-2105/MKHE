import { create } from "zustand";
import { authService } from "@/features/auth/auth.service";

// 🔥 Hàm an toàn để lấy User từ Storage (chống sập web)
const getSafeUser = () => {
  try {
    let userString = localStorage.getItem("user");
    if (!userString) {
      userString = sessionStorage.getItem("user");
    }
    if (!userString || userString === "undefined" || userString === "null") {
      return null;
    }
    return JSON.parse(userString);
  } catch (error) {
    console.warn("Lỗi khi đọc user từ storage, đã tự động dọn dẹp.", error);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    return null;
  }
};

const getSafeToken = () => {
  let token = localStorage.getItem("token");
  if (!token) {
    token = sessionStorage.getItem("token");
  }
  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    return null;
  }
  return token;
};

const getSafeRefreshToken = () => {
  let rToken = localStorage.getItem("refreshToken");
  if (!rToken) {
    rToken = sessionStorage.getItem("refreshToken");
  }
  if (!rToken || rToken === "undefined" || rToken === "null") {
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("refreshToken");
    return null;
  }
  return rToken;
};

export const useAuthStore = create((set) => ({
  user: getSafeUser(),
  token: getSafeToken(),
  refreshToken: getSafeRefreshToken(),
  isLoading: false,
  isFetchingUser: false,

  setFetchingUser: (status) => set({ isFetchingUser: status }),

  setUser: (newUser) => {
    if (sessionStorage.getItem("token")) {
      sessionStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.setItem("user", JSON.stringify(newUser));
    }
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
  loginAction: async (credentials, rememberMe = false) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(credentials);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      storage.setItem("refreshToken", data.refreshToken);
      storage.setItem("user", JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
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
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
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
  logoutAction: async () => {
    try {
      const currentRefreshToken = getSafeRefreshToken();
      if (currentRefreshToken) {
        await authService.logout({ refreshToken: currentRefreshToken });
      }
    } catch (error) {
      console.error("Lỗi khi logout backend:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");

      set({ user: null, token: null, refreshToken: null });
    }
  },
}));
