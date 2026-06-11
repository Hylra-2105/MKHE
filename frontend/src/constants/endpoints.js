const API_BASE_URL = "http://localhost:5000/api";

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
};
