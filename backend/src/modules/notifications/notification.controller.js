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

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const userUnread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    let systemUnread = 0;
    if (req.user.role === "Admin" || req.user.role === "Staff") {
      systemUnread = await Notification.countDocuments({ isAdmin: true, readBy: { $ne: req.user._id } });
    }
    return successResponse(res, 200, "OK", { userUnread, systemUnread });
  } catch (error) {
    console.error("getUnreadCount Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// GET /api/notifications/admin
export const getAdminNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { isAdmin: true };
    if (req.query.unreadOnly === "true") {
      query.readBy = { $ne: req.user._id };
    }

    const total = await Notification.countDocuments(query);
    const dbNotifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const notifications = dbNotifications.map(notif => ({
      ...notif,
      isRead: notif.readBy ? notif.readBy.map(id => id.toString()).includes(req.user._id.toString()) : false
    }));

    const unreadCount = await Notification.countDocuments({ isAdmin: true, readBy: { $ne: req.user._id } });

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
    console.error("getAdminNotifications Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    let notification = await Notification.findById(id);
    if (!notification) {
      return errorResponse(res, 404, "NOTIFICATION_NOT_FOUND");
    }

    if (notification.isAdmin) {
      if (!notification.readBy.includes(req.user._id)) {
        notification.readBy.push(req.user._id);
        await notification.save();
      }
    } else {
      if (notification.user.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, "FORBIDDEN");
      }
      notification.isRead = true;
      await notification.save();
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
    // 1. Mark normal notifications
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    // 2. Mark admin notifications if user is admin
    if (req.user.role === "Admin" || req.user.role === "Staff") {
      await Notification.updateMany(
        { isAdmin: true, readBy: { $ne: req.user._id } },
        { $push: { readBy: req.user._id } }
      );
    }

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
