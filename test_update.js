import mongoose from 'mongoose';
import Product from './backend/src/modules/products/product.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function testUpdate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Mongoose Object.assign test
    const product = await Product.findById("6a2298b4df88bb5054a29631");
    if (!product) {
      console.log("Product not found! Trying the first one...");
      const p = await Product.findOne();
      console.log("Found product:", p._id);
      Object.assign(p, { hasDPP: true, artisanName: 'Test', gpsLocation: '123' });
      await p.save();
      console.log('Update success');
      return;
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
