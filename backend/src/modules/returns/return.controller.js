import Return from "./return.model.js";
import Order from "../orders/order.model.js";
import User from "../users/user.model.js";
import Notification from "../notifications/notification.model.js";
import { getIO } from "../../config/socket.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { createVietnameseRegex } from "../../utils/helpers.js";

// createReturn
export const createReturn = async (req, res) => {
  try {
    const { orderId, items } = req.body;
    const userId = req.user.id;

    if (!orderId || !items || items.length === 0) {
      return errorResponse(res, 400, "MISSING_REQUIRED_FIELDS");
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return errorResponse(res, 404, "ORDER_NOT_FOUND");
    }

    if (order.orderStatus !== "COMPLETED") {
      return errorResponse(res, 400, "ORDER_NOT_COMPLETED");
    }

    // Check if within 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (order.updatedAt < sevenDaysAgo) {
      return errorResponse(res, 400, "RETURN_PERIOD_EXPIRED");
    }

    // Check if there are any existing returns for this order to validate quantities
    const existingReturns = await Return.find({ 
      order: orderId
    });

    const returnItemsToSave = [];

    for (const reqItem of items) {
      // Find item in order
      const orderItem = order.items.find(
        (item) => item.product.toString() === reqItem.productId
      );

      if (!orderItem) {
        return errorResponse(res, 400, "ITEM_NOT_IN_ORDER");
      }

      // Calculate how many of this product have already been requested for return
      let alreadyReturnedQuantity = 0;
      for (const existingReturn of existingReturns) {
        const matchingExistingItem = existingReturn.items.find(
          (item) => item.product.toString() === reqItem.productId
        );
        if (matchingExistingItem) {
          alreadyReturnedQuantity += matchingExistingItem.quantity;
        }
      }

      const availableQuantityToReturn = orderItem.quantity - alreadyReturnedQuantity;

      if (reqItem.quantity <= 0 || reqItem.quantity > availableQuantityToReturn) {
        return errorResponse(res, 400, "INVALID_RETURN_QUANTITY");
      }

      returnItemsToSave.push({
        product: reqItem.productId,
        name: orderItem.name,
        image: orderItem.image,
        quantity: reqItem.quantity,
        reason: reqItem.reason,
        proofImages: reqItem.proofImages || [],
      });
    }

    const newReturn = new Return({
      order: orderId,
      user: userId,
      items: returnItemsToSave,
    });
    await newReturn.save();

    const io = getIO();
    if (io) {
      io.to("admin_room").emit("new_return", newReturn);
      io.to(`user_${userId}`).emit("new_return", newReturn);
    }

    // Notify User
    try {
      const userNotification = await Notification.create({
        user: userId,
        isAdmin: false,
        title: "USER_RETURN_CREATED",
        message: `Yêu cầu đổi trả cho đơn hàng ${order.orderCode} đã được gửi và đang chờ xử lý.`,
        type: "ORDER_STATUS_UPDATE",
        orderId: orderId,
        orderCode: order.orderCode,
        link: `/profile?tab=returns&returnId=${newReturn._id}`,
      });
      if (io) {
        io.to(`user_${userId}`).emit("new_notification", userNotification);
      }
    } catch (err) {
      console.error("[Notification Error] User return creation notification failed:", err.message);
    }

    // Notify Admin
    try {
      const adminNotification = await Notification.create({
        isAdmin: true,
        title: "ADMIN_RETURN_NEW",
        message: `Khách hàng vừa gửi yêu cầu đổi/trả cho đơn hàng ${order.orderCode}.`,
        type: "ORDER_STATUS_UPDATE",
        orderId: orderId,
        orderCode: order.orderCode,
        link: `/admin/returns?returnId=${newReturn._id}`,
      });
      if (io) {
        io.to("admin_room").emit("new_admin_notification", adminNotification);
      }
    } catch (err) {
      console.error("[Notification Error] Admin return creation notification failed:", err.message);
    }

    return successResponse(res, 201, "RETURN_REQUEST_CREATED", newReturn);
  } catch (error) {
    console.error("[createReturn Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// getAdminReturns
export const getAdminReturns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const search = req.query.search || "";

    const query = {};
    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = createVietnameseRegex(search);
      const orderDocs = await Order.find({ orderCode: { $regex: searchRegex, $options: "i" } }, "_id");
      const orderIds = orderDocs.map(o => o._id);

      const userDocs = await User.find({
        $or: [
          { name: { $regex: searchRegex, $options: "i" } },
          { email: { $regex: searchRegex, $options: "i" } }
        ]
      }, "_id");
      const userIds = userDocs.map(u => u._id);

      query.$or = [
        { order: { $in: orderIds } },
        { user: { $in: userIds } }
      ];
    }

    const returns = await Return.find(query)
      .populate("order", "orderCode")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Return.countDocuments(query);

    return successResponse(res, 200, "GET_RETURNS_SUCCESS", {
      returns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getAdminReturns Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// updateReturnStatus
export const updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return errorResponse(res, 400, "INVALID_STATUS");
    }

    if (!adminNote || adminNote.trim() === "") {
      return errorResponse(res, 400, "ADMIN_NOTE_REQUIRED");
    }

    const returnRequest = await Return.findById(id).populate("order", "orderCode");
    if (!returnRequest) {
      return errorResponse(res, 404, "RETURN_REQUEST_NOT_FOUND");
    }

    returnRequest.status = status;
    returnRequest.adminNote = adminNote;
    await returnRequest.save();

    const io = getIO();
    if (io) {
      io.to("admin_room").emit("return_updated", returnRequest);
      io.to(`user_${returnRequest.user}`).emit("return_updated", returnRequest);
    }

    // Notify User
    try {
      const title = status === "APPROVED" ? "USER_RETURN_UPDATED_APPROVED" : "USER_RETURN_UPDATED_REJECTED";
      const statusText = status === "APPROVED" ? "được CHẤP NHẬN" : "bị TỪ CHỐI";
      const userNotification = await Notification.create({
        user: returnRequest.user,
        isAdmin: false,
        title: title,
        message: `Yêu cầu đổi/trả của đơn hàng ${returnRequest.order?.orderCode || ''} đã ${statusText}.`,
        type: "ORDER_STATUS_UPDATE",
        orderId: returnRequest.order?._id || returnRequest.order,
        orderCode: returnRequest.order?.orderCode || '',
        link: `/profile?tab=returns&returnId=${returnRequest._id}`,
      });

      if (io) {
        io.to(`user_${returnRequest.user}`).emit("new_notification", userNotification);
      }
    } catch (err) {
      console.error("[Notification Error] User return status update notification failed:", err.message);
    }

    return successResponse(res, 200, "RETURN_STATUS_UPDATED", returnRequest);
  } catch (error) {
    console.error("[updateReturnStatus Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// getUserReturns
export const getUserReturns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user.id;

    const query = { user: userId };

    const returns = await Return.find(query)
      .populate("order", "orderCode")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Return.countDocuments(query);

    return successResponse(res, 200, "GET_USER_RETURNS_SUCCESS", {
      returns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getUserReturns Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// getReturnById
export const getReturnById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user is an admin or the owner
    const returnRequest = await Return.findById(id)
      .populate("order", "orderCode")
      .populate("user", "name email");

    if (!returnRequest) {
      return errorResponse(res, 404, "RETURN_REQUEST_NOT_FOUND");
    }

    // Role check (Admin/Staff can view all, User can only view their own)
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Staff") {
      if (returnRequest.user._id.toString() !== req.user.id) {
        return errorResponse(res, 403, "FORBIDDEN");
      }
    }

    return successResponse(res, 200, "GET_RETURN_SUCCESS", returnRequest);
  } catch (error) {
    console.error("[getReturnById Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
