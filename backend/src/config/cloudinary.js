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
    const isVideo = file.mimetype.startsWith("video/");
    // Nhận diện file 3D dựa trên đuôi file hoặc mimetype
    const is3D = file.originalname.endsWith(".glb") || file.originalname.endsWith(".gltf") || file.mimetype.startsWith("model/");

    let folderName = "mkhe_avatars";
    let resourceType = "image";

    if (isVideo) {
      folderName = "mkhe_videos";
      resourceType = "video";
    } else if (is3D) {
      folderName = "mkhe_3d";
      resourceType = "raw"; 
    }

    return {
      folder: folderName,
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// Tạo Middleware Bộ lọc Multer để kiểm soát file đầu vào
const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith("image/");
  const isVideo = file.mimetype.startsWith("video/");
  const is3D = file.originalname.endsWith(".glb") || file.originalname.endsWith(".gltf") || file.mimetype.startsWith("model/");

  if (isImage || isVideo || is3D) {
    cb(null, true);
  } else {
    cb(new Error("INVALID_FILE_FORMAT"), false); 
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

export { cloudinary };