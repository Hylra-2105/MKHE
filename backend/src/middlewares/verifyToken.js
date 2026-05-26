import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

export const verifyToken = (req, res, next) => {
  // Lấy token từ header "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Lỗi 401: Không có quyền truy cập (Thiếu token)
    return errorResponse(res, 401, "MISSING_TOKEN");
  }

  // Tách lấy phần token (bỏ chữ "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Giải mã token xem có hợp lệ và còn hạn không
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn thông tin user vừa giải mã được vào request để các Controller sau dùng
    req.user = decoded;

    // Cấp phép đi tiếp
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Lỗi 401: Token hết hạn
      return errorResponse(res, 401, "TOKEN_EXPIRED");
    }
    // Lỗi 403: Token bị sai lệch, bị giả mạo
    return errorResponse(res, 403, "INVALID_TOKEN");
  }
};
