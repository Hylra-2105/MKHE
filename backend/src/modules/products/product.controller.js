import Product from "./product.model.js";
import { createVietnameseRegex } from "../../utils/helpers.js";

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
      new: true, // Trả về cục data MỚI nhất sau khi sửa thành công
      runValidators: true, // Ép Mongoose chạy lại các điều kiện kiểm tra (ví dụ: giá không được âm)
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
      { new: true },
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
      { _id: id, status: "HIDDEN" }, // Điều kiện phải là sản phẩm đang bị xóa
      { status: "DRAFT" }, // Đổi về DRAFT
      { new: true }, // Trả về data sau khi cập nhật
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
