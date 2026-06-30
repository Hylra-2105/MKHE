import express from "express";
import { getB2BProducts } from "./b2b.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// Route lấy danh sách sản phẩm B2B cho khách hàng Doanh nghiệp
// Bảo vệ route này chỉ cho phép user đã đăng nhập và có role là Enterprise
router.get("/products", verifyToken, checkRole(["Enterprise"]), getB2BProducts);

export default router;
