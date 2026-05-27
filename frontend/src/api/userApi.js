import axios from "axios";
// 1. Import store của bạn vào đây (Sửa lại đường dẫn nếu cần)
import { useAuthStore } from "@/stores/useAuthStore";

const API_URL = "http://localhost:5000/api/users";

export const getAllUsersApi = async (
  page = 1,
  limit = 5,
  search = "",
  role = "",
) => {
  const token = useAuthStore.getState().token;

  const response = await axios.get(API_URL, {
    params: { page, limit, search, role },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
