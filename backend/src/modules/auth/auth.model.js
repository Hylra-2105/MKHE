import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Sửa thành false để không bắt buộc khi login Social
    },
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["Guest", "Customer", "Staff", "Admin"],
      default: "Customer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Mongoose Hook: Chỉ mã hóa mật khẩu nếu là user 'local' và có thay đổi mật khẩu
userSchema.pre("save", async function (next) {
  // Nếu là tài khoản Social hoặc không thay đổi mật khẩu, bỏ qua hash
  if (
    this.provider !== "local" ||
    !this.isModified("password") ||
    !this.password
  ) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
