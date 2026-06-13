import crypto from "crypto";
import NfcTag from "../nfc/nfc.model.js";

/**
 * @route GET /api/dpp/verify/:uid
 * @desc Verify NFC Tag by UID and Hash, then return public product data
 * @access Public
 */
const verifyDPP = async (req, res) => {
  try {
    const { uid } = req.params;
    const { hash } = req.query;

    if (!uid || !hash) {
      return res.status(403).json({
        success: false,
        message: "Missing credentials (UID or Hash)",
      });
    }

    // Kiểm tra NFC tag trong cơ sở dữ liệu
    const tag = await NfcTag.findOne({ uid }).populate({
      path: "product",
      select: "name description images file3D artisanName culturalDNA categoryMatrix gpsLocation sku"
    });

    if (!tag) {
      return res.status(403).json({
        success: false,
        message: "Invalid Tag (Not Found)",
      });
    }

    // Verify Hash
    if (tag.hash !== hash) {
      return res.status(403).json({
        success: false,
        message: "Invalid Tag (Hash mismatch)",
      });
    }

    // Kiểm tra trạng thái thẻ
    if (tag.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Tag is not active",
        status: tag.status,
      });
    }

    // Kiểm tra sản phẩm
    if (!tag.product) {
      return res.status(404).json({
        success: false,
        message: "Product associated with this tag not found",
      });
    }

    // Phản hồi thành công
    res.json({
      success: true,
      data: tag.product,
    });
  } catch (error) {
    console.error("Lỗi xác thực DPP:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during DPP verification",
    });
  }
};

export { verifyDPP };
