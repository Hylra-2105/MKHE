import axiosClient from "./axiosClient";

const analyticsApi = {
  getRevenue: async (period = "month") => {
    const response = await axiosClient.get("/analytics/revenue", { params: { period } });
    return response.data?.data;
  },

  getProductsReport: async () => {
    const response = await axiosClient.get("/analytics/products-report");
    return response.data?.data;
  },

  getAdvancedAnalytics: async (period = "month") => {
    const response = await axiosClient.get("/analytics/advanced", { params: { period } });
    return response.data?.data;
  },
};

export default analyticsApi;
