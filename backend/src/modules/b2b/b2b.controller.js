import Product from "../products/product.model.js";
import User from "../users/user.model.js";
import B2BOrder from "./b2bOrder.model.js";
import Notification from "../notifications/notification.model.js";
import { getIO } from "../../config/socket.js";
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

    const populatedOrder = await B2BOrder.findById(newOrder._id)
      .populate("user", "name email")
      .populate("productOrService", "name sku thumbnail");

    const io = getIO();
    io.emit("admin_b2b_new_order", populatedOrder);

    return successResponse(res, 201, "CREATE_B2B_ORDER_SUCCESS", populatedOrder);
  } catch (error) {
    console.error("Error in createB2BOrder:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};



// [GET] /api/b2b/orders/me
export const getMyB2BOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await B2BOrder.find({ user: userId })
      .populate("productOrService", "name sku thumbnail")
      .populate("comments.sender", "name avatar role")
      .sort({ createdAt: -1 });
    
    return successResponse(res, 200, "GET_MY_B2B_ORDERS_SUCCESS", orders);
  } catch (error) {
    console.error("Error in getMyB2BOrders:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [GET] /api/b2b/orders
export const getAllB2BOrders = async (req, res) => {
  try {
    const orders = await B2BOrder.find()
      .populate("user", "name email")
      .populate("productOrService", "name sku thumbnail")
      .populate("comments.sender", "name avatar role")
      .sort({ createdAt: -1 });
    
    return successResponse(res, 200, "GET_ALL_B2B_ORDERS_SUCCESS", orders);
  } catch (error) {
    console.error("Error in getAllB2BOrders:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [PUT] /api/b2b/orders/:id/quote
export const uploadB2BQuote = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file && !req.body.quotePdfUrl) {
      return errorResponse(res, 400, "MISSING_PDF_FILE");
    }
    
    const quotePdfUrl = req.file ? req.file.path : req.body.quotePdfUrl;

    const order = await B2BOrder.findById(id);
    if (!order) return errorResponse(res, 404, "ORDER_NOT_FOUND");

    order.quotePdfUrl = quotePdfUrl;
    if (order.status === "PENDING_QUOTE") {
      order.status = "NEGOTIATING";
    }
    
    await order.save();

    // Create Notification for User
    const notif = await Notification.create({
      user: order.user,
      title: "B2B_QUOTE_UPLOADED",
      message: `B2B_QUOTE_UPLOADED::${order._id}`,
      type: "SYSTEM",
      link: "/profile?tab=b2b_orders"
    });
    
    const io = getIO();
    io.to(`user_${order.user}`).emit("new_notification", notif);
    io.to(`user_${order.user}`).emit("b2b_order_updated", order);

    return successResponse(res, 200, "UPLOAD_QUOTE_SUCCESS", order);
  } catch (error) {
    console.error("Error in uploadB2BQuote:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [PUT] /api/b2b/orders/:id/confirm
export const confirmB2BOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await B2BOrder.findOne({ _id: id, user: userId });
    if (!order) return errorResponse(res, 404, "ORDER_NOT_FOUND");

    if (order.status !== "NEGOTIATING") {
      return errorResponse(res, 400, "INVALID_STATUS_FOR_CONFIRM");
    }

    order.status = "CONFIRMED";
    await order.save();

    // Create Notification for Admin
    const adminNotif = await Notification.create({
      isAdmin: true,
      title: "ADMIN_B2B_ORDER_CONFIRMED",
      message: `ADMIN_B2B_ORDER_CONFIRMED::${order._id}`,
      type: "SYSTEM",
      link: "/admin/b2b-orders"
    });
    
    const io = getIO();
    io.emit("new_admin_notification", adminNotif);
    io.emit("admin_b2b_order_updated", order);

    return successResponse(res, 200, "CONFIRM_B2B_ORDER_SUCCESS", order);
  } catch (error) {
    console.error("Error in confirmB2BOrder:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [PUT] /api/b2b/orders/:id/status
export const updateB2BOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await B2BOrder.findByIdAndUpdate(id, { status }, { new: true })
      .populate("productOrService", "name sku thumbnail")
      .populate("comments.sender", "name avatar role");
      
    if (!order) return errorResponse(res, 404, "ORDER_NOT_FOUND");

    const notif = await Notification.create({
      user: order.user,
      title: "Cập nhật trạng thái B2B",
      message: `Yêu cầu B2B của bạn đã được cập nhật sang trạng thái mới.`,
      type: "SYSTEM",
      link: "/profile?tab=b2b_orders"
    });

    const io = getIO();
    io.to(`user_${order.user}`).emit("new_notification", notif);
    io.to(`user_${order.user}`).emit("b2b_order_updated", order);

    return successResponse(res, 200, "UPDATE_STATUS_SUCCESS", order);
  } catch (error) {
    console.error("Error in updateB2BOrderStatus:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [POST] /api/b2b/orders/:id/comments
export const addB2BOrderComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) return errorResponse(res, 400, "MISSING_COMMENT_TEXT");

    const order = await B2BOrder.findById(id);
    if (!order) return errorResponse(res, 404, "ORDER_NOT_FOUND");

    // Push comment
    order.comments.push({
      sender: userId,
      text
    });
    await order.save();
    
    const updatedOrder = await B2BOrder.findById(id)
      .populate("comments.sender", "name avatar role");
    
    const newComment = updatedOrder.comments[updatedOrder.comments.length - 1];

    // Emit event
    const io = getIO();
    io.to(`user_${order.user}`).emit("b2b_new_comment", { orderId: id, comment: newComment });
    io.emit("admin_b2b_new_comment", { orderId: id, comment: newComment });

    return successResponse(res, 200, "ADD_COMMENT_SUCCESS", newComment);
  } catch (error) {
    console.error("Error in addB2BOrderComment:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
