import mongoose from "mongoose";

const nfcClaimHistorySchema = new mongoose.Schema(
  {
    dppId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
    },
  },
  {
    timestamps: true,
  }
);

// Ngăn 1 user quét 1 sản phẩm nhiều lần
nfcClaimHistorySchema.index({ dppId: 1, user: 1 }, { unique: true });

const NfcClaimHistory = mongoose.model("NfcClaimHistory", nfcClaimHistorySchema);

export default NfcClaimHistory;
