import axiosClient from "./axiosClient";

export const dppApi = {
  /**
   * Verify NFC tag and fetch public product data for DPP
   * @param {string} uid - NFC UID from URL path
   * @param {string} hash - NFC Hash from URL query
   */
  verifyDPP: async (uid, hash) => {
    try {
      const response = await axiosClient.get(`/dpp/verify/${uid}?hash=${hash}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Lỗi kết nối tới server" };
    }
  },
};
