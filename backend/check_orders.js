import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const orderSchema = new mongoose.Schema({
  paymentStatus: String,
  totalAmount: Number,
  createdAt: Date
}, { strict: false });
const Order = mongoose.model("Order", orderSchema);

const productSchema = new mongoose.Schema({
  name: String,
  sold: Number,
  stock: Number
}, { strict: false });
const Product = mongoose.model("Product", productSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const orders = await Order.find();
  console.log(`Total orders: ${orders.length}`);
  console.log(orders.map(o => ({ status: o.paymentStatus, date: o.createdAt, total: o.totalAmount })));
  
  const products = await Product.find({}, "name sold stock").limit(10);
  console.log("Products:");
  console.log(products);
  process.exit(0);
});
