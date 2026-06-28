import Order from "../orders/order.model.js";
import Product from "../products/product.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";

// GET /api/analytics/revenue
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = "month", startDate: queryStart, endDate: queryEnd } = req.query;

    let endDate = new Date();
    let startDate = new Date();

    if (queryStart && queryEnd) {
      startDate = new Date(queryStart);
      endDate = new Date(queryEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (period === "week") {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === "month") {
        startDate.setDate(endDate.getDate() - 30);
      } else if (period === "quarter") {
        startDate.setMonth(endDate.getMonth() - 3);
      } else if (period === "year") {
        startDate.setFullYear(endDate.getFullYear() - 1);
      } else {
        // default to 30 days if invalid
        startDate.setDate(endDate.getDate() - 30);
      }
    }

    // Only PAID orders
    const orders = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          orderStatus: { $ne: "CANCELLED" },
          createdAt: { $gte: startDate, $lte: endDate },
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
    const { period = "month", startDate: queryStart, endDate: queryEnd } = req.query;

    let endDate = new Date();
    let startDate = new Date();

    if (queryStart && queryEnd) {
      startDate = new Date(queryStart);
      endDate = new Date(queryEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (period === "week") {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === "month") {
        startDate.setDate(endDate.getDate() - 30);
      } else if (period === "quarter") {
        startDate.setMonth(endDate.getMonth() - 3);
      } else if (period === "year") {
        startDate.setFullYear(endDate.getFullYear() - 1);
      } else {
        startDate.setDate(endDate.getDate() - 30);
      }
    }

    // Top 5 products by sold count, calculated from PAID Orders in the date range
    const topProducts = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          orderStatus: { $ne: "CANCELLED" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          sold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 1,
          name: "$productDetails.name",
          sku: "$productDetails.sku",
          price: "$productDetails.price",
          images: "$productDetails.images",
          sold: 1,
        },
      },
    ]);

    // Low stock products (< 10) remain global regardless of date
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
    const { period = "month", startDate: queryStart, endDate: queryEnd } = req.query;

    let endDate = new Date();
    let startDate = new Date();

    if (queryStart && queryEnd) {
      startDate = new Date(queryStart);
      endDate = new Date(queryEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (period === "week") {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === "month") {
        startDate.setDate(endDate.getDate() - 30);
      } else if (period === "quarter") {
        startDate.setMonth(endDate.getMonth() - 3);
      } else if (period === "year") {
        startDate.setFullYear(endDate.getFullYear() - 1);
      } else {
        startDate.setDate(endDate.getDate() - 30);
      }
    }

    // 1. Revenue by Category (Craft Village)
    const categoryRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          orderStatus: { $ne: "CANCELLED" },
          createdAt: { $gte: startDate, $lte: endDate },
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
          createdAt: { $gte: startDate, $lte: endDate },
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

    // 3. General Stats (AOV, Unique Users)
    const generalStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          orderStatus: { $ne: "CANCELLED" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrders: 1,
          uniqueUsersCount: { $size: "$uniqueUsers" },
          aov: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $divide: ["$totalRevenue", "$totalOrders"] }
            ]
          }
        },
      },
    ]);
    const stats = generalStats[0] || { totalRevenue: 0, totalOrders: 0, uniqueUsersCount: 0, aov: 0 };

    // Calculate Cancellation Rate
    let totalAllOrders = 0;
    let cancelledOrders = 0;
    orderStatusCounts.forEach(status => {
      totalAllOrders += status.count;
      if (status.name === "CANCELLED") cancelledOrders = status.count;
    });
    stats.cancelRate = totalAllOrders > 0 ? (cancelledOrders / totalAllOrders) * 100 : 0;
    stats.totalAllOrders = totalAllOrders;

    // 4. Voucher Performance
    const voucherStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          orderStatus: { $ne: "CANCELLED" },
          createdAt: { $gte: startDate, $lte: endDate },
          voucherCode: { $nin: [null, "", "null", "undefined"] },
          discountAmount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$voucherCode",
          usageCount: { $sum: 1 },
          totalDiscount: { $sum: "$discountAmount" },
          revenueGenerated: { $sum: "$totalAmount" },
        },
      },
      { $sort: { usageCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          code: "$_id",
          usageCount: 1,
          totalDiscount: 1,
          revenueGenerated: 1,
        },
      },
    ]);

    // 5. Top Customers (VIP)
    const topCustomers = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$user",
          name: { $first: "$shippingInfo.name" },
          phone: { $first: "$shippingInfo.phone" },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: 1,
          phone: 1,
          orderCount: 1,
          totalSpent: 1,
          userDetails: 1,
        },
      },
    ]);

    return successResponse(res, 200, "ADVANCED_ANALYTICS_FETCHED", {
      categoryRevenue,
      orderStatusCounts,
      stats,
      voucherStats,
      topCustomers
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
