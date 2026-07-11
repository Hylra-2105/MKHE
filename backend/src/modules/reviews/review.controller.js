import Review from "./review.model.js";
import Product from "../products/product.model.js";
import User from "../users/user.model.js";
import Order from "../orders/order.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { createVietnameseRegex } from "../../utils/helpers.js";

// Tính toán lại ratingAverage và ratingCount
const calculateAverageRating = async (productId) => {
  const stats = await Review.aggregate([
    {
      $match: { product: productId, isHidden: false },
    },
    {
      $group: {
        _id: "$product",
        ratingCount: { $sum: 1 },
        ratingAverage: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingCount: stats[0].ratingCount,
      ratingAverage: Math.round(stats[0].ratingAverage * 10) / 10,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingCount: 0,
      ratingAverage: 0,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { product, order, rating, comment, images } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 400, "INVALID_RATING");
    }

    // 1. Kiểm tra đơn hàng có tồn tại, thuộc về user và đã COMPLETED không
    const orderDoc = await Order.findOne({
      _id: order,
      user: userId,
      orderStatus: "COMPLETED",
    });

    if (!orderDoc) {
      return errorResponse(res, 403, "ORDER_NOT_COMPLETED_OR_NOT_FOUND");
    }

    // 2. Kiểm tra xem product có nằm trong đơn hàng đó không
    const isProductInOrder = orderDoc.items.some(
      (item) => item.product.toString() === product
    );

    if (!isProductInOrder) {
      return errorResponse(res, 403, "PRODUCT_NOT_IN_ORDER");
    }

    // 3. Tạo review (Schema có unique index ngăn duplicate review/product/order)
    const newReview = await Review.create({
      product,
      user: userId,
      order,
      rating,
      comment,
      images: images || [],
    });

    // Cập nhật trạng thái đã đánh giá cho item trong đơn hàng
    const itemIndex = orderDoc.items.findIndex(
      (item) => item.product.toString() === product
    );
    if (itemIndex > -1) {
      orderDoc.items[itemIndex].isReviewed = true;
      await orderDoc.save();
    }

    // 4. Update rating statistics
    await calculateAverageRating(newReview.product);

    return successResponse(res, 201, "REVIEW_CREATED_SUCCESS", newReview);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, "ALREADY_REVIEWED");
    }
    console.error("[Create Review Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId, isHidden: false })
      .populate("user", "name avatar")
      .sort("-createdAt");

    return successResponse(res, 200, "REVIEWS_FETCHED", reviews);
  } catch (error) {
    console.error("[Get Reviews Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const sortConfig = { [sortField]: sortOrder };
    const query = {};

    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    if (req.query.search) {
      const safeSearchStr = createVietnameseRegex(req.query.search);
      const regex = new RegExp(safeSearchStr, "i");
      
      const productIds = await Product.find({ 
        $or: [{ name: regex }, { sku: regex }] 
      }).distinct("_id");
      
      const userIds = await User.find({ 
        $or: [{ name: regex }, { email: regex }] 
      }).distinct("_id");
      
      query.$or = [
        { comment: regex },
        { product: { $in: productIds } },
        { user: { $in: userIds } }
      ];
    }

    const reviews = await Review.find(query)
      .populate("user", "name email phone avatar isBlocked role bio addresses")
      .populate("product", "name sku")
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    return successResponse(res, 200, "REVIEWS_FETCHED", {
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total,
    });
  } catch (error) {
    console.error("[Get All Reviews Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return errorResponse(res, 404, "REVIEW_NOT_FOUND");
    }

    review.isHidden = !review.isHidden;
    await review.save();

    // Re-calculate rating
    await calculateAverageRating(review.product);

    return successResponse(res, 200, "REVIEW_VISIBILITY_TOGGLED", review);
  } catch (error) {
    console.error("[Toggle Visibility Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
