import redisClient from "../config/redis.js";

/**
 * Xóa toàn bộ cache liên quan đến Products một cách an toàn
 * Sử dụng SCAN (qua stream của ioredis) thay vì KEYS để không block Redis.
 */
export const clearProductCache = () => {
  return new Promise((resolve, reject) => {
    let deletedCount = 0;
    const stream = redisClient.scanStream({
      match: "cache:products:*",
      count: 100, // Quét mỗi lần 100 keys
    });

    stream.on("data", async (keys) => {
      if (keys.length > 0) {
        // Tạm dừng stream để chờ xóa xong batch này (tránh overload)
        stream.pause();
        const pipeline = redisClient.pipeline();
        keys.forEach((key) => pipeline.del(key));
        
        try {
          await pipeline.exec();
          deletedCount += keys.length;
        } catch (err) {
          console.error("Lỗi khi xóa keys trong pipeline:", err);
        }
        
        // Tiếp tục stream
        stream.resume();
      }
    });

    stream.on("end", () => {
      console.log(`[Cache Invalidation] Đã xóa ${deletedCount} keys của Products.`);
      resolve(deletedCount);
    });

    stream.on("error", (err) => {
      console.error("[Cache Invalidation] Lỗi khi SCAN Redis:", err);
      reject(err);
    });
  });
};
