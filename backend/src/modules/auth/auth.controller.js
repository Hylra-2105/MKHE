import User from "../users/user.model.js";
import OTP from "./otp.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendChangePasswordEmail,
} from "../../utils/email.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

    const userLang = ["en", "vi"].includes(language) ? language : "vi";

    const user = await User.create({
      name: name.trim(),
      email,
      password,
      language: userLang,
    });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await OTP.create({ email: user.email, otp, purpose: "VERIFY_EMAIL" });

      // Fire and forget email
      sendVerificationEmail(user.email, otp, userLang).catch((err) => {
        console.error("[Email Error]", err.message);
      });

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

    const validOtp = await OTP.findOne({ email, otp, purpose: "VERIFY_EMAIL" });
    if (!validOtp) {
      return errorResponse(res, 400, "INVALID_OR_EXPIRED_OTP");
    }

    user.isVerified = true;
    await user.save();

    await OTP.deleteOne({ _id: validOtp._id });

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

    user.refreshTokens.push(refreshToken);
    await user.save();

    return successResponse(res, 200, "LOGIN_SUCCESS", {
      token: token,
      refreshToken: refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        provider: user.provider,
        phone: user.phone,
        country: user.country,
        city: user.city,
        address: user.address,
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

    await OTP.deleteMany({ email: user.email, purpose: "VERIFY_EMAIL" });
    await OTP.create({ email: user.email, otp, purpose: "VERIFY_EMAIL" });

    // Fix bug: 3 params instead of 4
    const userLang = req.body.language || req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || user.language || "vi";
    sendVerificationEmail(user.email, otp, userLang).catch((err) => {
        console.error("[Email Error]", err.message);
    });

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

    user.refreshTokens.push(refreshToken);
    await user.save();

    return successResponse(res, 200, "LOGIN_SUCCESS", {
      token: token,
      refreshToken: refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        provider: user.provider,
        phone: user.phone,
        country: user.country,
        city: user.city,
        address: user.address,
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

    await OTP.deleteMany({ email: user.email, purpose: "RESET_PASSWORD" });
    await OTP.create({ email: user.email, otp, purpose: "RESET_PASSWORD" });

    const userLang = req.body.language || req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || user.language || "vi";
    sendPasswordResetEmail(user.email, otp, userLang).catch((err) => {
      console.error("[Email Error]", err);
    });

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

    const validOtp = await OTP.findOne({ email, otp, purpose: "RESET_PASSWORD" });
    if (!validOtp) {
      return errorResponse(res, 400, "INVALID_OR_EXPIRED_OTP");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Reset token valid for 15 minutes
    await user.save({ validateBeforeSave: false });

    await OTP.deleteOne({ _id: validOtp._id });

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

    const user = await User.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return errorResponse(res, 400, "INVALID_OR_EXPIRED_SESSION");

    const isSameAsOldPassword = await user.matchPassword(newPassword);
    if (isSameAsOldPassword) {
      return errorResponse(res, 400, "PASSWORD_MUST_BE_DIFFERENT");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

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
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await User.findByIdAndUpdate(userId, { 
        $pull: { refreshTokens: refreshToken } 
      });
    }

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
    
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return errorResponse(res, 403, "INVALID_REFRESH_TOKEN");
    }

    // Xóa token cũ
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);

    // Cấp token mới
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, "REFRESH_SUCCESS", {
      token: newAccessToken,
      refreshToken: newRefreshToken
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

    const requestedLang = req.body?.language;
    const lang = ["en", "vi"].includes(requestedLang) ? requestedLang : user.language || "vi";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email: user.email, purpose: "CHANGE_PASSWORD" });
    await OTP.create({ email: user.email, otp, purpose: "CHANGE_PASSWORD" });

    const userLang = req.body.language || req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || user.language || "vi";
    sendChangePasswordEmail(user.email, otp, userLang).catch((err) => {
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

    const validOtp = await OTP.findOne({ email: user.email, otp, purpose: "CHANGE_PASSWORD" });
    if (!validOtp) {
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

    const validOtp = await OTP.findOne({ email: user.email, otp, purpose: "CHANGE_PASSWORD" });
    if (!validOtp) {
      return errorResponse(res, 400, "INVALID_OR_EXPIRED_OTP");
    }

    const isSameAsOldPassword = await user.matchPassword(newPassword);
    if (isSameAsOldPassword) {
      return errorResponse(res, 400, "PASSWORD_MUST_BE_DIFFERENT");
    }

    user.password = newPassword;
    await user.save();

    await OTP.deleteOne({ _id: validOtp._id });

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
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;
    delete userData.refreshTokens;

    return successResponse(res, 200, "GET_ME_SUCCESS", userData);
  } catch (error) {
    console.error("Get Me Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
