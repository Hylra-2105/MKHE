import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { getMyNotifications, markAsRead, markAllAsRead } from "./notification.controller.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
