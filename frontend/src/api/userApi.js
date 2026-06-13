import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/constants/endpoints";

export const userApi = {
  // Lấy danh sách users
  getAllUsers: async (page = 1, limit = 5, search = "", role = "") => {
    const response = await axiosClient.get(ENDPOINTS.USERS.GET_ALL, {
      params: { page, limit, search, role },
    });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axiosClient.post("/users", userData);
    return response.data;
  },

  // Cập nhật profile của user hiện tại
  updateProfile: async (profileData) => {
    const response = await axiosClient.put(
      ENDPOINTS.USERS.UPDATE_PROFILE,
      profileData,
    );
    return response.data;
  },

  // Upload Avatar
  uploadAvatar: async (formData) => {
    const response = await axiosClient.post("/users/upload-avatar", formData, {
      headers: {
        // dòng này để Backend (Multer) hiểu được đây là file
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Admin cập nhật user
  updateUser: async (userId, updateData) => {
    const response = await axiosClient.put(
      `${ENDPOINTS.USERS.UPDATE}/${userId}`,
      updateData,
    );
    return response.data;
  },

  // Admin xóa user
  deleteUser: async (userId) => {
    const response = await axiosClient.delete(
      `${ENDPOINTS.USERS.DELETE}/${userId}`,
    );
    return response.data;
  },
};

// For backward compatibility
export const getAllUsersApi = (page, limit, search, role) => {
  return userApi.getAllUsers(page, limit, search, role);
};