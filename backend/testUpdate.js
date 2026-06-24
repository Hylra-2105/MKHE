import mongoose from "mongoose";
import dotenv from "dotenv";
import Voucher from "./src/modules/vouchers/voucher.model.js";

dotenv.config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mkhe_db");
  const voucher = await Voucher.findOne({ code: "KHANRAN" });
  if (!voucher) {
    console.log("No voucher found");
    process.exit(1);
  }
  console.log("Found voucher:", voucher._id);
  
  // mock req, res
  const req = {
    params: { id: voucher._id.toString() },
    body: { endDate: new Date().toISOString() }
  };
  
  const res = {
    status: (code) => {
      console.log("Status:", code);
      return {
        json: (data) => console.log("Response JSON:", data)
      };
    }
  };
  
  const { updateVoucher } = await import("./src/modules/vouchers/voucher.controller.js");
  await updateVoucher(req, res);
  process.exit(0);
};
test();
