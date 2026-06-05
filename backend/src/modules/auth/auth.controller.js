import User from "../users/user.model.js";
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

      user.otp = otp;
      user.otpExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

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

    if (user.otp !== otp) {
      return errorResponse(res, 400, "INVALID_OTP");
    }

    if (user.otpExpires < Date.now()) {
      return errorResponse(res, 400, "EXPIRED_OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

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
      { expiresIn: "7d" }
    );

    return successResponse(res, 200, "LOGIN_SUCCESS", {
      token: token,
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

    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Fix bug: 3 params instead of 4
    sendVerificationEmail(user.email, otp, user.language || "vi").catch((err) => {
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
      { expiresIn: "7d" }
    );

    return successResponse(res, 200, "LOGIN_SUCCESS", {
      token: token,
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

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    sendPasswordResetEmail(user.email, otp, user.language || "vi").catch((err) => {
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

    if (user.resetPasswordOtp !== otp) {
      return errorResponse(res, 400, "INVALID_OTP");
    }
    if (user.resetPasswordExpires < Date.now()) {
      return errorResponse(res, 400, "EXPIRED_OTP");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordOtp = undefined;
    await user.save({ validateBeforeSave: false });

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
    await User.findByIdAndUpdate(userId, { refreshToken: null });

    return successResponse(res, 200, "LOGOUT_SUCCESS");
  } catch (error) {
    console.error("Logout Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const sendChangePasswordOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 404, "USER_NOT_FOUND");

    const requestedLang = req.body?.language;
    const lang = ["en", "vi"].includes(requestedLang) ? requestedLang : user.language || "vi";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

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

    if (user.resetPasswordOtp !== otp || user.resetPasswordExpires < Date.now()) {
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

    if (user.resetPasswordOtp !== otp || user.resetPasswordExpires < Date.now()) {
      return errorResponse(res, 400, "INVALID_OR_EXPIRED_OTP");
    }

    const isSameAsOldPassword = await user.matchPassword(newPassword);
    if (isSameAsOldPassword) {
      return errorResponse(res, 400, "PASSWORD_MUST_BE_DIFFERENT");
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

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
    delete userData.otp;
    delete userData.otpExpires;
    delete userData.resetPasswordOtp;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;
    delete userData.refreshToken;

    return successResponse(res, 200, "GET_ME_SUCCESS", userData);
  } catch (error) {
    console.error("Get Me Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
