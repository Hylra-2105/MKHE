import Product from "./product.model.js";
import { cloudinary } from "../../config/cloudinary.js";
import { createVietnameseRegex } from "../../utils/helpers.js";
import { successResponse, errorResponse } from "../../utils/response.js";

// [POST] /api/products - Tạo sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    const { name, sku, description, categoryMatrix, price, stock, images } =
      req.body;

    // 1. Validate cơ bản (Bắt buộc phải có các trường này)
    if (!name || !sku || !categoryMatrix || price === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "MISSING_REQUIRED_FIELDS" });
    }

    // 2. Kiểm tra SKU đã tồn tại chưa (Tuyệt đối không để trùng)
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res
        .status(400)
        .json({ success: false, message: "SKU_ALREADY_EXISTS" });
    }

    // 3. Tạo sản phẩm mới
    const newProduct = new Product({
      name,
      sku: sku.toUpperCase(), // Ép kiểu in hoa cho đồng bộ
      description,
      categoryMatrix,
      price: Number(price),
      stock: Number(stock) || 0,
      images: images || [],
      // Status sẽ tự động là DRAFT theo default của Model
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "PRODUCT_CREATED_SUCCESS",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    // Bắt lỗi Validation của Mongoose (ví dụ sai enum B2B/B2C, giá âm...)
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "SERVER_ERROR" });
  }
};

// [GET] /api/products - Lấy danh sách sản phẩm với phân trang
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const category = req.query.category || "";

    const skip = (page - 1) * limit;

    let query = {};

    // 1. Nếu có từ khóa search -> Tìm theo Tên hoặc theo mã SKU (không phân biệt hoa thường và dấu tiếng Việt)
    if (search) {
      const searchRegex = createVietnameseRegex(search);
      query.$or = [
        { name: { $regex: searchRegex, $options: "i" } },
        { sku: { $regex: searchRegex, $options: "i" } },
      ];
    }

    // 2. Nếu có chọn Phân loại ma trận (B2B, B2C...) -> Lọc đúng loại đó
    if (category) {
      query.categoryMatrix = category;
    }

    // 3. Không lấy sản phẩm đã xóa mềm (status = HIDDEN)
    query.status = { $ne: "HIDDEN" };

    // Đếm tổng số sản phẩm phù hợp
    const totalProducts = await Product.countDocuments(query);

    // Lấy dữ liệu theo phân trang và sắp xếp mới nhất lên đầu
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
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
    return res.status(500).json({ success: false, message: "SERVER_ERROR" });
  }
};

// [GET] /api/products/:id - Lấy chi tiết 1 sản phẩm
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tạm thời bỏ populate đi vì mình chưa tạo bảng DPP_Profile
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "PRODUCT_NOT_FOUND" });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error in getProductById:", error);
    return res.status(500).json({ success: false, message: "SERVER_ERROR" });
  }
};

// [PUT] /api/products/:id - Cập nhật thông tin sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Bẫy nghiệp vụ: Nếu Admin sửa SKU, phải kiểm tra xem SKU mới có bị trùng với sản phẩm KHÁC không
    if (updates.sku) {
      updates.sku = updates.sku.toUpperCase();
      const existingProduct = await Product.findOne({
        sku: updates.sku,
        _id: { $ne: id }, // Tìm xem có ai trùng SKU ngoại trừ chính nó không
      });
      if (existingProduct) {
        return res
          .status(400)
          .json({ success: false, message: "SKU_ALREADY_EXISTS" });
      }
    }

    // Tiến hành cập nhật dữ liệu mới
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "PRODUCT_NOT_FOUND" });
    }

    return res.status(200).json({
      success: true,
      message: "PRODUCT_UPDATED_SUCCESS",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "SERVER_ERROR" });
  }
};

// [DELETE] /api/products/:id - Xóa mềm sản phẩm (Soft Delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Luật Tech Lead: Không dùng hàm xóa hẳn mà chuyển trạng thái (status) sang 'HIDDEN' để bảo toàn dữ liệu đơn hàng cũ
    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { status: "HIDDEN" },
      { returnDocument: "after" },
    );

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "PRODUCT_NOT_FOUND" });
    }

    return res.status(200).json({
      success: true,
      message: "PRODUCT_DELETED_SUCCESS",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({ success: false, message: "SERVER_ERROR" });
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

    res.status(200).json({
      success: true,
      data: trashedProducts,
      pagination: { total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm sản phẩm đang bị ẩn và đổi trạng thái về DRAFT
    const restoredProduct = await Product.findOneAndUpdate(
      { _id: id, status: "HIDDEN" },
      { status: "DRAFT" },
      { returnDocument: "after" },
    );

    if (!restoredProduct) {
      return res
        .status(404)
        .json({ success: false, message: "PRODUCT_NOT_FOUND_IN_TRASH" });
    }

    return res.status(200).json({
      success: true,
      message: "PRODUCT_RESTORED_SUCCESS",
      data: restoredProduct,
    });
  } catch (error) {
    console.error("Error in restoreProduct:", error);
    return res.status(500).json({ success: false, message: "SERVER_ERROR" });
  }
};

// [POST] /api/products/:id/upload-gallery - Upload multiple images cho sản phẩm
export const uploadProductGallery = async (req, res) => {
  try {
    console.log("[Upload Gallery] Request received");
    console.log("[Upload Gallery] Files:", req.files?.length);

    // Nếu middleware của Multer không bắt được file
    if (!req.files || req.files.length === 0) {
      console.error("[Upload Gallery] No files provided");
      return errorResponse(res, 400, "MISSING_FILE");
    }

    const { id } = req.params;
    console.log("[Upload Gallery] Product ID:", id);

    // Lấy URLs từ Cloudinary
    const imageUrls = req.files.map((file) => file.path);
    console.log("[Upload Gallery] Image URLs:", imageUrls);

    // Tìm sản phẩm
    const product = await Product.findById(id);
    if (!product) {
      console.error("[Upload Gallery] Product not found:", id);
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

    console.log(
      "[Upload Gallery] Current images count:",
      product.images?.length,
    );

    // Thêm ảnh vào gallery (hoặc thay thế nếu muốn)
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

    // Xóa từng ảnh từ Cloudinary (thu thập lỗi nhưng vẫn tiếp tục xóa ảnh khác)
    const deletionErrors = [];
    for (const imageUrl of imagesToDelete) {
      try {
        // Extract public_id từ Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/mkhe_avatars/{public_id}
        const urlParts = imageUrl.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `mkhe_avatars/${publicIdWithExt.split(".")[0]}`;

        console.log(`[Delete Image] Attempting to delete: ${publicId}`);

        // Xóa từ Cloudinary
        const deleteResult = await cloudinary.uploader.destroy(publicId, {
          type: "upload",
          resource_type: "image",
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

    // Cập nhật product: remove những ảnh đã xóa (cả thành công lẫn thất bại)
    product.images = product.images.filter(
      (img) => !imagesToDelete.includes(img),
    );
    await product.save();

    // Nếu có lỗi xóa nhưng vẫn xóa thành công từ DB, vẫn trả về success
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
