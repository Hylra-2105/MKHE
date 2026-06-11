import mongoose from 'mongoose';
import Product from './src/modules/products/product.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function testUpdate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    let product;
    try {
        product = await Product.findById("6a2298b4df88bb5054a29631");
    } catch (e) {
        console.error("Invalid object ID", e.message);
    }
    if (!product) {
      console.log("Product not found! Trying the first one...");
      product = await Product.findOne();
      console.log("Found product:", product._id);
    }

    Object.assign(product, {
      name: "testtt",
      sku: "HTML-25",
      vendor: "HTX Châu Giang",
      categoryMatrix: "B2B_Standard",
      culturalDNA: "KINH",
      price: 25000,
      stock: 5,
      hasDPP: true,
      artisanName: "CC",
      gpsLocation: "123",
      status: "DRAFT"
    });

    await product.save();
    console.log('Update success');
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testUpdate();
