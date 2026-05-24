import { create } from "zustand";
import { authApi } from "@/api/authApi";

export const useAuthStore = create((set) => ({
  user: null, 
  isLoading: false,

  registerAction: async (userData) => {
    set({ isLoading: true });
    try {
      const data = await authApi.register(userData);
      set({ isLoading: false });
      
      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      const errorMsg = error.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại!";
      return { success: false, message: errorMsg };
    }
  },
}));