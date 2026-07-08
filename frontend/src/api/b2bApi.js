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
