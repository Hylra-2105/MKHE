import axiosClient from "./axiosClient";

export const getBlogsApi = async (params) => {
  const response = await axiosClient.get("/blogs", { params });
  return response.data?.data;
};

export const getBlogBySlugApi = async (slug) => {
  const response = await axiosClient.get(`/blogs/${slug}`);
  return response.data?.data;
};

export const createBlogApi = async (data) => {
  const response = await axiosClient.post("/blogs", data);
  return response.data?.data;
};

export const updateBlogApi = async (id, data) => {
  const response = await axiosClient.put(`/blogs/${id}`, data);
  return response.data?.data;
};

export const deleteBlogApi = async (id) => {
  const response = await axiosClient.delete(`/blogs/${id}`);
  return response.data?.data;
};

export const uploadBlogImageApi = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axiosClient.post("/blogs/upload-image", formData);
  return response.data?.data?.url;
};
