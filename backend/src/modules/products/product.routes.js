import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getDeletedProducts,
  restoreProduct,
} from "./product.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// route quản lí sản phẩm đã xóa
router.get(
  "/trash",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  getDeletedProducts,
);

// route khôi phcu5 sản phẩm đã xóa
router.put(
  "/:id/restore",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  restoreProduct,
);


// Các route quản lý sản phẩm (Admin, Staff)
router.post("/", verifyToken, checkRole(["Admin", "Staff"]), createProduct);
router.put("/:id", verifyToken, checkRole(["Admin", "Staff"]), updateProduct);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  deleteProduct,
);

// route sản phẩm người dùng thấy
router.get("/", getProducts);

// route chi tiết sản phẩm
router.get("/:id", getProductById);

export default router;
