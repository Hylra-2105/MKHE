import Product from "../products/product.model.js";
import User from "../users/user.model.js";
import B2BOrder from "./b2bOrder.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { createVietnameseRegex } from "../../utils/helpers.js";

// [GET] /api/b2b/products
export const getB2BProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || "";
    const category = req.query.category || "";

    const skip = (page - 1) * limit;

    let query = {
      status: { $in: ["PUBLISHED", "OUT_OF_STOCK"] },
      categoryMatrix: { $in: ["B2B_Luxury", "B2B_Standard"] },
      isService: true, // CHỈ lấy các Gói Dịch Vụ
    };

    if (search) {
      const searchRegex = createVietnameseRegex(search);
      query.$or = [
        { name: { $regex: searchRegex, $options: "i" } },
        { sku: { $regex: searchRegex, $options: "i" } },
      ];
    }

    if (category) {
      query.categoryMatrix = category;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(res, 200, "GET_B2B_PRODUCTS_SUCCESS", {
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
      data: products,
    });
  } catch (error) {
    console.error("Error in getB2BProducts:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [POST] /api/b2b/orders
export const createB2BOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productOrService, quantity, budget, deliveryDate, packagingRequirement, note } = req.body;

    if (!productOrService || !quantity || !deliveryDate) {
      return errorResponse(res, 400, "MISSING_REQUIRED_FIELDS");
    }

    // Fetch user to get company details
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }

    // If files uploaded via Cloudinary
    const designFiles = req.files && req.files.length > 0 
      ? req.files.map((file) => file.path) 
      : [];

    const newOrder = new B2BOrder({
      user: userId,
      companyName: user.companyName,
      taxCode: user.taxCode,
      phone: user.phone,
      logo: user.avatar,
      productOrService,
      quantity,
      budget: budget || 0,
      deliveryDate,
      packagingRequirement: packagingRequirement || "",
      designFiles,
      note,
    });

    await newOrder.save();

    return successResponse(res, 201, "CREATE_B2B_ORDER_SUCCESS", newOrder);
  } catch (error) {
    console.error("Error in createB2BOrder:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

