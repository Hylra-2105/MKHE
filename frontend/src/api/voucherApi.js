import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../constants/endpoints";

export const getPublicVouchersApi = () => axiosClient.get(ENDPOINTS.VOUCHERS.PUBLIC);
export const collectVoucherApi = (voucherId) => axiosClient.post(ENDPOINTS.VOUCHERS.COLLECT, { voucherId });
export const collectVoucherByCodeApi = (code) => axiosClient.post(ENDPOINTS.VOUCHERS.COLLECT_BY_CODE, { code });
export const getUserWalletApi = () => axiosClient.get(ENDPOINTS.VOUCHERS.WALLET);
export const redeemOfflineVoucherApi = (userVoucherId) => axiosClient.post(ENDPOINTS.VOUCHERS.REDEEM_OFFLINE, { userVoucherId });
export const checkNfcClaimApi = (dppId) => axiosClient.get(ENDPOINTS.VOUCHERS.CHECK_NFC_CLAIM, { params: { dppId } });
export const claimNfcGachaApi = (dppId) => axiosClient.post(ENDPOINTS.VOUCHERS.CLAIM_NFC, { dppId });

// Admin/Staff APIs
export const getAdminVouchersApi = () => axiosClient.get(ENDPOINTS.VOUCHERS.ADMIN);
export const createVoucherApi = (data) => axiosClient.post(ENDPOINTS.VOUCHERS.ADMIN, data);
export const getVoucherOptionsApi = () => axiosClient.get(ENDPOINTS.VOUCHERS.OPTIONS);
