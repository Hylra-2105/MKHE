import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to MongoDB");
  
  // Find UserVoucher
  const UserVoucher = mongoose.connection.collection("uservouchers");
  const count = await UserVoucher.countDocuments({});
  console.log("Total UserVouchers:", count);
  
  const allUv = await UserVoucher.find({}).toArray();
  console.log(allUv);
  
  // Find Vouchers
  const Voucher = mongoose.connection.collection("vouchers");
  const vCount = await Voucher.countDocuments({});
  console.log("Total Vouchers:", vCount);
  
  process.exit(0);
});
