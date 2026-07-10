import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to MongoDB");
  
  const Voucher = mongoose.connection.collection("vouchers");
  const v1 = await Voucher.findOne({ _id: new mongoose.Types.ObjectId('6a3899a0c0215cde4b390901') });
  console.log("Voucher 1:", v1);
  const v2 = await Voucher.findOne({ _id: new mongoose.Types.ObjectId('6a3a37e2e8581b1289a130fe') });
  console.log("Voucher 2:", v2);
  
  process.exit(0);
});
