import axiosClient from "./axiosClient";

const analyticsApi = {
  getRevenue: async (params = { period: "month" }) => {
    const queryParams = typeof params === "string" ? { period: params } : params;
    const response = await axiosClient.get("/analytics/revenue", { params: queryParams });
    return response.data?.data;
  },

  getProductsReport: async (params) => {
    const response = await axiosClient.get("/analytics/products-report", { params });
    return response.data?.data;
  },

  getAdvancedAnalytics: async (params = { period: "month" }) => {
    const queryParams = typeof params === "string" ? { period: params } : params;
    const response = await axiosClient.get("/analytics/advanced", { params: queryParams });
    return response.data?.data;
  },
};

export default analyticsApi;
