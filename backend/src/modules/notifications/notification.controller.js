import Notification from "./notification.model.js";
import { errorResponse, successResponse } from "../../utils/response.js";

// GET /api/notifications
export const getMyNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Notification.countDocuments({ user: req.user.id });
    const notifications = await Notification.find({ user: req.user.id })
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
