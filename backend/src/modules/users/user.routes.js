import express from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateMyProfile,
  uploadAvatar,
  createUser,
  addAddress,
  setDefaultAddress,
  updateAddress,
  createB2BAccount
} from "./user.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";
import { uploadCloud } from "../../config/cloudinary.js";
import { normalizeEmailMiddleware } from "../../middlewares/normalizeEmail.js";

const router = express.Router();

// user update profile
router.put("/profile", verifyToken, normalizeEmailMiddleware, updateMyProfile);

// user address book
router.post("/profile/addresses", verifyToken, addAddress);
router.put("/profile/addresses/:addressId", verifyToken, updateAddress);
router.put("/profile/addresses/:addressId/default", verifyToken, setDefaultAddress);

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

// Admin tạo B2B account (Enterprise)
router.post(
  "/admin/b2b/accounts",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  normalizeEmailMiddleware,
  createB2BAccount,
);

export default router;
