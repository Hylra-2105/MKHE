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
      // ĐIỂM ĂN TIỀN: Ràng buộc động!
      // Mật khẩu CHỈ bắt buộc nếu người dùng đăng ký theo kiểu truyền thống (local)
      required: function () {
        return this.provider === "local";
      },
    },
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
    provider: {
      type: String,
      // Đã bỏ facebook đi cho sạch sẽ vì frontend chỉ dùng Google
      enum: ["local", "google"],
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

// Mongoose Hook: Hash password trước khi lưu
userSchema.pre("save", async function () {
  // SỬA LẠI: Bỏ điều kiện `this.provider !== "local"`
  // Lý do: Nhỡ sau này tài khoản Google muốn cập nhật thêm mật khẩu để đăng nhập bằng cả 2 cách thì sao?
  // Chỉ cần mật khẩu có sự thay đổi (isModified) và tồn tại thì cứ mã hóa nó.
  if (!this.isModified("password") || !this.password) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
