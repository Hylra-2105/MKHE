import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isReviewed: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true }, // MKHE-XXXXX
    payosOrderCode: { type: Number, unique: true, sparse: true }, // For PayOS webhook matching
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    items: [orderItemSchema],
    paymentMethod: {
      type: String,
      enum: ["COD", "BANK_TRANSFER"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "DELIVERING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    voucherCode: { type: String },
    requireCallConfirm: { type: Boolean, default: false },
    isHighRisk: { type: Boolean, default: false },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
