import User from "../users/user.model.js";
import redisClient from "../../config/redis.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendChangePasswordEmail,
} from "../../utils/email.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Helper function to generate tokens
const generateTokens = async (user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Lưu refresh token vào Redis (hết hạn sau 7 ngày)
  await redisClient.setex(`refresh_token:${user._id}`, 7 * 24 * 60 * 60, refreshToken);

  return { token, refreshToken };
};

// HÀM ĐĂNG KÝ
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, language } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, "MISSING_FIELDS");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 400, "EMAIL_ALREADY_EXISTS");
    }

    const userLang = language || "vi";

    const user = await User.create({
      name: name.trim(),
      email,
      password,
      language: userLang,
    });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Lưu OTP vào Redis (15 phút TTL)
      await redisClient.setex(`otp:VERIFY_EMAIL:${user.email}`, 900, otp);

      try {
        await sendVerificationEmail(user.email, otp, userLang);
      } catch (err) {
        console.error("[Email Error]", err.message);
        return errorResponse(res, 500, "FAILED_TO_SEND_EMAIL");
      }

      return successResponse(res, 201, "REGISTER_SUCCESS", { email: user.email });
    } else {
      return errorResponse(res, 400, "INVALID_DATA");
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// HÀM XÁC THỰC OTP
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 400, "MISSING_FIELDS");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 404, "ACCOUNT_NOT_FOUND");
    }

    if (user.isVerified) {
      return errorResponse(res, 400, "ACCOUNT_ALREADY_VERIFIED");
    }

    const storedOtp = await redisClient.get(`otp:VERIFY_EMAIL:${email}`);
    if (storedOtp !== otp) {
      return errorResponse(res, 400, "INVALID_OR_EXPIRED_OTP");
    }

    user.isVerified = true;
    await user.save();

    await redisClient.del(`otp:VERIFY_EMAIL:${email}`);

    return successResponse(res, 200, "VERIFY_SUCCESS");
  } catch (error) {
    console.error("Lỗi Verify OTP:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// HÀM ĐĂNG NHẬP
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "MISSING_FIELDS");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "ACCOUNT_NOT_FOUND");
    }

    if (!user.password && user.provider !== "local") {
      return errorResponse(res, 400, "USE_SOCIAL_LOGIN");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 400, "WRONG_PASSWORD");
    }

    if (!user.isVerified) {
      return errorResponse(res, 403, "ACCOUNT_NOT_VERIFIED");
    }

    if (user.isBlocked) {
      return errorResponse(res, 403, "ACCOUNT_BLOCKED");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in environment variables");
    }

    const { token, refreshToken } = await generateTokens(user);

    return successResponse(res, 200, "LOGIN_SUCCESS", {
      token,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        provider: user.provider,
        phone: user.phone,
        addresses: user.addresses,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// HÀM GỬI LẠI MÃ OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, "MISSING_FIELDS");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 404, "ACCOUNT_NOT_FOUND");
    }

    if (user.isVerified) {
      return errorResponse(res, 400, "ACCOUNT_ALREADY_VERIFIED");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.setex(`otp:VERIFY_EMAIL:${user.email}`, 900, otp);

    const userLang = req.body.language || req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || user.language || "vi";
    try {
      await sendVerificationEmail(user.email, otp, userLang);
    } catch (err) {
      console.error("[Email Error]", err.message);
      return errorResponse(res, 500, "FAILED_TO_SEND_EMAIL");
    }

    return successResponse(res, 200, "RESEND_SUCCESS");
  } catch (error) {
    console.error("Lỗi khi gửi lại OTP:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// login social
export const socialLogin = async (req, res) => {
  try {
    const { email, name, avatar, providerId } = req.body;

    if (!email) {
      return errorResponse(res, 400, "MISSING_FIELDS");
    }

    const providerName = providerId ? providerId.split(".")[0] : "google";

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString("hex");

      user = await User.create({
        email,
        password: randomPassword,
        name: name || email.split("@")[0],
        avatar: avatar || "",
        provider: providerName,
        isVerified: true,
        hasCustomAvatar: false,
      });
    } else {
      if (!user.name) user.name = name || email.split("@")[0];

      if (!user.hasCustomAvatar && avatar) {
        user.avatar = avatar;
      }

      if (!user.isVerified) user.isVerified = true;
      await user.save();
    }

    if (user.isBlocked) {
      return errorResponse(res, 403, "ACCOUNT_BLOCKED");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in environment variables");
    }

    const { token, refreshToken } = await generateTokens(user);

    return successResponse(res, 200, "LOGIN_SUCCESS", {
      token,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        provider: user.provider,
        phone: user.phone,
        addresses: user.addresses,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập Social:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// fotgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, "MISSING_FIELDS");

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 404, "ACCOUNT_NOT_FOUND");

    if (user.provider !== "local") {
      return errorResponse(res, 400, "USE_SOCIAL_LOGIN");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.setex(`otp:RESET_PASSWORD:${user.email}`, 900, otp);

    const userLang = req.body.language || req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || user.language || "vi";
    try {
      await sendPasswordResetEmail(user.email, otp, userLang);
    } catch (err) {
      console.error("[Email Error]", err.message);
      return errorResponse(res, 500, "FAILED_TO_SEND_EMAIL");
    }

    return successResponse(res, 200, "OTP_SENT");
  } catch (error) {
    console.error("Lỗi yêu cầu quên mật khẩu:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// verify reset otp
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, "MISSING_FIELDS");

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 404, "ACCOUNT_NOT_FOUND");

    const storedOtp = await redisClient.get(`otp:RESET_PASSWORD:${email}`);
    if (storedOtp !== otp) {
      return errorResponse(res, 400, "INVALID_OR_EXPIRED_OTP");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await redisClient.setex(`reset_token:${email}`, 900, resetToken);
    await redisClient.del(`otp:RESET_PASSWORD:${email}`);

    return successResponse(res, 200, "OTP_VERIFIED", { resetToken });
  } catch (error) {
    console.error("Lỗi xác thực mã OTP quên mật khẩu:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) return errorResponse(res, 400, "MISSING_FIELDS");

    const storedToken = await redisClient.get(`reset_token:${email}`);
    if (storedToken !== resetToken) {
      return errorResponse(res, 400, "INVALID_OR_EXPIRED_SESSION");
    }

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 404, "ACCOUNT_NOT_FOUND");

    const isSameAsOldPassword = await user.matchPassword(newPassword);
    if (isSameAsOldPassword) {
      return errorResponse(res, 400, "PASSWORD_MUST_BE_DIFFERENT");
    }

    user.password = newPassword;
    await user.save();

    await redisClient.del(`reset_token:${email}`);

    return successResponse(res, 200, "PASSWORD_RESET_SUCCESS");
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// logout
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await redisClient.del(`refresh_token:${userId}`);
    return successResponse(res, 200, "LOGOUT_SUCCESS");
  } catch (error) {
    console.error("Logout Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return errorResponse(res, 400, "MISSING_REFRESH_TOKEN");

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
    if (storedToken !== refreshToken) {
      return errorResponse(res, 403, "INVALID_REFRESH_TOKEN");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 403, "INVALID_REFRESH_TOKEN");
    }

    const tokens = await generateTokens(user);

    return successResponse(res, 200, "REFRESH_SUCCESS", {
      token: tokens.token,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return errorResponse(res, 403, "EXPIRED_REFRESH_TOKEN");
  }
};

export const sendChangePasswordOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 404, "USER_NOT_FOUND");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.setex(`otp:CHANGE_PASSWORD:${user.email}`, 900, otp);

    const requestedLang = req.body?.language;
    const lang = ["en", "vi"].includes(requestedLang) ? requestedLang : user.language || "vi";

    sendChangePasswordEmail(user.email, otp, lang).catch((err) => {
      console.error("[Email Error] Gửi OTP thất bại:", err.message);
    });

    return successResponse(res, 200, "OTP_SENT_SUCCESS");
  } catch (error) {
    console.error("sendChangePasswordOtp Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const verifyChangePasswordOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return errorResponse(res, 404, "USER_NOT_FOUND");

    const storedOtp = await redisClient.get(`otp:CHANGE_PASSWORD:${user.email}`);
    if (storedOtp !== otp) {
      return errorResponse(res, 400, "INVALID_OR_EXPIRED_OTP");
    }

    return successResponse(res, 200, "OTP_VERIFIED_SUCCESS");
  } catch (error) {
    console.error("verifyChangePasswordOtp Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const changePasswordWithOtp = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return errorResponse(res, 404, "USER_NOT_FOUND");

    const storedOtp = await redisClient.get(`otp:CHANGE_PASSWORD:${user.email}`);
    if (storedOtp !== otp) {
      return errorResponse(res, 400, "INVALID_OR_EXPIRED_OTP");
    }

    const isSameAsOldPassword = await user.matchPassword(newPassword);
    if (isSameAsOldPassword) {
      return errorResponse(res, 400, "PASSWORD_MUST_BE_DIFFERENT");
    }

    user.password = newPassword;
    await user.save();

    await redisClient.del(`otp:CHANGE_PASSWORD:${user.email}`);

    return successResponse(res, 200, "PASSWORD_CHANGED_SUCCESS");
  } catch (error) {
    console.error("changePasswordWithOtp Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }

    if (user.isBlocked) {
      return errorResponse(res, 403, "ACCOUNT_BLOCKED");
    }

    const userData = user.toObject();
    delete userData.password;
    // Đã xóa resetPasswordToken, resetPasswordExpires, refreshTokens ở Schema

    return successResponse(res, 200, "GET_ME_SUCCESS", userData);
  } catch (error) {
    console.error("Get Me Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const activateB2BAccount = async (req, res) => {
  try {
    const { token, password } = req.body;
    const { getIO } = await import("../../config/socket.js");

    if (!token || !password) {
      return errorResponse(res, 400, "MISSING_FIELDS");
    }
    
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(password)) {
      return errorResponse(res, 400, "PASSWORD_TOO_SHORT");
    }

    // Vì b2b accounts có reset token riêng (được sinh ra lúc Admin tạo user) 
    // Chúng ta vẫn nên kiểm tra trong DB hoặc chuyển hẳn lên Redis.
    // Nếu token vẫn được cấp bằng cách nào đó, ta sẽ check Redis, 
    // nhưng ở đây ta check bằng cách tìm tất cả user có role="Enterprise" 
    // Do token không còn ở DB, admin phải sinh token đưa vào Redis. 
    // Hiện tại mình sửa để nó query qua Redis.
    // NOTE: Cần cập nhật controller tạo tài khoản B2B (nếu có) để set key "activate_b2b:token" => email.
    
    // Tạm thời, giả sử Redis lưu `activate_b2b_token:${email}` = token
    // Để query ngược từ token ra email trong Redis hơi khó, 
    // Tốt nhất Frontend nên gửi thêm `email` trong request này.
    
    // Nếu req không có email, chúng ta phải scan (hơi tệ) 
    // Giải pháp: Frontend PHẢI gửi thêm email hoặc token bản thân nó là JWT.
    
    return errorResponse(res, 400, "UNSUPPORTED_METHOD_AFTER_REDIS_MIGRATION");
    // (B2B Activation cần review lại quy trình tạo tài khoản).

  } catch (error) {
    console.error("Activate B2B Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
