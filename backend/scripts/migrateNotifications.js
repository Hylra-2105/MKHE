import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

import Notification from "../src/modules/notifications/notification.model.js";
import connectDB from "../src/config/db.js";

const titleMap = {
  "Đặt hàng thành công": "ORDER_PLACED",
  "Thanh toán thành công": "ORDER_PAYMENT_SUCCESS",
  "Đơn hàng đã được xác nhận": "ORDER_CONFIRMED",
  "Đơn hàng đang giao": "ORDER_DELIVERING",
  "Giao hàng thành công": "ORDER_COMPLETED",
  "Đơn hàng đã hủy": "ORDER_CANCELLED",
  "Lưu mã giảm giá thành công": "VOUCHER_SAVED",
  "Nhập mã giảm giá thành công": "VOUCHER_SAVED",
  "Chúc mừng trúng thưởng!": "LUCKY_WHEEL_WON",
  "Sản phẩm Sale Khủng!": "FLASH_SALE_TITLE",
  "Bạn có mã ưu đãi mới!": "VOUCHER_PUBLISHED_TITLE",
  "Đơn hàng mới": "ADMIN_ORDER_NEW",
  "Đơn hàng đã thanh toán": "ADMIN_ORDER_PAID",
  "Đơn hàng hoàn tất": "ADMIN_ORDER_COMPLETED",
  "Cảnh báo tồn kho": "ADMIN_STOCK_ALERT"
};

const runMigration = async () => {
  await connectDB();
  
  const notifications = await Notification.find({});
  let updatedCount = 0;

  for (const notif of notifications) {
    let needsUpdate = false;
    
    // 1. Update Title
    if (titleMap[notif.title]) {
      notif.title = titleMap[notif.title];
      needsUpdate = true;
    }

    // 2. Update Message based on regex extraction if it's the old Vietnamese format
    if (notif.title === "ORDER_PLACED" && notif.message.includes("Đơn hàng") && notif.message.includes("đã được đặt thành công")) {
      const match = notif.message.match(/(?:ORD-|MKHE-)[A-Z0-9]+/);
      if (match) {
        notif.message = `ORDER_PLACED_MESSAGE::${match[0]}`;
        needsUpdate = true;
      }
    } else if (notif.title === "ORDER_PAYMENT_SUCCESS" && notif.message.includes("Thanh toán cho đơn hàng")) {
      const match = notif.message.match(/(?:ORD-|MKHE-)[A-Z0-9]+/);
      if (match) {
        notif.message = `ORDER_PAYMENT_SUCCESS_MESSAGE::${match[0]}`;
        needsUpdate = true;
      }
    } else if (notif.title === "ORDER_CONFIRMED" && notif.message.includes("đã được xác nhận")) {
      const match = notif.message.match(/(?:ORD-|MKHE-)[A-Z0-9]+/);
      if (match) {
        notif.message = `ORDER_CONFIRMED_MESSAGE::${match[0]}`;
        needsUpdate = true;
      }
    } else if (notif.title === "ORDER_DELIVERING" && notif.message.includes("bàn giao cho đơn vị vận chuyển")) {
      const match = notif.message.match(/(?:ORD-|MKHE-)[A-Z0-9]+/);
      if (match) {
        notif.message = `ORDER_DELIVERING_MESSAGE::${match[0]}`;
        needsUpdate = true;
      }
    } else if (notif.title === "ORDER_COMPLETED" && notif.message.includes("giao thành công")) {
      const match = notif.message.match(/(?:ORD-|MKHE-)[A-Z0-9]+/);
      if (match) {
        notif.message = `ORDER_COMPLETED_MESSAGE::${match[0]}`;
        needsUpdate = true;
      }
    } else if (notif.title === "ORDER_CANCELLED" && notif.message.includes("đã bị hủy")) {
      const match = notif.message.match(/(?:ORD-|MKHE-)[A-Z0-9]+/);
      if (match) {
        notif.message = `ORDER_CANCELLED_MESSAGE::${match[0]}`;
        needsUpdate = true;
      }
    } else if (notif.title === "VOUCHER_SAVED" && notif.message.includes("mã giảm giá")) {
      const match = notif.message.match(/mã giảm giá ([\w\d]+)/);
      if (match) {
        notif.message = `VOUCHER_SAVED_MESSAGE::${match[1]}`;
        needsUpdate = true;
      }
    } else if (notif.title === "LUCKY_WHEEL_WON" && notif.message.includes("mã giảm giá")) {
      const match = notif.message.match(/mã giảm giá ([\w\d]+)/);
      if (match) {
        notif.message = `LUCKY_WHEEL_WON_MESSAGE::${match[1]}`;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await notif.save();
      updatedCount++;
    }
  }

  console.log(`Migration Complete: Updated ${updatedCount} notifications.`);
  process.exit(0);
};

runMigration();
