import Notification from "./notification.model.js";
import User from "../users/user.model.js";
import { getIO } from "../../config/socket.js";
import { errorResponse, successResponse } from "../../utils/response.js";

// GET /api/notifications
export const getMyNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (req.query.unreadOnly === "true") {
      query.isRead = false;
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    return successResponse(res, 200, "OK", {
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getMyNotifications Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 404, "NOTIFICATION_NOT_FOUND");
    }

    return successResponse(res, 200, "MARKED_AS_READ", notification);
  } catch (error) {
    console.error("markAsRead Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    return successResponse(res, 200, "ALL_MARKED_AS_READ");
  } catch (error) {
    console.error("markAllAsRead Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({ _id: id, user: req.user.id });

    if (!notification) {
      return errorResponse(res, 404, "NOTIFICATION_NOT_FOUND");
    }

    return successResponse(res, 200, "NOTIFICATION_DELETED");
  } catch (error) {
    console.error("deleteNotification Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// Helper for background task: Create bulk marketing notifications
export const createBulkMarketingNotifications = async (title, message, link = "") => {
  try {
    const users = await User.find({ isBlocked: false }).select("_id");
    if (!users.length) return;

    const notifications = users.map((user) => ({
      user: user._id,
      title,
      message,
      type: "MARKETING",
      link,
      isRead: false,
    }));

    // Bulk insert for performance
    await Notification.insertMany(notifications);

    // Emit socket event to all clients to refresh notifications
    try {
      getIO().emit("new_notification", { type: "MARKETING", title, message, link });
    } catch (socketErr) {
      console.error("[Socket] Failed to emit marketing notification:", socketErr);
    }
    
    console.info(`[Notification] Successfully pushed marketing notification to ${users.length} users.`);
  } catch (error) {
    console.error("[Notification] createBulkMarketingNotifications Error:", error);
  }
};
