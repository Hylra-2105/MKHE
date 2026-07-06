import mongoose from "mongoose";

const userVoucherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "USED", "EXPIRED"],
      default: "AVAILABLE",
    },
    usedAt: {
      type: Date,
    },
    usedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // Nếu dùng online thì map với Order
    },
  },
  {
    timestamps: true,
  }
);

// Ngăn user sưu tầm 1 mã 2 lần
userVoucherSchema.index({ user: 1, voucher: 1 }, { unique: true });

const UserVoucher = mongoose.model("UserVoucher", userVoucherSchema);

export default UserVoucher;
