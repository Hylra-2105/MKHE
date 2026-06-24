import Blog from "./blog.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { cloudinary } from "../../config/cloudinary.js";

// Lấy danh sách blog (lọc, phân trang)
export const getBlogs = async (req, res) => {
  try {
    const { category, status, productTag, page = 1, limit = 10, search } = req.query;
    
    let filter = {};
    
    // Nếu không phải admin, chỉ cho xem bài viết PUBLISHED
    if (req.user?.role !== "Admin" && req.user?.role !== "Staff") {
      filter.status = "PUBLISHED";
    } else if (status) {
      filter.status = status;
    }
    
    if (category) filter.category = category;
    if (productTag) filter.tags = productTag;
    
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const blogs = await Blog.find(filter)
      .populate("author", "fullname email")
      .populate("tags", "name sku price images")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(filter);

    return successResponse(res, 200, "Lấy danh sách blog thành công", {
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("[getBlogs] Error:", error);
    return errorResponse(res, 500, "Lỗi server khi lấy danh sách blog");
  }
};

// Lấy chi tiết blog theo slug hoặc ID
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Check if the parameter is a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isObjectId ? { _id: slug } : { slug: slug };

    const blog = await Blog.findOne(query)
      .populate("author", "fullname")
      .populate("tags", "name sku price images categoryMatrix stock");

    if (!blog) {
      return errorResponse(res, 404, "Không tìm thấy bài viết");
    }

    if (blog.status === "DRAFT" && req.user?.role !== "Admin" && req.user?.role !== "Staff") {
      return errorResponse(res, 403, "Bạn không có quyền xem bài viết này");
    }

    return successResponse(res, 200, "Lấy bài viết thành công", blog);
  } catch (error) {
    console.error("[getBlogBySlug] Error:", error);
    return errorResponse(res, 500, "Lỗi server khi lấy chi tiết blog");
  }
};

// Tạo blog mới
export const createBlog = async (req, res) => {
  try {
    const { title, content, thumbnail, category, status, tags } = req.body;
    
    if (!title || !content || !category) {
      return errorResponse(res, 400, "Vui lòng nhập đủ Tiêu đề, Nội dung và Danh mục");
    }

    if (tags && tags.length > 4) {
      return errorResponse(res, 400, "Chỉ được liên kết tối đa 4 sản phẩm");
    }

    const newBlog = new Blog({
      title,
      content,
      thumbnail,
      category,
      status: status || "DRAFT",
      tags: tags || [],
      author: req.user._id,
    });

    await newBlog.save();
    return successResponse(res, 201, "Tạo bài viết thành công", newBlog);
  } catch (error) {
    console.error("[createBlog] Error:", error);
    return errorResponse(res, 500, "Lỗi server khi tạo blog");
  }
};

// Cập nhật blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, thumbnail, category, status, tags } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) return errorResponse(res, 404, "Không tìm thấy bài viết");

    if (tags && tags.length > 4) {
      return errorResponse(res, 400, "Chỉ được liên kết tối đa 4 sản phẩm");
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (thumbnail !== undefined) blog.thumbnail = thumbnail;
    if (category) blog.category = category;
    if (status) blog.status = status;
    if (tags) blog.tags = tags;

    await blog.save();
    return successResponse(res, 200, "Cập nhật bài viết thành công", blog);
  } catch (error) {
    console.error("[updateBlog] Error:", error);
    return errorResponse(res, 500, "Lỗi server khi cập nhật blog");
  }
};

// Xóa blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return errorResponse(res, 404, "Không tìm thấy bài viết");

    await Blog.findByIdAndDelete(id);
    return successResponse(res, 200, "Xóa bài viết thành công");
  } catch (error) {
    console.error("[deleteBlog] Error:", error);
    return errorResponse(res, 500, "Lỗi server khi xóa blog");
  }
};

// Upload ảnh từ Rich Text Editor
export const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "Không có file nào được upload");
    }

    // req.file là kết quả từ multer-storage-cloudinary
    const imageUrl = req.file.path;
    
    return successResponse(res, 200, "Upload ảnh thành công", { url: imageUrl });
  } catch (error) {
    console.error("[uploadBlogImage] Error:", error);
    return errorResponse(res, 500, "Lỗi server khi upload ảnh blog");
  }
};
