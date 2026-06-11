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
      vendor,
      hasDPP,
      artisanName,
      gpsLocation,
      file3D,
    } = req.body;

    // Validate cơ bản 
    if (!name || !sku || !categoryMatrix || price === undefined || !vendor) {
      return errorResponse(res, 400, "MISSING_REQUIRED_FIELDS");
    }

    // Validate Hộ chiếu số
    if (hasDPP) {
      if (!artisanName) return errorResponse(res, 400, "ARTISAN_NAME_REQUIRED");
      if (!gpsLocation) return errorResponse(res, 400, "GPS_LOCATION_REQUIRED");
    }

    // 3. Kiểm tra SKU đã tồn tại chưa
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return errorResponse(res, 400, "SKU_ALREADY_EXISTS");
    }

    // Tạo sản phẩm mới
    const newProduct = new Product({
      name,
      sku: sku.toUpperCase(),
      description,
      categoryMatrix,
      culturalDNA: culturalDNA || "OTHER",
      vendor, 
      price: Number(price),
      stock: Number(stock) || 0,
      images: images || [],
      hasDPP: hasDPP || false,
      artisanName: hasDPP ? artisanName : undefined,
      gpsLocation: hasDPP ? gpsLocation : undefined,
      file3D: hasDPP ? file3D : undefined,
    });

    await newProduct.save();

    return successResponse(res, 201, "PRODUCT_CREATED_SUCCESS", newProduct);
  } catch (error) {
    console.error("Error in createProduct:", error);
    if (error.name === "ValidationError" || error.message.includes("REQUIRED")) {
      return errorResponse(res, 400, error.message || "VALIDATION_ERROR");
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
    const vendor = req.query.vendor || "";

    const status = req.query.status || "";
    const inStock = req.query.inStock === "true"; 

    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      const searchRegex = createVietnameseRegex(search);
      query.$or = [
        { name: { $regex: searchRegex, $options: "i" } },
        { sku: { $regex: searchRegex, $options: "i" } },
      ];
    }

    if (category) query.categoryMatrix = category;
    if (culturalDNA) query.culturalDNA = culturalDNA;
    if (vendor) query.vendor = vendor; 

    if (status) {
      if (status === "ADMIN_ALL") {
        query.status = { $ne: "HIDDEN" };
      } else {
        query.status = status;
      }
    } else {
      query.status = { $in: ["ACTIVE", "PUBLISHED"] };
    }

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

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

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

    Object.assign(product, updates);

    const updatedProduct = await product.save();

    return successResponse(res, 200, "PRODUCT_UPDATED_SUCCESS", updatedProduct);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    if (error.name === "ValidationError" || error.message.includes("REQUIRED")) {
      return errorResponse(res, 400, error.message || "VALIDATION_ERROR");
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
    if (!deletedProduct) return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    return successResponse(res, 200, "PRODUCT_DELETED_SUCCESS", deletedProduct);
  } catch (error) {
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
    if (!restoredProduct) return errorResponse(res, 404, "PRODUCT_NOT_FOUND_IN_TRASH");
    return successResponse(res, 200, "PRODUCT_RESTORED_SUCCESS", restoredProduct);
  } catch (error) {
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [POST] /api/products/:id/upload-gallery - Upload multiple images
export const uploadProductGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 400, "MISSING_FILE");
    }

    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 404, "PRODUCT_NOT_FOUND");

    const imageUrls = req.files.map((file) => file.path);
    product.images = [...(product.images || []), ...imageUrls];
    
    await product.save();
    return successResponse(res, 200, "GALLERY_UPLOAD_SUCCESS", product);
  } catch (error) {
    console.error("[Upload Gallery] Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [POST] /api/products/:id/upload-3d - Upload 3D file
export const uploadProduct3D = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "MISSING_FILE");
    }

    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 404, "PRODUCT_NOT_FOUND");

    product.file3D = req.file.path;
    
    await product.save();
    return successResponse(res, 200, "FILE_3D_UPLOAD_SUCCESS", product);
  } catch (error) {
    console.error("[Upload 3D] Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [DELETE] /api/products/:id/delete-images
export const deleteProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagesToDelete } = req.body;

    if (!imagesToDelete || !Array.isArray(imagesToDelete) || imagesToDelete.length === 0) {
      return errorResponse(res, 400, "NO_IMAGES_TO_DELETE");
    }

    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 404, "PRODUCT_NOT_FOUND");

    for (const imageUrl of imagesToDelete) {
      try {
        const urlParts = imageUrl.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const isVideo = imageUrl.includes("mkhe_videos");
        const folder = isVideo ? "mkhe_videos" : "mkhe_avatars";
        const resourceType = isVideo ? "video" : "image";
        const publicId = `${folder}/${publicIdWithExt.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId, { type: "upload", resource_type: resourceType });
      } catch (error) {
        console.error(`[Delete Image] Failed to delete ${imageUrl}`);
      }
    }

    product.images = product.images.filter((img) => !imagesToDelete.includes(img));
    await product.save();

    return successResponse(res, 200, "IMAGES_DELETED_SUCCESS", product);
  } catch (error) {
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};