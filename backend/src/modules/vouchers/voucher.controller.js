import { successResponse, errorResponse } from "../../utils/response.js";
import Voucher from "./voucher.model.js";
import UserVoucher from "./userVoucher.model.js";
import NfcClaimHistory from "./nfcClaimHistory.model.js";
import Product from "../products/product.model.js";

// @desc    Lấy danh sách mã public có thể sưu tầm
// @route   GET /api/vouchers/public
// @access  Public
export const getPublicVouchers = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("applicableVillages", "name")
      .populate("applicableCategories", "name")
      .sort({ createdAt: -1 });

    // Lọc bỏ những voucher đã đạt giới hạn (nếu có)
    const availableVouchers = vouchers.filter(
      (v) => v.usageLimit === null || v.usedCount < v.usageLimit
    );

    return successResponse(res, 200, "GET_VOUCHERS_SUCCESS", availableVouchers);
  } catch (error) {
    console.error("Lỗi getPublicVouchers:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    User lưu mã giảm giá vào ví
// @route   POST /api/vouchers/collect
// @access  Private
export const collectVoucher = async (req, res) => {
  try {
    const { voucherId } = req.body;
    const userId = req.user.id;

    // Kiểm tra voucher hợp lệ
    const voucher = await Voucher.findById(voucherId);
    if (!voucher || !voucher.isValid) {
      return errorResponse(res, 400, "VOUCHER_INVALID_OR_EXPIRED");
    }

    // Kiểm tra xem đã lưu chưa
    const existing = await UserVoucher.findOne({ user: userId, voucher: voucherId });
    if (existing) {
      return errorResponse(res, 400, "VOUCHER_ALREADY_SAVED");
    }

    // Tạo vào ví
    const userVoucher = await UserVoucher.create({
      user: userId,
      voucher: voucherId,
      status: "AVAILABLE",
    });

    return successResponse(res, 201, "VOUCHER_COLLECTED_SUCCESS", userVoucher);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, "VOUCHER_ALREADY_SAVED");
    }
    console.error("Lỗi collectVoucher:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    Lấy danh sách ví Voucher của User
// @route   GET /api/vouchers/wallet
// @access  Private
export const getUserWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const userVouchers = await UserVoucher.find({ user: userId })
      .populate("voucher")
      .sort({ createdAt: -1 });

    // Tự động kiểm tra và cập nhật trạng thái EXPIRED
    const now = new Date();
    const updatedVouchers = await Promise.all(
      userVouchers.map(async (uv) => {
        if (uv.status === "AVAILABLE" && uv.voucher.endDate < now) {
          uv.status = "EXPIRED";
          await uv.save();
        }
        return uv;
      })
    );

    return successResponse(res, 200, "GET_WALLET_SUCCESS", updatedVouchers);
  } catch (error) {
    console.error("Lỗi getUserWallet:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    Offline Redeem: Staff quét mã QR
// @route   POST /api/vouchers/redeem-offline
// @access  Private/Admin|Staff
export const redeemOfflineVoucher = async (req, res) => {
  try {
    const { userVoucherId } = req.body;

    const uv = await UserVoucher.findById(userVoucherId).populate("voucher");
    if (!uv) {
      return errorResponse(res, 404, "USER_VOUCHER_NOT_FOUND");
    }

    if (uv.status === "USED") {
      return errorResponse(res, 400, "VOUCHER_ALREADY_USED");
    }

    if (uv.status === "EXPIRED" || uv.voucher.endDate < new Date()) {
      return errorResponse(res, 400, "VOUCHER_EXPIRED");
    }

    if (!uv.voucher.isO2O) {
      return errorResponse(res, 400, "VOUCHER_ONLINE_ONLY");
    }

    // Đánh dấu đã dùng
    uv.status = "USED";
    uv.usedAt = new Date();
    await uv.save();

    // Tăng số lượng đã dùng của Voucher gốc
    uv.voucher.usedCount += 1;
    await uv.voucher.save();

    return successResponse(res, 200, "VOUCHER_REDEEMED_OFFLINE_SUCCESS", { userVoucher: uv });
  } catch (error) {
    console.error("Lỗi redeemOfflineVoucher:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    Tạo mã giảm giá mới
// @route   POST /api/vouchers/admin
// @access  Private/Admin|Staff
export const createVoucher = async (req, res) => {
  try {
    const {
      code,
      type,
      discountValue,
      maxDiscount,
      minOrderValue,
      startDate,
      endDate,
      usageLimit,
      applicableVillages,
      applicableCategories,
      isO2O,
      dropRate,
    } = req.body;

    // Validate
    if (!code || !type || discountValue === undefined || !startDate || !endDate) {
      return errorResponse(res, 400, "MISSING_REQUIRED_FIELDS");
    }

    if (type === "PERCENTAGE" && discountValue > 100) {
      return errorResponse(res, 400, "INVALID_PERCENTAGE");
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return errorResponse(res, 400, "INVALID_DATE_RANGE");
    }

    const existingCode = await Voucher.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return errorResponse(res, 400, "VOUCHER_CODE_EXISTS");
    }

    let title = "Mã Giảm Giá";
    if (type === "PERCENTAGE") {
      title = `Giảm ${discountValue}%`;
      if (maxDiscount) title += ` tối đa ${maxDiscount.toLocaleString("vi-VN")}đ`;
    } else if (type === "FIXED_AMOUNT") {
      title = `Giảm ${discountValue.toLocaleString("vi-VN")}đ`;
    } else if (type === "FREE_SHIP") {
      title = discountValue > 0 ? `Giảm ${discountValue.toLocaleString("vi-VN")}đ phí vận chuyển` : `Miễn phí vận chuyển`;
    }

    const voucher = await Voucher.create({
      code: code.toUpperCase(),
      title,
      type,
      discountValue,
      maxDiscount: type === "PERCENTAGE" ? maxDiscount : null,
      minOrderValue: minOrderValue || 0,
      startDate,
      endDate,
      usageLimit: usageLimit || null,
      applicableVillages: applicableVillages || [],
      applicableCategories: applicableCategories || [],
      isO2O: isO2O || false,
      dropRate: dropRate || 0,
    });

    return successResponse(res, 201, "VOUCHER_CREATED_SUCCESS", voucher);
  } catch (error) {
    console.error("Lỗi createVoucher:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    Lấy danh sách mã cho Admin
// @route   GET /api/vouchers/admin
// @access  Private/Admin|Staff
export const getAllAdminVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    return successResponse(res, 200, "GET_VOUCHERS_SUCCESS", vouchers);
  } catch (error) {
    console.error("Lỗi getAllAdminVouchers:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    User lưu mã giảm giá bằng Code (DPP)
// @route   POST /api/vouchers/collect-by-code
// @access  Private
export const collectVoucherByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return errorResponse(res, 400, "MISSING_VOUCHER_CODE");
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    
    if (!voucher || !voucher.isValid) {
      return errorResponse(res, 400, "VOUCHER_INVALID_OR_EXPIRED");
    }

    // Kiểm tra xem đã lưu chưa
    const existing = await UserVoucher.findOne({ user: userId, voucher: voucher._id });
    if (existing) {
      return errorResponse(res, 400, "VOUCHER_ALREADY_SAVED");
    }

    // Tạo vào ví
    const userVoucher = await UserVoucher.create({
      user: userId,
      voucher: voucher._id,
      status: "AVAILABLE",
    });

    return successResponse(res, 201, "VOUCHER_COLLECTED_SUCCESS", userVoucher);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, "VOUCHER_ALREADY_SAVED");
    }
    console.error("Lỗi collectVoucherByCode:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    Lấy các tuỳ chọn Làng nghề & Danh mục cho Admin Form
// @route   GET /api/vouchers/options
// @access  Private/Admin|Staff
export const getVoucherOptions = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    const categoryMatrix = await Product.distinct("categoryMatrix");
    const villages = await Product.distinct("craftVillage");

    // Merge categories and categoryMatrix and remove duplicates/nulls
    const allCategories = [...new Set([...categories, ...categoryMatrix])].filter(Boolean);
    const validVillages = villages.filter(Boolean);

    return successResponse(res, 200, "GET_VOUCHER_OPTIONS_SUCCESS", {
      categories: allCategories,
      villages: validVillages
    });
  } catch (error) {
    console.error("Lỗi getVoucherOptions:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    Kiểm tra xem User đã quét NFC này chưa
// @route   GET /api/vouchers/check-nfc-claim
// @access  Private
export const checkNfcClaim = async (req, res) => {
  try {
    const { dppId } = req.query;
    const userId = req.user.id;

    if (!dppId) {
      return errorResponse(res, 400, "MISSING_DPP_ID");
    }

    const claimHistory = await NfcClaimHistory.findOne({ dppId, user: userId }).populate("voucher", "title code type discountValue");

    if (claimHistory) {
      return successResponse(res, 200, "ALREADY_CLAIMED", {
        claimed: true,
        voucher: claimHistory.voucher
      });
    }

    return successResponse(res, 200, "NOT_CLAIMED", { claimed: false });
  } catch (error) {
    console.error("Lỗi checkNfcClaim:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    User xoay Gacha nhận mã giảm giá từ NFC/DPP
// @route   POST /api/vouchers/claim-nfc
// @access  Private
export const claimNfcGacha = async (req, res) => {
  try {
    const { dppId } = req.body;
    const userId = req.user.id;

    if (!dppId) {
      return errorResponse(res, 400, "MISSING_DPP_ID");
    }

    // 1. Kiểm tra xem User đã quét cái này chưa
    const existingClaim = await NfcClaimHistory.findOne({ dppId, user: userId });
    if (existingClaim) {
      return errorResponse(res, 400, "NFC_ALREADY_CLAIMED");
    }

    // 2. Lấy danh sách Voucher active, còn lượt dùng, và dropRate > 0
    const activeVouchers = await Voucher.find({
      isActive: true,
      dropRate: { $gt: 0 },
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }]
    });

    if (activeVouchers.length === 0) {
      return errorResponse(res, 404, "NO_REWARDS_AVAILABLE");
    }

    // 3. Lấy danh sách Voucher mà User đã có
    const userVouchers = await UserVoucher.find({ user: userId }).select("voucher");
    const ownedVoucherIds = userVouchers.map(uv => uv.voucher.toString());

    // 4. Tính toán Gacha (Weighted Random) với tối đa 3 lần Reroll
    const totalDropRate = activeVouchers.reduce((sum, v) => sum + v.dropRate, 0);
    let selectedVoucher = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      let randomNum = Math.random() * totalDropRate;
      let candidateVoucher = activeVouchers[activeVouchers.length - 1]; // Đề phòng lỗi

      for (const v of activeVouchers) {
        if (randomNum < v.dropRate) {
          candidateVoucher = v;
          break;
        }
        randomNum -= v.dropRate;
      }

      // Kiểm tra xem User đã có Voucher này chưa
      if (!ownedVoucherIds.includes(candidateVoucher._id.toString())) {
        selectedVoucher = candidateVoucher;
        break; // Trúng mã mới -> Dừng vòng lặp
      }
    }

    if (!selectedVoucher) {
      // 5. Reroll 3 lần vẫn trúng mã cũ -> Lưu lịch sử là trượt
      await NfcClaimHistory.create({
        dppId,
        user: userId,
      });
      return res.status(400).json({ success: false, message: "BAD_LUCK" });
    }

    // 6. Lưu vào UserVoucher
    const newUserVoucher = await UserVoucher.create({
      user: userId,
      voucher: selectedVoucher._id,
      status: "AVAILABLE",
    });

    // 7. Ghi nhận Lịch sử NFC
    await NfcClaimHistory.create({
      dppId,
      user: userId,
      voucher: selectedVoucher._id,
    });

    return successResponse(res, 201, "GACHA_SUCCESS", {
      voucher: {
        _id: selectedVoucher._id,
        title: selectedVoucher.title,
        code: selectedVoucher.code,
        type: selectedVoucher.type,
        discountValue: selectedVoucher.discountValue
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, "NFC_ALREADY_CLAIMED");
    }
    console.error("Lỗi claimNfcGacha:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
