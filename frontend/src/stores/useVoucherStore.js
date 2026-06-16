import { create } from "zustand";
import { getPublicVouchersApi, collectVoucherApi, getUserWalletApi } from "../api/voucherApi";
import toast from "react-hot-toast";
import i18n from "@/i18n";

export const useVoucherStore = create((set, get) => ({
  publicVouchers: [],
  walletVouchers: [],
  isLoadingPublic: false,
  isLoadingWallet: false,
  isCollecting: false,

  fetchPublicVouchers: async () => {
    set({ isLoadingPublic: true });
    try {
      const response = await getPublicVouchersApi();
      set({ publicVouchers: response.data, isLoadingPublic: false });
    } catch (error) {
      console.error("Lỗi fetch public vouchers:", error);
      set({ isLoadingPublic: false });
    }
  },

  fetchWalletVouchers: async () => {
    set({ isLoadingWallet: true });
    try {
      const response = await getUserWalletApi();
      set({ walletVouchers: response.data, isLoadingWallet: false });
    } catch (error) {
      console.error("Lỗi fetch wallet vouchers:", error);
      set({ isLoadingWallet: false });
    }
  },

  collectVoucher: async (voucherId) => {
    set({ isCollecting: true });
    try {
      await collectVoucherApi(voucherId);
      toast.success(i18n.t("toast.collected", { ns: "common", defaultValue: "Đã lưu mã giảm giá vào ví!" }));
      // Refresh wallet
      await get().fetchWalletVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("toast.collect_error", { ns: "common", defaultValue: "Lỗi lưu mã giảm giá" }));
    } finally {
      set({ isCollecting: false });
    }
  },
}));
