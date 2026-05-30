import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

import dotenv from "dotenv";
dotenv.config();

// Cấu hình chìa khóa kết nối với Cloudinary lấy từ file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình kho chứa (Storage) trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Tự động phân loại thư mục lưu trữ: video sẽ vào 'videos', ảnh vào 'avatars'
    const isVideo = file.mimetype.startsWith("video/");

    return {
      folder: isVideo ? "mkhe_videos" : "mkhe_avatars",
      resource_type: "auto", // Cloudinary tự nhận diện Video/Ảnh động thay vì ép về định dạng ảnh tĩnh
      allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "webm"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // Đặt tên file tránh trùng lặp
    };
  },
});

// Tạo Middleware Bộ lọc Multer để kiểm soát file đầu vào
const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith("image/");
  const isVideo = file.mimetype.startsWith("video/");

  if (isImage || isVideo) {
    cb(null, true); // File hợp lệ, cho đi tiếp
  } else {
    cb(
      new Error("Định dạng file không hợp lệ! Chỉ chấp nhận ảnh và video."),
      false,
    ); // File lỗi, chặn lại
  }
};

// Khởi tạo cấu hình Multer hoàn chỉnh
export const uploadCloud = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
