import axiosClient from "./axiosClient";

export const contactApi = {
  createContact(data) {
    return axiosClient.post("/contacts", data);
  },
  
  getAllContacts(params) {
    return axiosClient.get("/contacts", { params });
  },

  getContactById(id) {
    return axiosClient.get(`/contacts/${id}`);
  },

  updateContactStatus(id, status) {
    return axiosClient.put(`/contacts/${id}/status`, { status });
  },
};
