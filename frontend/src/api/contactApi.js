import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/constants/endpoints";

export const createContactApi = async (data) => {
  const response = await axiosClient.post(ENDPOINTS.CONTACTS.CREATE, data);
  return response.data;
};
