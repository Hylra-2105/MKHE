import axiosClient from "@/api/axiosClient";

export const productApi = {
  getAllProducts: async (
    page = 1,
    limit = 5,
    search = "",
    category = "",
    culturalDNA = "",
    status = "",
    inStock = false,
    vendor = "",
  ) => {
    const response = await axiosClient.get("/products", {
      params: {
        page,
        limit,
        search,
        category,
        culturalDNA,
        status,
        inStock,
        vendor,
      },
    });
    return response.data;
  },

  // Tạo sản phẩm mới
  createProduct: async (productData) => {
    const response = await axiosClient.post("/products", productData);
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getProductById: async (productId) => {
    const response = await axiosClient.get(`/products/${productId}`);
    return response.data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (productId, updateData) => {
    const response = await axiosClient.put(
      `/products/${productId}`,
      updateData,
    );
    return response.data;
  },

  // Xóa mềm sản phẩm
  deleteProduct: async (productId) => {
    const response = await axiosClient.delete(`/products/${productId}`);
    return response.data;
  },

  // Lấy danh sách sản phẩm đã xóa
  getDeletedProducts: async (page = 1, limit = 5) => {
    const response = await axiosClient.get("/products/trash", {
      params: { page, limit },
    });
    return response.data;
  },

  // khôi phục sản phẩm đã xóa
  restoreProduct: async (id) => {
    const response = await axiosClient.put(`/products/${id}/restore`);
    return response.data;
  },

  // Upload gallery cho sản phẩm
  uploadProductGallery: async (productId, formData) => {
    const response = await axiosClient.post(
      `/products/${productId}/upload-gallery`,
      formData
    );
    return response.data;
  },

  // Upload hộ chiếu số (3D file)
  uploadProduct3D: async (id, formData) => {
    const response = await axiosClient.post(`/products/${id}/upload-3d`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Xóa images từ sản phẩm (Cloudinary + Database)
  deleteProductImages: async (productId, imagesToDelete) => {
    const response = await axiosClient.delete(
      `/products/${productId}/delete-images`,
      {
        data: { imagesToDelete },
      },
    );
    return response.data;
  },
};
