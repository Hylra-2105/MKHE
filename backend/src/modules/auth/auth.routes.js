import express from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  resendOTP,
  socialLogin,
} from "./auth.controller.js";

const router = express.Router();

// Tạo đường dẫn POST cho đăng ký
router.post("/register", registerUser);
    
// verify email route
router.post("/verify-email", verifyEmail);

// login route
router.post("/login", loginUser);

// resend OTP route
router.post("/resend-otp", resendOTP);

// social login route
router.post("/social-login", socialLogin);

export default router;
