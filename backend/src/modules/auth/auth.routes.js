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
  sendChangePasswordOtp,
  verifyChangePasswordOtp,
  changePasswordWithOtp,
  getMe,
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

// send change password otp route
router.post("/send-change-password-otp", verifyToken, sendChangePasswordOtp);

// verify change password otp route
router.post(
  "/verify-change-password-otp",
  verifyToken,
  verifyChangePasswordOtp,
);

// change password with otp route
router.put("/change-password-otp", verifyToken, changePasswordWithOtp);

// get current user info
router.get("/me", verifyToken, getMe);

export default router;
