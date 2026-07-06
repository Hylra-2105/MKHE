import cron from "node-cron";
import Order from "../modules/orders/order.model.js";

// Chạy cronjob mỗi nửa đêm (00:00)
export const startOrderCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("[Cronjob] Đang quét các đơn hàng DELIVERING quá 3 ngày...");
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const result = await Order.updateMany(
        {
          orderStatus: "DELIVERING",
          updatedAt: { $lte: threeDaysAgo },
        },
        {
          $set: {
            orderStatus: "COMPLETED",
            paymentStatus: "PAID",
          },
        }
      );

      console.log(`[Cronjob] Đã tự động hoàn thành ${result.modifiedCount} đơn hàng.`);
    } catch (error) {
      console.error("[Cronjob] Lỗi khi quét tự động hoàn thành đơn hàng:", error);
    }
  });

  console.log("[Cronjob] Đã khởi tạo dịch vụ quét đơn hàng tự động (Chạy lúc 00:00 hằng ngày).");
};
