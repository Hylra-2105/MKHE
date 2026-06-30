import axiosClient from "./axiosClient";
import { ENDPOINTS } from "@/constants/endpoints";

export const getChatHistoryApi = async () => {
  const response = await axiosClient.get(ENDPOINTS.AI.HISTORY);
  return response.data;
};

export const sendChatMessageApi = async (message) => {
  const response = await axiosClient.post(ENDPOINTS.AI.CHAT, { message });
  return response.data;
};
