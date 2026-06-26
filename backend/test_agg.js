import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const orderSchema = new mongoose.Schema({
  paymentStatus: String,
  totalAmount: Number,
  createdAt: Date
}, { strict: false });
const Order = mongoose.model("Order", orderSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - 30);

  const orders = await Order.aggregate([
    {
      $match: {
        paymentStatus: "PAID",
        createdAt: { $gte: startDate, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  console.log(orders);
  process.exit(0);
});
