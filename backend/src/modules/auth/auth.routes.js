import express from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  resendOTP,
  socialLogin,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  logoutUser,
} from "./auth.controller.js";

// Import các Middleware cần thiết
import { normalizeEmailMiddleware } from "../../middlewares/normalizeEmail.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// register route
router.post("/register", normalizeEmailMiddleware, registerUser);

// verify email route
router.post("/verify-email", verifyEmail);

// login route
router.post("/login", normalizeEmailMiddleware, loginUser);

// resend otp route
router.post("/resend-otp", normalizeEmailMiddleware, resendOTP);

// social login route
router.post("/social-login", normalizeEmailMiddleware, socialLogin);

// forgot password route
router.post("/forgot-password", normalizeEmailMiddleware, forgotPassword);

// verify otp reset password route
router.post("/verify-reset-otp", verifyResetOtp);

// reset password route
router.post("/reset-password", normalizeEmailMiddleware, resetPassword);

// logout route
router.post("/logout", verifyToken, logoutUser);

export default router;
