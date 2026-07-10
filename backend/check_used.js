import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to MongoDB");
  
  // Find UserVoucher
  const UserVoucher = mongoose.connection.collection("uservouchers");
  const usedVouchers = await UserVoucher.find({ status: "USED" }).toArray();
  console.log("Used Vouchers Count:", usedVouchers.length);
  if (usedVouchers.length > 0) {
      console.log("Sample USED voucher:", usedVouchers[0]);
  }
  
  process.exit(0);
});
