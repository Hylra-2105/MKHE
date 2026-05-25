import User from "./auth.model.js";
import { sendVerificationEmail } from "../../utils/email.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Thêm crypto để tạo mật khẩu ảo

// HÀM ĐĂNG KÝ
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "MISSING_FIELDS" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "EMAIL_ALREADY_EXISTS" });
    }

    const user = await User.create({ email, password });

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
      { id: user._id, email: user.email },
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

// --- HÀM ĐĂNG NHẬP BẰNG MẠNG XÃ HỘI ---
export const socialLogin = async (req, res) => {
  try {
    console.log("📱 Social Login request received:", req.body);
    const { email, name, avatar, providerId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "MISSING_FIELDS" });
    }

    const providerName = providerId ? providerId.split(".")[0] : "unknown";

    // 1. Tìm user trước thay vì dùng findOneAndUpdate
    let user = await User.findOne({ email });

    if (!user) {
      // 2. Nếu chưa có, tạo user mới
      // Tạo một mật khẩu ngẫu nhiên để vượt qua Validation 'required' của Mongoose (nếu có)
      const randomPassword = crypto.randomBytes(16).toString("hex");

      user = await User.create({
        email,
        password: randomPassword,
        name: name || email.split("@")[0],
        avatar: avatar || "",
        provider: providerName,
        isVerified: true, // Social thì mặc định là verified
      });
    } else {
      // 3. Nếu đã có User, CHỈ cập nhật thông tin nếu nó đang trống
      // Không ghi đè avatar hiện tại của họ nếu họ đã có
      if (!user.name) user.name = name || email.split("@")[0];
      if (!user.avatar) user.avatar = avatar || "";

      // Nếu user đăng nhập bằng Email/Pass, nhưng giờ dùng Google Login,
      // thì đánh dấu họ là verified (vì email đã được Google xác minh)
      if (!user.isVerified) user.isVerified = true;

      await user.save();
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in environment variables");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
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
    console.error("❌ Lỗi khi đăng nhập Social:", error.message, error.stack);
    res.status(500).json({
      message: "SERVER_ERROR",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
