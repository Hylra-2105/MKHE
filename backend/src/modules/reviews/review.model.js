import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Đảm bảo 1 user chỉ được review 1 product trong 1 order 1 lần
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
