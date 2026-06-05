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
    price: {
      type: Number,
      required: true,
      min: [0, "Giá sản phẩm không được số âm"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Tồn kho không được số âm"],
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

// Middleware (Hook) tự động: Nếu cập nhật tồn kho về 0 thì tự chuyển status thành OUT_OF_STOCK
productSchema.pre("save", async function () {
  if (this.stock === 0 && this.status === "PUBLISHED") {
    this.status = "OUT_OF_STOCK";
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
