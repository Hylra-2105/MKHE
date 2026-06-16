import Voucher from "./voucher.model.js";
import UserVoucher from "./userVoucher.model.js";

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

    res.json(availableVouchers);
  } catch (error) {
    console.error("Lỗi getPublicVouchers:", error);
    res.status(500).json({ message: "Lỗi Server" });
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
      return res.status(400).json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });
    }

    // Kiểm tra xem đã lưu chưa
    const existing = await UserVoucher.findOne({ user: userId, voucher: voucherId });
    if (existing) {
      return res.status(400).json({ message: "Bạn đã lưu mã giảm giá này rồi" });
    }

    // Tạo vào ví
    const userVoucher = await UserVoucher.create({
      user: userId,
      voucher: voucherId,
      status: "AVAILABLE",
    });

    res.status(201).json(userVoucher);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Bạn đã lưu mã giảm giá này rồi" });
    }
    console.error("Lỗi collectVoucher:", error);
    res.status(500).json({ message: "Lỗi Server" });
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

    res.json(updatedVouchers);
  } catch (error) {
    console.error("Lỗi getUserWallet:", error);
    res.status(500).json({ message: "Lỗi Server" });
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
      return res.status(404).json({ message: "Không tìm thấy vé trong hệ thống" });
    }

    if (uv.status === "USED") {
      return res.status(400).json({ message: "Mã này đã được sử dụng rồi" });
    }

    if (uv.status === "EXPIRED" || uv.voucher.endDate < new Date()) {
      return res.status(400).json({ message: "Mã này đã hết hạn" });
    }

    if (!uv.voucher.isO2O) {
      return res.status(400).json({ message: "Mã này chỉ áp dụng mua Online" });
    }

    // Đánh dấu đã dùng
    uv.status = "USED";
    uv.usedAt = new Date();
    await uv.save();

    // Tăng số lượng đã dùng của Voucher gốc
    uv.voucher.usedCount += 1;
    await uv.voucher.save();

    res.json({ message: "Đã áp dụng mã thành công tại quầy", userVoucher: uv });
  } catch (error) {
    console.error("Lỗi redeemOfflineVoucher:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
