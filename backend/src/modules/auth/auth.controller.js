import User from "../users/user.model.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../utils/email.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// HÀM ĐĂNG KÝ
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "MISSING_FIELDS" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "EMAIL_ALREADY_EXISTS" });
    }

    const user = await User.create({ name: name.trim(), email, password });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.otp = otp;
      user.otpExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

      await sendVerificationEmail(
        user.email,
        otp,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS,
      );

      res.status(201).json({
        success: true,
        message: "REGISTER_SUCCESS",
        email: user.email,
      });
    } else {
      res.status(400).json({ message: "INVALID_DATA" });
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

// HÀM XÁC THỰC OTP
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "MISSING_FIELDS" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "ACCOUNT_NOT_FOUND" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "ACCOUNT_ALREADY_VERIFIED" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "INVALID_OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "EXPIRED_OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "VERIFY_SUCCESS",
    });
  } catch (error) {
    console.error("Lỗi Verify OTP:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

// HÀM ĐĂNG NHẬP
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "MISSING_FIELDS" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "ACCOUNT_NOT_FOUND" });
    }

    // Chặn tài khoản được tạo từ Google nhưng lại dùng tính năng đăng nhập bằng Mật khẩu
    if (!user.password && user.provider !== "local") {
      return res.status(400).json({ message: "USE_SOCIAL_LOGIN" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "WRONG_PASSWORD" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "ACCOUNT_NOT_VERIFIED" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in environment variables");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "LOGIN_SUCCESS",
      token: token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

// HÀM GỬI LẠI MÃ OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "MISSING_FIELDS" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "ACCOUNT_NOT_FOUND" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "ACCOUNT_ALREADY_VERIFIED" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(
      user.email,
      otp,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS,
    );

    res.status(200).json({
      success: true,
      message: "RESEND_SUCCESS",
    });
  } catch (error) {
    console.error("Lỗi khi gửi lại OTP:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

// login social
export const socialLogin = async (req, res) => {
  try {
    const { email, name, avatar, providerId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "MISSING_FIELDS" });
    }

    const providerName = providerId ? providerId.split(".")[0] : "unknown";

    // Tìm user trước thay vì dùng findOneAndUpdate
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
      });
    } else {
      if (!user.name) user.name = name || email.split("@")[0];
      if (!user.avatar) user.avatar = avatar || "";
      if (!user.isVerified) user.isVerified = true;

      await user.save();
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in environment variables");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "LOGIN_SUCCESS",
      token: token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isVerified: user.isVerified,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập Social:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

// fotgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "MISSING_FIELDS" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "ACCOUNT_NOT_FOUND" });

    // Chặn tài khoản MXH
    if (user.provider !== "local") {
      return res.status(400).json({ message: "USE_SOCIAL_LOGIN" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào DB
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save({ validateBeforeSave: false });

    try {
      // Gửi OTP qua mail
      await sendPasswordResetEmail(
        user.email,
        otp,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS,
      );
      res.status(200).json({ success: true, message: "OTP_SENT" });
    } catch (emailError) {
      console.error("Lỗi khi gửi email:", emailError);
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "EMAIL_SEND_FAILED" });
    }
  } catch (error) {
    console.error("Lỗi yêu cầu quên mật khẩu:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

// verify reset otp
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "MISSING_FIELDS" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "ACCOUNT_NOT_FOUND" });

    // Kiểm tra OTP
    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: "INVALID_OTP" });
    }
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "EXPIRED_OTP" });
    }

    // Nếu OTP đúng -> Tạo một token bảo mật tạm thời cho phép đổi mật khẩu
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordOtp = undefined; // Xóa OTP
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "OTP_VERIFIED",
      resetToken,
    });
  } catch (error) {
    console.error("Lỗi xác thực mã OTP quên mật khẩu:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

// reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword)
      return res.status(400).json({ message: "MISSING_FIELDS" });

    const user = await User.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "INVALID_OR_EXPIRED_SESSION" });

    // KIỂM TRA MẬT KHẨU CŨ
    const isSameAsOldPassword = await user.matchPassword(newPassword);
    if (isSameAsOldPassword) {
      return res.status(400).json({ message: "PASSWORD_MUST_BE_DIFFERENT" });
    }

    // Đổi mật khẩu
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "PASSWORD_RESET_SUCCESS",
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

// logout
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, { refreshToken: null });

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công trên hệ thống!",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
