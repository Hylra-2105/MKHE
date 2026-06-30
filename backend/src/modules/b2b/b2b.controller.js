import Product from "../products/product.model.js";
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
