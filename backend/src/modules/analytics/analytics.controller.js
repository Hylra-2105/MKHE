import Order from "../orders/order.model.js";
import Product from "../products/product.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";

// GET /api/analytics/revenue
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = "month" } = req.query; // "week", "month", "year"

    const now = new Date();
    let startDate = new Date();

    if (period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // default to 30 days if invalid
      startDate.setDate(now.getDate() - 30);
    }

    // Only PAID orders
    const orders = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format data for chart
    const data = orders.map((order) => ({
      date: order._id,
      revenue: order.revenue,
    }));

    return successResponse(res, 200, "REVENUE_ANALYTICS_FETCHED", data);
  } catch (error) {
    console.error("getRevenueAnalytics Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// GET /api/analytics/products-report
export const getProductsReport = async (req, res) => {
  try {
    // Top 5 products by sold count, tie-breaker by name
    const topProducts = await Product.find({ status: { $ne: "HIDDEN" }, isDeleted: false })
      .sort({ sold: -1, name: 1 })
      .limit(5)
      .select("name sku sold price images");

    // Low stock products (< 10)
    const lowStockProducts = await Product.find({
      stock: { $lt: 10 },
      isDeleted: false,
    }).select("name sku stock images");

    return successResponse(res, 200, "PRODUCTS_REPORT_FETCHED", {
      topProducts,
      lowStockProducts,
    });
  } catch (error) {
    console.error("getProductsReport Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
// GET /api/analytics/advanced
export const getAdvancedAnalytics = async (req, res) => {
  try {
    const { period = "month" } = req.query;

    const now = new Date();
    let startDate = new Date();

    if (period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    // 1. Revenue by Category (Craft Village)
    const categoryRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: { $ifNull: ["$productDetails.craftVillage", "Chưa phân loại"] },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $project: {
          name: "$_id",
          value: "$revenue",
          _id: 0,
        },
      },
      { $sort: { value: -1 } },
    ]);

    // 2. Order Status Counts
    const orderStatusCounts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { name: 1 } },
    ]);

    return successResponse(res, 200, "ADVANCED_ANALYTICS_FETCHED", {
      categoryRevenue,
      orderStatusCounts,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
