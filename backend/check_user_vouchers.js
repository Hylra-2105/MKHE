import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to MongoDB");
  
  const Order = mongoose.connection.collection("orders");
  const order = await Order.findOne({ orderCode: "MKHE-MRTYJ" });
  if (order) {
      console.log("Found Order:", order.orderCode, "User:", order.user);
      
      const UserVoucher = mongoose.connection.collection("uservouchers");
      const userVouchers = await UserVoucher.find({ user: order.user }).toArray();
      console.log("UserVouchers for this user:", userVouchers.length);
      console.log(userVouchers);
  } else {
      console.log("Order MKHE-MRTYJ not found");
  }
  
  process.exit(0);
});
