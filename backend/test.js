import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const createVietnameseRegex = (keyword) => {
  if (!keyword) return "";
  let str = keyword.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  str = str.replace(/a/g, "[aàáạảãâầấậẩẫăằắặẳẵ]");
  return new RegExp(str, "i");
};

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Product = mongoose.model('ProductTest', new mongoose.Schema({name: String, sku: String, status: String, stock: Number, isDeleted: Boolean}, { collection: 'products' })); 
    const searchRegex = createVietnameseRegex("10k");
    const query = {
        $or: [
          { name: { $regex: searchRegex, $options: "i" } },
          { sku: { $regex: searchRegex, $options: "i" } },
        ],
        status: { $in: ["PUBLISHED", "OUT_OF_STOCK"] }
    };
    try {
        const res = await Product.find(query);
        console.log("Success! Found:", res.length);
    } catch(err) {
        console.log("Error:", err.message);
    }
    process.exit(0); 
  });
