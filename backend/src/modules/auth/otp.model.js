import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["VERIFY_EMAIL", "RESET_PASSWORD", "CHANGE_PASSWORD"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // MongoDB TTL index: Tự động xóa document sau 900 giây (15 phút)
    },
  },
  {
    timestamps: false, // Không cần updatedAt vì doc này sinh ra 1 lần rồi biến mất
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
