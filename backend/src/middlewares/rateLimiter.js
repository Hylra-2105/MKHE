import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";

// Limiter chung cho các API gửi OTP (chống spam SMS/Email)
export const otpLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Mỗi IP chỉ được gửi tối đa 5 yêu cầu trong 15 phút
  message: {
    success: false,
    message: "TOO_MANY_REQUESTS",
    errors: "Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter cho login (chống brute-force mật khẩu)
export const loginLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 10, // Mỗi IP chỉ được sai mật khẩu hoặc gọi api login 10 lần trong 5 phút
  message: {
    success: false,
    message: "TOO_MANY_LOGIN_ATTEMPTS",
    errors: "Tài khoản của bạn tạm thời bị khóa đăng nhập do sai quá nhiều. Vui lòng thử lại sau 5 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
