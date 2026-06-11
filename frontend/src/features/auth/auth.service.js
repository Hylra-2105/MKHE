import { authApi } from "@/api/authApi";

// Service orchestration layer for Auth
// This sits between the API (HTTP) and the Store (State)
// NOTE: Backend uses successResponse → { success, message, data: {...} }
// This service unwraps the inner `data` field for methods that return token/user,
// so the store always receives { token, user } directly (not nested under .data)
export const authService = {
  register: async (userData) => {
    // returns { success, message } — store reads data.message
    return await authApi.register(userData);
  },

  login: async (credentials) => {
    // returns { success, message, data: { token, user } }
    // unwrap so store gets { token, user } directly
    const response = await authApi.login(credentials);
    return response.data;
  },

  verifyOTP: async (verificationData) => {
    return await authApi.verifyOTP(verificationData);
  },

  resendOTP: async (emailData) => {
    return await authApi.resendOTP(emailData);
  },

  socialLogin: async (socialData) => {
    // returns { success, message, data: { token, user } }
    // unwrap so store gets { token, user } directly
    const response = await authApi.socialLogin(socialData);
    return response.data;
  },

  forgotPassword: async (emailData) => {
    return await authApi.forgotPassword(emailData);
  },

  verifyResetOtp: async (data) => {
    // returns { success, message, data: { resetToken } }
    // unwrap so store gets { resetToken } directly
    const response = await authApi.verifyResetOtp(data);
    return response.data;
  },

  resetPassword: async (data) => {
    return await authApi.resetPassword(data);
  },

  refreshToken: async (data) => {
    const response = await authApi.refreshToken(data);
    return response.data; // { token, refreshToken }
  },

  logout: async (data) => {
    return await authApi.logout(data);
  },
};
