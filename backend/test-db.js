import mongoose from "mongoose";
import dotenv from "dotenv";
import Voucher from "./src/modules/vouchers/voucher.model.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const vouchers = await Voucher.find();
    console.log("ALL VOUCHERS:", vouchers);
    
    const now = new Date();
    const publicVouchers = await Voucher.find({
      status: "PUBLISHED",
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    console.log("PUBLIC VOUCHERS:", publicVouchers);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
