import axiosClient from "@/api/axiosClient";

export const nfcApi = {
  // Sinh hàng loạt mã NFC cho 1 sản phẩm
  generateTags: async (productId, count) => {
    const response = await axiosClient.post("/nfc-tags/generate", { productId, count });
    return response.data;
  },

  // Lấy danh sách mã NFC của 1 sản phẩm
  getTagsByProduct: async (productId) => {
    const response = await axiosClient.get(`/nfc-tags/product/${productId}`);
    return response.data;
  },

  // Kích hoạt 1 mã NFC (Chuyển sang ACTIVE)
  activateTag: async (uid) => {
    const response = await axiosClient.put(`/nfc-tags/${uid}/activate`);
    return response.data;
  },

  // Public API: Xác thực mã NFC
  verifyTag: async (uid, hash) => {
    const response = await axiosClient.get(`/nfc-tags/verify?uid=${uid}&hash=${hash}`);
    return response.data;
  }
};
