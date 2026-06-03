import Product from "./product.model.js";
import { cloudinary } from "../../config/cloudinary.js";
import { createVietnameseRegex } from "../../utils/helpers.js";
import { successResponse, errorResponse } from "../../utils/response.js";

// [POST] /api/products - Tạo sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      categoryMatrix,
      culturalDNA,
      price,
      stock,
      images,
    } = req.body;

    // 1. Validate cơ bản
    if (!name || !sku || !categoryMatrix || price === undefined) {
      return errorResponse(res, 400, "MISSING_REQUIRED_FIELDS");
    }

    // 2. Kiểm tra SKU đã tồn tại chưa
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return errorResponse(res, 400, "SKU_ALREADY_EXISTS");
    }

    // 3. Tạo sản phẩm mới
    const newProduct = new Product({
      name,
      sku: sku.toUpperCase(),
      description,
      categoryMatrix,
      culturalDNA: culturalDNA || "OTHER", // Hứng dữ liệu mã gen văn hóa
      price: Number(price),
      stock: Number(stock) || 0,
      images: images || [],
    });

    await newProduct.save();

    return successResponse(res, 201, "PRODUCT_CREATED_SUCCESS", newProduct);
  } catch (error) {
    console.error("Error in createProduct:", error);
    if (error.name === "ValidationError") {
      return errorResponse(res, 400, "VALIDATION_ERROR");
    }
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [GET] /api/products - Lấy danh sách sản phẩm với phân trang
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const culturalDNA = req.query.culturalDNA || "";

    // === THÊM 2 THAM SỐ MỚI ĐỂ LỌC CHO GUEST ===
    const status = req.query.status || "";
    const inStock = req.query.inStock === "true"; // Nếu FE truyền inStock=true thì mới lọc

    const skip = (page - 1) * limit;

    let query = {};

    // 1. Nếu có từ khóa search
    if (search) {
      const searchRegex = createVietnameseRegex(search);
      query.$or = [
        { name: { $regex: searchRegex, $options: "i" } },
        { sku: { $regex: searchRegex, $options: "i" } },
      ];
    }

    // 2. Nếu có chọn Phân loại ma trận
    if (category) {
      query.categoryMatrix = category;
    }

    // 3. Lọc theo Mã gen văn hóa
    if (culturalDNA) {
      query.culturalDNA = culturalDNA;
    }

    // === 4. LỌC TRẠNG THÁI (STATUS) ===
    // Nếu FE truyền status cụ thể: Lọc chính xác
    // Nếu FE truyền status="" (empty): Lấy ACTIVE + PUBLISHED (guest/user safe)
    // Nếu FE không truyền status: Lấy ACTIVE + PUBLISHED (default safe)
    if (status) {
      // Status được truyền và không rỗng
      if (status === "ADMIN_ALL") {
        // Special case: Admin lấy tất cả trừ HIDDEN
        query.status = { $ne: "HIDDEN" };
      } else {
        // Lọc status cụ thể
        query.status = status;
      }
    } else {
      // Default: Lấy PUBLISHED hoặc ACTIVE (safe cho guest/user)
      query.status = { $in: ["ACTIVE", "PUBLISHED"] };
    }

    // === 5. LỌC TỒN KHO (CHỈ LẤY HÀNG CÒN) ===
    // Luôn filter inStock cho guest/user safety
    if (inStock !== false) {
      query.stock = { $gt: 0 };
    }

    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    return successResponse(res, 200, "GET_PRODUCTS_SUCCESS", {
      pagination: {
        totalItems: totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
      data: products,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [GET] /api/products/:id - Lấy chi tiết 1 sản phẩm
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

    return successResponse(res, 200, "GET_PRODUCT_SUCCESS", product);
  } catch (error) {
    console.error("Error in getProductById:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [PUT] /api/products/:id - Cập nhật thông tin sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.sku) {
      updates.sku = updates.sku.toUpperCase();
      const existingProduct = await Product.findOne({
        sku: updates.sku,
        _id: { $ne: id },
      });
      if (existingProduct) {
        return errorResponse(res, 400, "SKU_ALREADY_EXISTS");
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedProduct) {
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

    return successResponse(res, 200, "PRODUCT_UPDATED_SUCCESS", updatedProduct);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    if (error.name === "ValidationError") {
      return errorResponse(res, 400, "VALIDATION_ERROR");
    }
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [DELETE] /api/products/:id - Xóa mềm sản phẩm (Soft Delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { status: "HIDDEN" },
      { returnDocument: "after" },
    );

    if (!deletedProduct) {
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

    return successResponse(res, 200, "PRODUCT_DELETED_SUCCESS", deletedProduct);
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const getDeletedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments({ status: "HIDDEN" });
    const trashedProducts = await Product.find({ status: "HIDDEN" })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(res, 200, "GET_TRASHED_SUCCESS", {
      data: trashedProducts,
      pagination: { total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error in getDeletedProducts:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const restoredProduct = await Product.findOneAndUpdate(
      { _id: id, status: "HIDDEN" },
      { status: "DRAFT" },
      { returnDocument: "after" },
    );

    if (!restoredProduct) {
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND_IN_TRASH");
    }

    return successResponse(
      res,
      200,
      "PRODUCT_RESTORED_SUCCESS",
      restoredProduct,
    );
  } catch (error) {
    console.error("Error in restoreProduct:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [POST] /api/products/:id/upload-gallery - Upload multiple images cho sản phẩm
export const uploadProductGallery = async (req, res) => {
  try {
    console.log("[Upload Gallery] Request received");
    console.log("[Upload Gallery] Files:", req.files?.length);

    if (!req.files || req.files.length === 0) {
      console.error("[Upload Gallery] No files provided");
      return errorResponse(res, 400, "MISSING_FILE");
    }

    const { id } = req.params;
    console.log("[Upload Gallery] Product ID:", id);

    const imageUrls = req.files.map((file) => file.path);
    console.log("[Upload Gallery] Image URLs:", imageUrls);

    const product = await Product.findById(id);
    if (!product) {
      console.error("[Upload Gallery] Product not found:", id);
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

    console.log(
      "[Upload Gallery] Current images count:",
      product.images?.length,
    );

    product.images = [...(product.images || []), ...imageUrls];
    console.log("[Upload Gallery] New images count:", product.images.length);

    await product.save();
    console.log("[Upload Gallery] Product saved successfully");

    return successResponse(res, 200, "GALLERY_UPLOAD_SUCCESS", product);
  } catch (error) {
    console.error("[Upload Gallery] Error:", error.message || error);
    console.error("[Upload Gallery] Error stack:", error.stack);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [DELETE] /api/products/:id/delete-images - Xóa images từ Cloudinary + Database
export const deleteProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagesToDelete } = req.body;

    if (
      !imagesToDelete ||
      !Array.isArray(imagesToDelete) ||
      imagesToDelete.length === 0
    ) {
      return errorResponse(res, 400, "NO_IMAGES_TO_DELETE");
    }

    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 404, "PRODUCT_NOT_FOUND");

    const deletionErrors = [];
    for (const imageUrl of imagesToDelete) {
      try {
        const urlParts = imageUrl.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const isVideo = imageUrl.includes("mkhe_videos");
        const folder = isVideo ? "mkhe_videos" : "mkhe_avatars";
        const resourceType = isVideo ? "video" : "image";
        const publicId = `${folder}/${publicIdWithExt.split(".")[0]}`;

        console.log(`[Delete Image] Attempting to delete: ${publicId} as ${resourceType}`);

        const deleteResult = await cloudinary.uploader.destroy(publicId, {
          type: "upload",
          resource_type: resourceType,
        });
        console.log(`[Delete Image] Cloudinary delete result:`, deleteResult);
      } catch (error) {
        console.error(
          `[Delete Image] Failed to delete ${imageUrl}:`,
          error.message || error,
        );
        deletionErrors.push(imageUrl);
      }
    }

    product.images = product.images.filter(
      (img) => !imagesToDelete.includes(img),
    );
    await product.save();

    if (deletionErrors.length > 0) {
      console.warn(
        `[Delete Image] Partially successful. Failed to delete ${deletionErrors.length}/${imagesToDelete.length} images from Cloudinary`,
      );
    }

    return successResponse(res, 200, "IMAGES_DELETED_SUCCESS", product);
  } catch (error) {
    console.error("[Delete Images] Fatal error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
