import express from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateMyProfile,
  uploadAvatar,
  createUser,
} from "./user.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";
import { uploadCloud } from "../../config/cloudinary.js";
import { normalizeEmailMiddleware } from "../../middlewares/normalizeEmail.js";

const router = express.Router();

// user update profile
router.put("/profile", verifyToken, normalizeEmailMiddleware, updateMyProfile);

// Upload avatar route
router.post(
  "/upload-avatar",
  verifyToken,
  uploadCloud.single("avatar"),
  uploadAvatar,
);

// Admin xem danh sách
router.get("/", verifyToken, checkRole(["Admin"]), getAllUsers);

// Admin cập nhật user
router.put(
  "/:id",
  verifyToken,
  checkRole(["Admin"]),
  normalizeEmailMiddleware,
  updateUser,
);

// Admin xóa user
router.delete("/:id", verifyToken, checkRole(["Admin"]), deleteUser);

// Admin tạo user mới
router.post(
  "/",
  verifyToken,
  checkRole(["Admin"]),
  normalizeEmailMiddleware,
  createUser,
);

export default router;
