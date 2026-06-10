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
  refreshToken,
} from "./auth.controller.js";

// Import các Middleware cần thiết
import { normalizeEmailMiddleware } from "../../middlewares/normalizeEmail.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";
import { validate } from "../../middlewares/validate.js";
import { otpLimiter } from "../../middlewares/rateLimiter.js";
import {
  registerSchema,
  loginSchema,
  socialLoginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  resetPasswordSchema,
} from "./auth.schema.js";

const router = express.Router();

// register route
router.post("/register", validate(registerSchema), normalizeEmailMiddleware, registerUser);

// verify email route
router.post("/verify-email", validate(verifyOtpSchema), verifyEmail);

// login route
router.post("/login", validate(loginSchema), normalizeEmailMiddleware, loginUser);

// resend otp route
router.post("/resend-otp", otpLimiter, validate(resendOtpSchema), normalizeEmailMiddleware, resendOTP);

// social login route
router.post("/social-login", validate(socialLoginSchema), normalizeEmailMiddleware, socialLogin);

// forgot password route
router.post("/forgot-password", otpLimiter, validate(resendOtpSchema), normalizeEmailMiddleware, forgotPassword);

// verify otp reset password route
router.post("/verify-reset-otp", validate(verifyOtpSchema), verifyResetOtp);

// reset password route
router.post("/reset-password", validate(resetPasswordSchema), normalizeEmailMiddleware, resetPassword);

// logout route
router.post("/logout", verifyToken, logoutUser);

// refresh token route
router.post("/refresh-token", refreshToken);

// send change password otp route
router.post("/send-change-password-otp", verifyToken, otpLimiter, sendChangePasswordOtp);

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
