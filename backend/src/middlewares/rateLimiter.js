import rateLimit from "express-rate-limit";

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 3, // Giới hạn 3 request mỗi IP
  message: {
    success: false,
    message: "TOO_MANY_OTP_REQUESTS",
  },
  standardHeaders: true, 
  legacyHeaders: false,
});
