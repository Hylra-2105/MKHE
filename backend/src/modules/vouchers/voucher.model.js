import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIP"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscount: {
      type: Number, // Dùng cho PERCENTAGE
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    applicableVillages: [
      {
        type: String,
      },
    ],
    applicableCategories: [
      {
        type: String,
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number, // Tổng số lượng phát hành
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isO2O: {
      type: Boolean,
      default: false, // true = Có thể dùng offline tại quầy
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Check if voucher is currently valid (time & active)
voucherSchema.virtual("isValid").get(function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate && (this.usageLimit === null || this.usedCount < this.usageLimit);
});

const Voucher = mongoose.model("Voucher", voucherSchema);

export default Voucher;
