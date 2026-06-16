import mongoose from "mongoose";
import UserVoucher from "./src/modules/vouchers/userVoucher.model.js";

const testDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/mkhe_db");
    const count = await UserVoucher.countDocuments();
    console.log("Tổng số UserVoucher:", count);

    const first = await UserVoucher.findOne().populate({
      path: "voucher",
      populate: [
        { path: "applicableVillages", select: "name" },
        { path: "applicableCategories", select: "name" }
      ]
    });
    if (first) {
      console.log("Mẫu UserVoucher đầu tiên:", first);
      console.log("Voucher populate:", first.voucher);
    }
    process.exit(0);
  } catch(e) {
    console.log(e);
  }
};
testDb();
