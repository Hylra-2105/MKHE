import { errorResponse } from "../utils/response.js";

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.user phải tồn tại (được verifyToken cấp) và role phải nằm trong danh sách cho phép
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 403, "FORBIDDEN_ACCESS");
    }
    next();
  };
};
