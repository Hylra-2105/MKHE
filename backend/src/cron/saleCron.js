import cron from "node-cron";
import Product from "../modules/products/product.model.js";
import { createBulkMarketingNotifications } from "../modules/notifications/notification.controller.js";
import { getIO } from "../config/socket.js";

// Run every minute
export const startSaleCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Find all published products that are currently on sale and need a push notification
      const products = await Product.find({
        status: "PUBLISHED",
        isPublicEvent: true,
        salePrice: { $gt: 0 },
        saleStartDate: { $lte: now },
        saleEndDate: { $gt: now },
      });

      for (const product of products) {
        console.info(`[SaleCron] Sending push notification for sale start: ${product.name}`);
        
        // Send bulk push notification
        await createBulkMarketingNotifications(
          "FLASH_SALE_TITLE",
          `FLASH_SALE_MESSAGE::${product.name}`,
          `/shop/${product._id}`
        );

        // Turn off the flag so we don't send it again
        product.isPublicEvent = false;
        await product.save();
        
        try {
          getIO().emit("product_updated", product);
        } catch (err) {
          console.error("[SaleCron] Socket emit error:", err);
        }
      }
    } catch (error) {
      console.error("[SaleCron] Error checking scheduled sales:", error);
    }
  });

  console.info("[SaleCron] Initialized to check for scheduled sale notifications.");
};
