import api from "./axiosClient";

const orderApi = {
  sendCheckoutOtp: async (data) => {
    const response = await api.post("/orders/send-checkout-otp", data);
    return response.data;
  },
  checkout: async (data) => {
    const response = await api.post("/orders/checkout", data);
    return response.data;
  },
  getMyOrderStats: async () => {
    const response = await api.get("/orders/my-stats");
    return response.data;
  },
};

export default orderApi;
