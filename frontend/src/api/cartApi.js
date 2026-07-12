import axiosClient from "./axiosClient";
import { ENDPOINTS } from "@/constants/endpoints";

export const getCartApi = async () => {
  const response = await axiosClient.get(ENDPOINTS.CART.GET);
  return response.data;
};

export const syncCartApi = async (items) => {
  const response = await axiosClient.post(ENDPOINTS.CART.SYNC, { items });
  return response.data;
};

export const updateCartItemApi = async (productId, quantity, color) => {
  const response = await axiosClient.put(ENDPOINTS.CART.ITEMS, { productId, quantity, color });
  return response.data;
};

export const removeCartItemApi = async (productId, color) => {
  const params = color ? { color } : {};
  const response = await axiosClient.delete(`${ENDPOINTS.CART.ITEMS}/${productId}`, { params });
  return response.data;
};
