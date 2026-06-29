import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } from "./notification.controller.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
