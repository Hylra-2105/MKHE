import express from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateMyProfile,
  uploadAvatar,
} from "./user.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";
import { uploadCloud } from "../../config/cloudinary.js";

const router = express.Router();

// user update profile
router.put("/profile", verifyToken, updateMyProfile);

// Upload avatar route
router.post(
  "/upload-avatar",
  verifyToken,
  uploadCloud.single("avatar"),
  uploadAvatar,
);

// Admin xem danh sách
router.get("/", verifyToken, checkRole(["Admin"]), getAllUsers);

// Admin mới được quyền cập nhật user
router.put("/:id", verifyToken, checkRole(["Admin"]), updateUser);

// Admin xóa user
router.delete("/:id", verifyToken, checkRole(["Admin"]), deleteUser);

export default router;
