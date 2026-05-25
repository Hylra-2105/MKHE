import User from "./auth.model.js";
import { sendVerificationEmail } from "../../utils/email.js";
import jwt from "jsonwebtoken";

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
      // TẠO MÃ OTP 6 SỐ NGẪU NHIÊN
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Lưu OTP và thời gian hết hạn
      user.otp = otp;
      user.otpExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

      // Gửi OTP qua email
      await sendVerificationEmail(
        user.email,
        otp,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS,
      );

      res.status(201).json({
        success: true,
        message: "REGISTER_SUCCESS", // Đổi thành mã
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

    // Kích hoạt tài khoản
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "VERIFY_SUCCESS", // Đổi thành mã
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

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "WRONG_PASSWORD" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "ACCOUNT_NOT_VERIFIED" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "mkhe_secret_key_2024",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "LOGIN_SUCCESS", // Đổi thành mã
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

    // 2. Tạo mã OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cập nhật vào Database (gia hạn thêm 15 phút)
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // 3. Gửi lại Email
    await sendVerificationEmail(
      user.email,
      otp,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS,
    );

    res.status(200).json({
      success: true,
      message: "RESEND_SUCCESS", // Đổi thành mã
    });
  } catch (error) {
    console.error("Lỗi khi gửi lại OTP:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

// --- HÀM ĐĂNG NHẬP BẰNG MẠNG XÃ HỘI (SOCIAL LOGIN) ---
export const socialLogin = async (req, res) => {
  try {
    const { email, name, avatar, providerId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "MISSING_FIELDS" });
    }

    const provider = providerId.split(".")[0];

    // Tìm hoặc tạo mới bằng findOneAndUpdate để tránh lỗi trùng lặp
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: name || email.split("@")[0],
          avatar: avatar || "",
          provider: provider,
          isVerified: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "mkhe_secret_key_2024",
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
