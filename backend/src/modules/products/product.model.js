import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    categoryMatrix: {
      type: String,
      enum: ["B2B_Luxury", "B2B_Standard", "B2C_Premium", "B2C_Mass_Premium"],
      required: true,
      index: true,
    },
    culturalDNA: {
      type: String,
      enum: ["CHAM", "KHMER", "KINH", "OTHER"],
      default: "OTHER",
    },
    vendor: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "PRICE_CANNOT_BE_NEGATIVE"], 
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "STOCK_CANNOT_BE_NEGATIVE"],
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "OUT_OF_STOCK", "HIDDEN"],
      default: "DRAFT",
    },
    hasDPP: {
      type: Boolean,
      default: false,
    },
    artisanName: {
      type: String,
      trim: true,
    },
    gpsLocation: {
      type: String,
      trim: true,
    },
    file3D: {
      type: String, 
    },
    dppProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DPP_Profile",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Middleware (Hook) xử lý logic tự động trước khi save
productSchema.pre("save", async function () {
  // 1. Logic tồn kho
  if (this.stock === 0 && this.status === "PUBLISHED") {
    this.status = "OUT_OF_STOCK";
  }

  // Logic Validate bắt buộc cho Hộ chiếu số
  if (this.hasDPP) {
    if (!this.artisanName) {
      throw new Error("ARTISAN_NAME_REQUIRED");
    }
    if (!this.gpsLocation) {
      throw new Error("GPS_LOCATION_REQUIRED");
    }
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
