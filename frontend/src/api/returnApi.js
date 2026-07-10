import axiosClient from "./axiosClient";

const returnApi = {
  createReturn: async (data) => {
    const response = await axiosClient.post("/returns", data);
    return response.data;
  },
  getAdminReturns: async (params) => {
    const response = await axiosClient.get("/returns/admin", { params });
    return response.data;
  },
  updateReturnStatus: async (id, data) => {
    const response = await axiosClient.put(`/returns/admin/${id}/status`, data);
    return response.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axiosClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getReturnById: async (id) => {
    const response = await axiosClient.get(`/returns/${id}`);
    return response.data;
  },
  getUserReturns: async (params) => {
    const response = await axiosClient.get("/returns/user", { params });
    return response.data;
  },
};

export default returnApi;
