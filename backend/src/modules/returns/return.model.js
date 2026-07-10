import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  reason: { type: String, required: true },
  proofImages: [{ type: String }],
});

const returnSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [returnItemSchema],
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    adminNote: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Return", returnSchema);
