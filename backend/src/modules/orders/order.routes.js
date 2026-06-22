import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import { checkoutSchema, sendCheckoutOtpSchema } from "./order.schema.js";
import { checkout, sendCheckoutOtp, getMyOrderStats } from "./order.controller.js";

const router = express.Router();

// Tất cả các route order đều yêu cầu đăng nhập
router.use(verifyToken);

router.get("/my-stats", getMyOrderStats);
router.post("/send-checkout-otp", validate(sendCheckoutOtpSchema), sendCheckoutOtp);
router.post("/checkout", validate(checkoutSchema), checkout);

export default router;
