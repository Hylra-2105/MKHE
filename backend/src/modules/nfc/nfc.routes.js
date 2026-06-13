import express from "express";
import {
  generateTags,
  getTagsByProduct,
  activateTag,
  verifyTag,
} from "./nfc.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// Route công khai (Public) để kiểm tra Hộ chiếu số
router.get("/verify", verifyTag);

// Các route quản lý NFC (Chỉ Admin và Staff)
router.post(
  "/generate",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  generateTags
);

router.get(
  "/product/:productId",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  getTagsByProduct
);

router.put(
  "/:uid/activate",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  activateTag
);

export default router;
