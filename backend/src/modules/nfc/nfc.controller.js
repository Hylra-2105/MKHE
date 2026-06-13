import NfcTag from "./nfc.model.js";
import Product from "../products/product.model.js";
import crypto from "crypto";

// [POST] /api/nfc-tags/generate
export const generateTags = async (req, res) => {
  try {
    const { productId, count } = req.body;
    
    if (!productId || !count || count <= 0 || count > 100) {
      return res.status(400).json({ success: false, message: "Invalid productId or count (max 100)" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const tags = [];
    const secret = process.env.NFC_SECRET || "mkhe_nfc_default_secret_2026";
    const timestamp = Date.now().toString();

    for (let i = 0; i < count; i++) {
      // Tạo UID ngẫu nhiên, vd: NFC-8A2B9C
      const uid = `NFC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      
      // Tạo Hash (SHA-256) và cắt lấy 16 ký tự đầu để tiết kiệm dung lượng chip
      const fullHash = crypto.createHmac("sha256", secret).update(uid + timestamp + i).digest("hex");
      const hash = fullHash.substring(0, 16);

      tags.push({
        uid,
        hash,
        product: productId,
        status: "PENDING",
        issuedBy: req.user ? req.user._id : null
      });
    }

    const createdTags = await NfcTag.insertMany(tags);

    res.status(201).json({
      success: true,
      message: `Successfully generated ${count} NFC tags`,
      data: createdTags
    });
  } catch (error) {
    console.error("Error generating NFC tags:", error);
    res.status(500).json({ success: false, message: "Server error generating NFC tags" });
  }
};

// [GET] /api/nfc-tags/product/:productId
export const getTagsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const tags = await NfcTag.find({ product: productId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ success: false, message: "Server error fetching tags" });
  }
};

// [PUT] /api/nfc-tags/:uid/activate
export const activateTag = async (req, res) => {
  try {
    const { uid } = req.params;
    
    const tag = await NfcTag.findOne({ uid });
    if (!tag) {
      return res.status(404).json({ success: false, message: "NFC tag not found" });
    }

    tag.status = "ACTIVE";
    tag.activatedAt = new Date();
    await tag.save();

    res.status(200).json({
      success: true,
      message: "NFC tag activated successfully",
      data: tag
    });
  } catch (error) {
    console.error("Error activating tag:", error);
    res.status(500).json({ success: false, message: "Server error activating tag" });
  }
};

// [GET] /api/nfc-tags/verify
export const verifyTag = async (req, res) => {
  try {
    const { uid, hash } = req.query;

    if (!uid || !hash) {
      return res.status(400).json({ success: false, message: "Missing uid or hash" });
    }

    const tag = await NfcTag.findOne({ uid });
    
    if (!tag) {
      return res.status(404).json({ success: false, message: "TAG_NOT_FOUND" });
    }

    if (tag.hash !== hash) {
      return res.status(400).json({ success: false, message: "INVALID_HASH" });
    }

    if (tag.status !== "ACTIVE") {
      return res.status(400).json({ success: false, message: "TAG_NOT_ACTIVE" });
    }

    // Nếu hợp lệ
    res.status(200).json({
      success: true,
      data: {
        productId: tag.product,
        uid: tag.uid,
        status: tag.status
      }
    });

  } catch (error) {
    console.error("Error verifying tag:", error);
    res.status(500).json({ success: false, message: "Server error verifying tag" });
  }
};
