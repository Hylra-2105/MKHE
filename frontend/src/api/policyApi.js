import axiosClient from "./axiosClient";

const policyApi = {
  getAll: (params) => axiosClient.get("/policies", { params }),
  getBySlug: (slug) => axiosClient.get(`/policies/${slug}`),
  create: (data) => axiosClient.post("/policies", data),
  update: (id, data) => axiosClient.put(`/policies/${id}`, data),
  delete: (id) => axiosClient.delete(`/policies/${id}`),
};

export default policyApi;
