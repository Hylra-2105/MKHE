import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const api = axios.create({
  baseURL: "/api/vouchers",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPublicVouchersApi = () => api.get("/public");
export const collectVoucherApi = (voucherId) => api.post("/collect", { voucherId });
export const getUserWalletApi = () => api.get("/wallet");
export const redeemOfflineVoucherApi = (userVoucherId) => api.post("/redeem-offline", { userVoucherId });
