import mongoose from "mongoose";

const nfcTagSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    hash: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "REVOKED"],
      default: "PENDING",
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("NfcTag", nfcTagSchema);
