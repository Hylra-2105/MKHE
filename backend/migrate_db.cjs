/**
 * Script migrate data từ Local MongoDB → MongoDB Atlas
 * Chạy: node migrate_db.js
 */
const { MongoClient } = require("mongodb");

const SOURCE_URI = "mongodb://127.0.0.1:27017/mkhe_db";

// ⚠️ Thay YOUR_PASSWORD bằng mật khẩu Atlas của bạn
const TARGET_URI = "mongodb+srv://mkhe_admin:MKHEPassword2026@mkhe-cluster.uecmphb.mongodb.net/mkhe_db?appName=mkhe-cluster";

const COLLECTIONS = [
  "nfctags",
  "craftvillages",
  "blogs",
  "products",
  "vouchers",
  "users",
  "reviews",
  "uservouchers",
  "orders",
  "nfoclaimhistories",
  "carts",
];

async function migrate() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);

  try {
    console.log("🔌 Đang kết nối...");
    await sourceClient.connect();
    await targetClient.connect();
    console.log("✅ Kết nối thành công!\n");

    const sourceDb = sourceClient.db("mkhe_db");
    const targetDb = targetClient.db("mkhe_db");

    for (const collName of COLLECTIONS) {
      try {
        const sourceColl = sourceDb.collection(collName);
        const targetColl = targetDb.collection(collName);

        const docs = await sourceColl.find({}).toArray();
        if (docs.length === 0) {
          console.log(`⏭️  ${collName}: trống, bỏ qua`);
          continue;
        }

        // Xóa toàn bộ collection (kể cả index cũ) rồi insert lại
        try { await targetColl.drop(); } catch (e) { /* collection chưa tồn tại, bỏ qua */ }
        await targetColl.insertMany(docs);
        console.log(`✅ ${collName}: ${docs.length} documents`);
      } catch (err) {
        console.error(`❌ ${collName}: ${err.message}`);
      }
    }

    console.log("\n🎉 Migrate hoàn tất!");
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

migrate();
