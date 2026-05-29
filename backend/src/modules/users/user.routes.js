import express from "express";
import { getAllUsers, updateUser, deleteUser } from "./user.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// Admin xem danh sách
router.get("/", verifyToken, checkRole(["Admin"]), getAllUsers);

// Admin mới được quyền cập nhật user
router.put("/:id", verifyToken, checkRole(["Admin"]), updateUser);

// Admin xóa user
router.delete("/:id", verifyToken, checkRole(["Admin"]), deleteUser);

export default router;
