import Product from "./product.model.js";
import { cloudinary } from "../../config/cloudinary.js";
import { createVietnameseRegex } from "../../utils/helpers.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { createBulkMarketingNotifications } from "../notifications/notification.controller.js";
import { getIO } from "../../config/socket.js";

// [POST] /api/products - Tạo sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      story,
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
      craftVillage,
      material,
      salePrice,
      saleStartDate,
      saleEndDate,
      status,
      isPublicEvent,
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
      story,
      categoryMatrix,
      culturalDNA: culturalDNA || "OTHER",
      craftVillage: craftVillage || "",
      material: material || [],
      vendor, 
      price: Number(price),
      stock: Number(stock) || 0,
      images: images || [],
      hasDPP: hasDPP || false,
      artisanName: hasDPP ? artisanName : undefined,
      gpsLocation: hasDPP ? gpsLocation : undefined,
      file3D: hasDPP ? file3D : undefined,
      salePrice: salePrice ? Number(salePrice) : undefined,
      saleStartDate: saleStartDate || undefined,
      saleEndDate: saleEndDate || undefined,
      status: status || "DRAFT",
      isPublicEvent: isPublicEvent === "true" || isPublicEvent === true,
    });

    await newProduct.save();

    if (newProduct.status === "PUBLISHED") {
      try {
        getIO().emit("product_created", newProduct);
      } catch (err) {
        console.error("Socket emit product_created error:", err);
      }
    }

    if (newProduct.status === "PUBLISHED" && newProduct.isPublicEvent) {
      const now = new Date();
      const saleStarts = new Date(newProduct.saleStartDate);
      if (newProduct.salePrice > 0 && saleStarts <= now) {
        await createBulkMarketingNotifications(
          "FLASH_SALE_TITLE",
          `FLASH_SALE_MESSAGE::${newProduct.name}`,
          `/shop/${newProduct._id}`
        );
        newProduct.isPublicEvent = false;
        await newProduct.save();

        try {
          getIO().emit("product_updated", newProduct);
        } catch (err) {}
      }
    }

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
import fs from "fs";

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
      query.status = { $in: ["PUBLISHED", "OUT_OF_STOCK"] };
    }

    if (inStock !== false) {
      query.stock = { $gt: 0 };
    }

    let sortQuery = { createdAt: -1, _id: -1 };
    if (!status) {
      sortQuery = { status: -1, createdAt: -1, _id: -1 };
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    fs.appendFileSync(
      "c:\\React\\MKHE\\search_debug.txt", 
      JSON.stringify({ time: new Date(), query, totalProducts, searchStr: search, url: req.originalUrl }) + "\n"
    );

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
    
    // Tìm kiếm bằng Mongoose ObjectId (nếu ID dài 24 ký tự hex) HOẶC bằng mã SKU
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } 
    
    // Nếu không tìm thấy bằng ObjectId hoặc ID không phải định dạng hex, thử tìm theo SKU
    if (!product) {
      product = await Product.findOne({ sku: id.toUpperCase() });
    }

    if (!product) {
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

    return successResponse(res, 200, "GET_PRODUCT_SUCCESS", product);
  } catch (error) {
    console.error("Error in getProductById:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [GET] /api/products/shop/:id - Lấy chi tiết 1 sản phẩm cho E-com (có check status và B2B)
export const getShopProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm kiếm bằng Mongoose ObjectId hoặc bằng mã SKU
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } 
    
    if (!product) {
      product = await Product.findOne({ sku: id.toUpperCase() });
    }

    if (!product) {
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

    // Chỉ trả về nếu sản phẩm đang PUBLISHED, ACTIVE, hoặc OUT_OF_STOCK
    if (!["PUBLISHED", "ACTIVE", "OUT_OF_STOCK"].includes(product.status)) {
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

    // Phân quyền hiển thị (B2B Security)
    const isB2B = ["B2B_Luxury", "B2B_Standard"].includes(product.categoryMatrix);
    const isGuest = !req.user || req.user.role === "Guest";

    if (isB2B && isGuest) {
      return errorResponse(res, 403, "FORBIDDEN"); // Khách vãng lai không xem được B2B
    }

    return successResponse(res, 200, "GET_PRODUCT_SUCCESS", product);
  } catch (error) {
    console.error("Error in getShopProductById:", error);
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

    if (updatedProduct.status === "PUBLISHED" && updatedProduct.isPublicEvent) {
      const now = new Date();
      const saleStarts = new Date(updatedProduct.saleStartDate);
      if (updatedProduct.salePrice > 0 && saleStarts <= now) {
        createBulkMarketingNotifications(
          "FLASH_SALE_TITLE",
          `FLASH_SALE_MESSAGE::${updatedProduct.name}`,
          `/shop/${updatedProduct._id}`
        );
        updatedProduct.isPublicEvent = false;
        await updatedProduct.save();
      }
    }

    try {
      getIO().emit("product_updated", updatedProduct);
    } catch (err) {
      console.error("[Socket] Emit product_updated error:", err);
    }

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
    
    try {
      getIO().emit("product_updated", deletedProduct);
    } catch (err) {}

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
      .sort({ updatedAt: -1, _id: -1 })
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
    const imageUrls = req.files.map((file) => file.path);
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );
    
    if (!updatedProduct) return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    return successResponse(res, 200, "GALLERY_UPLOAD_SUCCESS", updatedProduct);
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
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { file3D: req.file.path },
      { new: true }
    );
    
    if (!updatedProduct) return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    return successResponse(res, 200, "FILE_3D_UPLOAD_SUCCESS", updatedProduct);
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

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $pull: { images: { $in: imagesToDelete } } },
      { new: true }
    );

    return successResponse(res, 200, "IMAGES_DELETED_SUCCESS", updatedProduct);
  } catch (error) {
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [GET] /api/products/shop - Lấy danh sách sản phẩm cho trang Shop (bảo vệ B2B)
export const getShopProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const { search, category, culturalDNA, craftVillage, material } = req.query;

    const skip = (page - 1) * limit;

    let query = {
      status: { $in: ["PUBLISHED", "OUT_OF_STOCK"] }
    };

    // --- LOGIC BẢO MẬT B2B ---
    // Khách vãng lai (!req.user) HOẶC user là Guest -> Chỉ xem B2C
    if (!req.user || req.user.role === "Guest") {
      query.categoryMatrix = { $in: ["B2C_Premium", "B2C_Mass_Premium"] };
    }

    let andConditions = [];

    if (search) {
      const searchRegex = createVietnameseRegex(search);
      andConditions.push({
        $or: [
          { name: { $regex: searchRegex, $options: "i" } },
          { sku: { $regex: searchRegex, $options: "i" } },
        ]
      });
    }

    // Các bộ lọc
    // Chú ý: Nếu Guest truyền bộ lọc B2B_Luxury, nó sẽ ghi đè categoryMatrix thành "B2B_Luxury".
    // Nên ta phải cẩn thận: nếu Guest truyền bộ lọc B2B, ta bỏ qua hoặc trả về rỗng.
    if (category) {
      if (!req.user || req.user.role === "Guest") {
        if (!category.startsWith("B2B_")) {
          query.categoryMatrix = category;
        } else {
          // Khách muốn tìm B2B -> Ép tìm kiếm vô nghĩa
          query.categoryMatrix = "NO_ACCESS";
        }
      } else {
         query.categoryMatrix = category;
      }
    }
    
    if (culturalDNA) query.culturalDNA = culturalDNA;
    
    if (craftVillage) {
      const cvRegex = createVietnameseRegex(craftVillage);
      andConditions.push({
        $or: [
          { craftVillage: { $regex: cvRegex, $options: "i" } },
          { vendor: { $regex: cvRegex, $options: "i" } }
        ]
      });
    }
    
    // Tìm material (có chứa trong mảng)
    const materialQuery = req.query.material || req.query["material[]"];
    if (materialQuery) {
      const materialList = Array.isArray(materialQuery) ? materialQuery : materialQuery.split(",");
      const materialRegexes = materialList.map(m => new RegExp(`^${m.trim()}$`, "i"));
      query.material = { $in: materialRegexes };
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ status: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    return successResponse(res, 200, "GET_SHOP_PRODUCTS_SUCCESS", {
      pagination: {
        totalItems: totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
      data: products,
    });
  } catch (error) {
    console.error("Error in getShopProducts:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};