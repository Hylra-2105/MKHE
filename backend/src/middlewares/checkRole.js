import { errorResponse } from "../utils/response.js";

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.user phải tồn tại (được verifyToken cấp) và role phải nằm trong danh sách cho phép
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // Lỗi 403: Không đủ quyền truy cập vào tài nguyên này
      return errorResponse(res, 403, "FORBIDDEN_ACCESS");
    }

    // Đúng quyền thì cho qua
    next();
  };
};
