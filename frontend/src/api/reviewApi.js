import axiosClient from "./axiosClient";
import { ENDPOINTS } from "@/constants/endpoints";

export const reviewApi = {
  createReview: (data) => {
    return axiosClient.post(ENDPOINTS.REVIEWS.CREATE, data);
  },
  getReviewsByProduct: (productId) => {
    return axiosClient.get(ENDPOINTS.REVIEWS.GET_BY_PRODUCT(productId));
  },
  getAllReviews: (params) => {
    return axiosClient.get(ENDPOINTS.REVIEWS.GET_ALL, { params });
  },
  toggleVisibility: (id) => {
    return axiosClient.patch(ENDPOINTS.REVIEWS.TOGGLE_VISIBILITY(id));
  },
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return axiosClient.post(ENDPOINTS.UPLOAD.IMAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
