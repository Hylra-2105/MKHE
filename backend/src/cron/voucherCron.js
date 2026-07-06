import cron from "node-cron";
import Voucher from "../modules/vouchers/voucher.model.js";
import UserVoucher from "../modules/vouchers/userVoucher.model.js";
import User from "../modules/users/user.model.js";
import { createBulkMarketingNotifications } from "../modules/notifications/notification.controller.js";
import { getIO } from "../config/socket.js";

// Run every minute
export const startVoucherCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Find all published vouchers that are currently active and need a push notification
      const vouchers = await Voucher.find({
        status: "PUBLISHED",
        isPublicEvent: true,
        startDate: { $lte: now },
        endDate: { $gt: now },
      });

      for (const voucher of vouchers) {
        console.info(`[VoucherCron] Sending push notification and airdropping voucher: ${voucher.code}`);
        
        // 1. Airdrop voucher to ALL users
        try {
          const users = await User.find({}, "_id");
          const userVouchersData = users.map(u => ({
            user: u._id,
            voucher: voucher._id,
            status: "AVAILABLE",
          }));
          
          if (userVouchersData.length > 0) {
            await UserVoucher.insertMany(userVouchersData, { ordered: false }).catch((e) => {
              // Ignore duplicate key errors (11000)
              if (e.code !== 11000) console.error("[VoucherCron] Airdrop error:", e);
            });
          }
        } catch (error) {
          console.error("[VoucherCron] Error during airdrop:", error);
        }

        // 2. Send bulk push notification
        await createBulkMarketingNotifications(
          "Lưu mã giảm giá thành công",
          `Bạn đã thu thập thành công mã giảm giá ${voucher.code}.`,
          "/cart" 
        );

        // Turn off the flag so we don't send it again
        voucher.isPublicEvent = false;
        await voucher.save();
        
        try {
          getIO().emit("voucher_updated", voucher);
        } catch (err) {
          console.error("[VoucherCron] Socket emit error:", err);
        }
      }
    } catch (error) {
      console.error("[VoucherCron] Error checking scheduled vouchers:", error);
    }
  });

  console.info("[VoucherCron] Initialized to check for scheduled voucher notifications.");
};
