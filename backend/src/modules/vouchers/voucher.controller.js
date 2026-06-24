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
      status: "PUBLISHED",
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
      status,
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
      status: status || "DRAFT",
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const status = req.query.status || "ALL";
    const type = req.query.type || "ALL";
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } }
      ];
    }

    if (type !== "ALL") {
      query.type = type;
    }

    if (status !== "ALL") {
      const now = new Date();
      if (status === "PUBLISHED") {
        query.status = "PUBLISHED";
        query.startDate = { $lte: now };
        query.endDate = { $gte: now };
        query.$expr = {
          $or: [
            { $eq: ["$usageLimit", null] },
            { $lt: ["$usedCount", "$usageLimit"] }
          ]
        };
      } else if (status === "UPCOMING") {
        query.status = "PUBLISHED";
        query.startDate = { $gt: now };
      } else if (status === "ENDED") {
        query.$or = [
          { status: "ENDED" },
          { status: "PUBLISHED", endDate: { $lt: now } },
          { 
            status: "PUBLISHED", 
            $expr: {
              $and: [
                { $ne: ["$usageLimit", null] },
                { $gte: ["$usedCount", "$usageLimit"] }
              ]
            }
          }
        ];
      } else if (status === "DRAFT") {
        query.status = "DRAFT";
      }
    } else {
      // Khi "ALL", không hiển thị các mã đã bị ENDED
      query.status = { $ne: "ENDED" };
    }

    const total = await Voucher.countDocuments(query);
    const vouchers = await Voucher.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "GET_VOUCHERS_SUCCESS",
      data: vouchers,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    });
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
      status: "PUBLISHED",
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

// @desc    Cập nhật mã giảm giá
// @route   PUT /api/vouchers/admin/:id
// @access  Private/Admin|Staff
export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const voucher = await Voucher.findById(id);
    if (!voucher) return errorResponse(res, 404, "VOUCHER_NOT_FOUND");
    
    // Trạng thái PUBLISHED khóa chỉnh sửa một số trường quan trọng (chỉ khóa khi voucher ĐÃ CHẠY)
    const isLocked = voucher.status === "PUBLISHED" && new Date(voucher.startDate) <= new Date();
    
    if (isLocked) {
      // Bị khóa code, type, discountValue
      if (updateData.code && updateData.code.toUpperCase() !== voucher.code) return errorResponse(res, 400, "CANNOT_UPDATE_LOCKED_FIELDS");
      if (updateData.type && updateData.type !== voucher.type) return errorResponse(res, 400, "CANNOT_UPDATE_LOCKED_FIELDS");
      if (updateData.discountValue !== undefined && Number(updateData.discountValue) !== voucher.discountValue) return errorResponse(res, 400, "CANNOT_UPDATE_LOCKED_FIELDS");
    } else {
       // DRAFT: Được phép cập nhật toàn bộ
       if (updateData.code && updateData.code.toUpperCase() !== voucher.code) {
           const existing = await Voucher.findOne({ code: updateData.code.toUpperCase() });
           if (existing) return errorResponse(res, 400, "VOUCHER_CODE_EXISTS");
           voucher.code = updateData.code.toUpperCase();
       }
       if (updateData.type) voucher.type = updateData.type;
       if (updateData.discountValue !== undefined) voucher.discountValue = updateData.discountValue;
       if (updateData.maxDiscount !== undefined) voucher.maxDiscount = updateData.type === 'PERCENTAGE' ? updateData.maxDiscount : null;
       if (updateData.startDate) voucher.startDate = updateData.startDate;
    }
    
    // Luôn cho phép cập nhật endDate và usageLimit
    if (updateData.endDate) {
       if (new Date(updateData.endDate) <= new Date(voucher.startDate)) return errorResponse(res, 400, "INVALID_DATE_RANGE");
       voucher.endDate = updateData.endDate;
    }
    
    if (updateData.usageLimit !== undefined) voucher.usageLimit = updateData.usageLimit;
    if (updateData.minOrderValue !== undefined) voucher.minOrderValue = updateData.minOrderValue;
    if (updateData.applicableVillages) voucher.applicableVillages = updateData.applicableVillages;
    if (updateData.applicableCategories) voucher.applicableCategories = updateData.applicableCategories;
    if (updateData.isO2O !== undefined) voucher.isO2O = updateData.isO2O;
    if (updateData.dropRate !== undefined) voucher.dropRate = updateData.dropRate;
    
    // Hỗ trợ chuyển đổi trạng thái (từ DRAFT sang PUBLISHED)
    if (updateData.status === "PUBLISHED" && voucher.status === "DRAFT") {
      voucher.status = "PUBLISHED";
    }
    
    // Hỗ trợ chuyển đổi trạng thái (từ PUBLISHED về DRAFT nếu voucher chưa chạy)
    if (updateData.status === "DRAFT" && voucher.status === "PUBLISHED") {
      if (new Date(voucher.startDate) > new Date()) {
        voucher.status = "DRAFT";
      } else {
        return errorResponse(res, 400, "CANNOT_REVERT_RUNNING_VOUCHER");
      }
    }

    // Recalculate title
    if (voucher.type === "PERCENTAGE") {
      voucher.title = `Giảm ${voucher.discountValue}%`;
      if (voucher.maxDiscount) voucher.title += ` tối đa ${voucher.maxDiscount.toLocaleString("vi-VN")}đ`;
    } else if (voucher.type === "FIXED_AMOUNT") {
      voucher.title = `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`;
    } else if (voucher.type === "FREE_SHIP") {
      voucher.title = voucher.discountValue > 0 ? `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ phí vận chuyển` : `Miễn phí vận chuyển`;
    }

    await voucher.save();
    return successResponse(res, 200, "VOUCHER_UPDATED_SUCCESS", voucher);
  } catch (error) {
    console.error("Lỗi updateVoucher:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// @desc    Soft-delete mã giảm giá
// @route   DELETE /api/vouchers/admin/:id
// @access  Private/Admin|Staff
export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findById(id);
    if (!voucher) return errorResponse(res, 404, "VOUCHER_NOT_FOUND");
    
    if (voucher.status === "DRAFT") {
      // Hard delete nếu đang ở nháp
      await Voucher.findByIdAndDelete(id);
      return successResponse(res, 200, "VOUCHER_DELETED_SUCCESS", voucher);
    }
    
    // Soft delete: chuyển trạng thái sang ENDED
    voucher.status = "ENDED";
    voucher.isActive = false;
    await voucher.save();
    
    return successResponse(res, 200, "VOUCHER_DELETED_SUCCESS", voucher);
  } catch (error) {
    console.error("Lỗi deleteVoucher:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
