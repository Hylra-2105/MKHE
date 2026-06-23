import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";
import { validate } from "../../middlewares/validate.js";
import { checkoutSchema, sendCheckoutOtpSchema } from "./order.schema.js";
import { checkout, sendCheckoutOtp, getMyOrderStats, getMyOrders, getOrderById, cancelOrder, receiveOrder, getAllOrdersAdmin, updateOrderStatus } from "./order.controller.js";

const router = express.Router();

// Tất cả các route order đều yêu cầu đăng nhập
router.use(verifyToken);

router.get("/my-stats", getMyOrderStats);
router.get("/me", getMyOrders);
router.get("/me/:id", getOrderById);
router.put("/me/:id/cancel", cancelOrder);
router.put("/me/:id/receive", receiveOrder);

router.post("/send-checkout-otp", validate(sendCheckoutOtpSchema), sendCheckoutOtp);
router.post("/checkout", validate(checkoutSchema), checkout);

// Admin Routes
router.get("/admin", checkRole(["Admin", "Staff"]), getAllOrdersAdmin);
router.put("/admin/:id/status", checkRole(["Admin", "Staff"]), updateOrderStatus);

export default router;
