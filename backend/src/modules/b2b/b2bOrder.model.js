import mongoose from "mongoose";

const b2bOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      default: "",
    },
    taxCode: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    logo: {
      type: String, // Copied from user's avatar
      default: "",
    },
    productOrService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    budget: {
      type: Number,
      default: 0,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    packagingRequirement: {
      type: String,
      enum: ["STANDARD_BOX", "NO_PACKAGING", ""],
      default: "",
    },
    designFiles: [
      {
        type: String, // Cloudinary URLs
      }
    ],
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "APPROVED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model("B2BOrder", b2bOrderSchema);
