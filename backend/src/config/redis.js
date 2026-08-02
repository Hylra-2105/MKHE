import Redis from "ioredis";

// Lấy REDIS_URL từ biến môi trường, mặc định kết nối localhost:6379 nếu không có
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = new Redis(redisUrl, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 50,
});

redisClient.on("connect", () => {
  console.log("🔥 Redis connected successfully!");
});

redisClient.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

export default redisClient;
