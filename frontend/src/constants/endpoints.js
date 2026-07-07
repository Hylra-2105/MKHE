const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
    SOCIAL_LOGIN: `${API_BASE_URL}/auth/social-login`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    VERIFY_RESET_OTP: `${API_BASE_URL}/auth/verify-reset-otp`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    SEND_CHANGE_PASSWORD_OTP: `${API_BASE_URL}/auth/send-change-password-otp`,
    VERIFY_CHANGE_PASSWORD_OTP: `${API_BASE_URL}/auth/verify-change-password-otp`,
    CHANGE_PASSWORD_OTP: `${API_BASE_URL}/auth/change-password-otp`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  USERS: {
    GET_ALL: `${API_BASE_URL}/users`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE: `${API_BASE_URL}/users`,
    DELETE: `${API_BASE_URL}/users`,
  },
  CONTACTS: {
    CREATE: `${API_BASE_URL}/contacts`,
  },
  SHOP: {
    GET_PRODUCTS: `${API_BASE_URL}/products/shop`,
    GET_B2B_PRODUCTS: `${API_BASE_URL}/b2b/products`,
  },
  CART: {
    GET: `${API_BASE_URL}/cart`,
    SYNC: `${API_BASE_URL}/cart/sync`,
    ITEMS: `${API_BASE_URL}/cart/items`,
  },
  VOUCHERS: {
    PUBLIC: `${API_BASE_URL}/vouchers/public`,
    COLLECT: `${API_BASE_URL}/vouchers/collect`,
    COLLECT_BY_CODE: `${API_BASE_URL}/vouchers/collect-by-code`,
    WALLET: `${API_BASE_URL}/vouchers/wallet`,
    REDEEM_OFFLINE: `${API_BASE_URL}/vouchers/redeem-offline`,
    ADMIN: `${API_BASE_URL}/vouchers/admin`,
    OPTIONS: `${API_BASE_URL}/vouchers/options`,
    CHECK_NFC_CLAIM: `${API_BASE_URL}/vouchers/check-nfc-claim`,
    CLAIM_NFC: `${API_BASE_URL}/vouchers/claim-nfc`,
    ADMIN_DETAIL: (id) => `${API_BASE_URL}/vouchers/admin/${id}`,
  },
  REVIEWS: {
    CREATE: `${API_BASE_URL}/reviews`,
    GET_BY_PRODUCT: (id) => `${API_BASE_URL}/reviews/product/${id}`,
    GET_ALL: `${API_BASE_URL}/reviews`,
    TOGGLE_VISIBILITY: (id) => `${API_BASE_URL}/reviews/${id}/toggle-visibility`,
  },
  UPLOAD: {
    IMAGE: `${API_BASE_URL}/upload/image`,
  },
  AI: {
    CHAT: `${API_BASE_URL}/ai/chat`,
    HISTORY: `${API_BASE_URL}/ai/chat/history`,
  },
};
