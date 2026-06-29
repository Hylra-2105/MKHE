import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification, getAdminNotifications, getUnreadCount } from "./notification.controller.js";

import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

router.use(verifyToken);

router.get("/admin", checkRole(["Admin", "Staff"]), getAdminNotifications);
router.get("/unread-count", getUnreadCount);
router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
