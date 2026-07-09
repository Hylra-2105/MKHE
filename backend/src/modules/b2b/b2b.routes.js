import express from "express";
import { getB2BProducts, createB2BOrder } from "./b2b.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";
import { uploadCloud } from "../../config/cloudinary.js";

const router = express.Router();

// Route lấy danh sách sản phẩm B2B cho khách hàng Doanh nghiệp
// Bảo vệ route này chỉ cho phép user đã đăng nhập và có role là Enterprise
router.get("/products", verifyToken, checkRole(["Enterprise"]), getB2BProducts);
router.post(
  "/orders",
  verifyToken,
  checkRole(["Enterprise"]),
  uploadCloud.array("designFiles", 5),
  createB2BOrder
);

export default router;
