import express from "express";
import { getAllUsers, updateUser } from "./user.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// Chỉ Admin và Staff mới được xem danh sách
router.get("/", verifyToken, checkRole(["Admin", "Staff"]), getAllUsers);

// Chỉ Admin mới được quyền cập nhật user
router.put("/:id", verifyToken, checkRole(["Admin"]), updateUser);

export default router;
