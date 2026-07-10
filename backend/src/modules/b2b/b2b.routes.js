import express from "express";
import { getB2BProducts, createB2BOrder, getMyB2BOrders, getAllB2BOrders, uploadB2BQuote, confirmB2BOrder, updateB2BOrderStatus, addB2BOrderComment } from "./b2b.controller.js";
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

// B2B Dashboard routes (Khách hàng Doanh nghiệp)
router.get("/orders/me", verifyToken, checkRole(["Enterprise"]), getMyB2BOrders);
router.put("/orders/:id/confirm", verifyToken, checkRole(["Enterprise"]), confirmB2BOrder);

// Chức năng Comment/Chat chung cho cả Admin và Enterprise
router.post("/orders/:id/comments", verifyToken, checkRole(["Admin", "Staff", "Enterprise"]), addB2BOrderComment);

// Admin routes
router.get("/orders", verifyToken, checkRole(["Admin", "Staff"]), getAllB2BOrders);
router.put(
  "/orders/:id/quote",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  uploadCloud.single("quotePdf"),
  uploadB2BQuote
);
router.put("/orders/:id/status", verifyToken, checkRole(["Admin", "Staff"]), updateB2BOrderStatus);


export default router;
