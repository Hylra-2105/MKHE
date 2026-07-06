import { successResponse, errorResponse } from "../../utils/response.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "NO_FILE_UPLOADED");
    }
    // File đã được upload lên Cloudinary bởi Multer middleware, lấy URL
    const imageUrl = req.file.path;
    return successResponse(res, 200, "UPLOAD_SUCCESS", { url: imageUrl });
  } catch (error) {
    console.error("[Upload Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
