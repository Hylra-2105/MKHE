import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/constants/endpoints";

export const shopService = {
  getProducts: async (params) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.SHOP.GET_PRODUCTS, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getB2BProducts: async (params) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.SHOP.GET_B2B_PRODUCTS, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
