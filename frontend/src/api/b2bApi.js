import axiosClient from "./axiosClient";

export const getB2BProductsApi = async (params) => {
  const response = await axiosClient.get("/b2b/products", { params });
  return response.data.data;
};

export const createB2BOrderApi = async (formData) => {
  const response = await axiosClient.post("/b2b/orders", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMyB2BOrdersApi = async () => {
  const response = await axiosClient.get("/b2b/orders/me");
  return response.data;
};

export const getAllB2BOrdersApi = async () => {
  const response = await axiosClient.get("/b2b/orders");
  return response.data;
};

export const uploadB2BQuoteApi = async (id, formData) => {
  const response = await axiosClient.put(`/b2b/orders/${id}/quote`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const confirmB2BOrderApi = async (id) => {
  const response = await axiosClient.put(`/b2b/orders/${id}/confirm`);
  return response.data;
};

export const updateB2BOrderStatusApi = async (id, status) => {
  const response = await axiosClient.put(`/b2b/orders/${id}/status`, { status });
  return response.data;
};

export const addB2BOrderCommentApi = async (id, text) => {
  const response = await axiosClient.post(`/b2b/orders/${id}/comments`, { text });
  return response.data;
};
