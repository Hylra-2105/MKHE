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
  getMyOrders: async (params) => {
    const response = await api.get("/orders/me", { params });
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/orders/me/${id}`);
    return response.data;
  },
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/me/${id}/cancel`);
    return response.data;
  },
  receiveOrder: async (id) => {
    const response = await api.put(`/orders/me/${id}/receive`);
    return response.data;
  },
  // Admin Methods
  getAllOrdersAdmin: async (params) => {
    // params can include: page, limit, status, search, startDate, endDate, highRisk
    const response = await api.get("/orders/admin", { params });
    return response.data;
  },
  updateOrderStatusAdmin: async (id, status, paymentStatus) => {
    const payload = { status };
    if (paymentStatus) payload.paymentStatus = paymentStatus;
    const response = await api.put(`/orders/admin/${id}/status`, payload);
    return response.data;
  },
};

export default orderApi;
