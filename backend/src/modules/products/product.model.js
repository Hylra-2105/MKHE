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
    story: {
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
      enum: ["CHAM", "KHMER", "KINH", "HOA", "OTHER"],
      default: "OTHER",
    },
    craftVillage: {
      type: String,
      trim: true,
    },
    material: [
      {
        type: String,
        trim: true,
      },
    ],
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
    salePrice: {
      type: Number,
      default: 0,
      min: [0, "SALE_PRICE_CANNOT_BE_NEGATIVE"],
    },
    saleStartDate: {
      type: Date,
    },
    saleEndDate: {
      type: Date,
    },
    b2bTiers: [
      {
        minQuantity: { type: Number, required: true },
        discountPercent: { type: Number, required: true, min: 0, max: 100 },
      }
    ],
    stock: {
      type: Number,
      required: true,
      min: [0, "STOCK_CANNOT_BE_NEGATIVE"],
      default: 0,
    },
    lowStockAlerted: {
      type: Boolean,
      default: false,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    colors: [
      {
        name: { type: String, required: true },
        image: { type: String }, // Links to a gallery image
        stock: { type: Number, default: 0, min: 0 },
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
    isPublicEvent: {
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
    storyBlogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      default: null,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isService: {
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
  if (this.colors && this.colors.length > 0) {
    this.stock = this.colors.reduce((total, color) => total + color.stock, 0);
  }
  
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

  // Validate sale price
  if (this.salePrice > 0) {
    if (this.salePrice >= this.price) {
      throw new Error("SALE_PRICE_MUST_BE_LESS_THAN_PRICE");
    }
    if (!this.saleStartDate || !this.saleEndDate) {
      throw new Error("SALE_DATES_REQUIRED");
    }
    if (new Date(this.saleEndDate) <= new Date(this.saleStartDate)) {
      throw new Error("INVALID_SALE_DATE_RANGE");
    }
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
