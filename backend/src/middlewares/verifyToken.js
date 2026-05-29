import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";
import User from "../modules/users/user.model.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, 401, "MISSING_TOKEN");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is blocked (critical security check)
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }
    if (user.isBlocked) {
      return errorResponse(res, 403, "ACCOUNT_BLOCKED");
    }

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "TOKEN_EXPIRED");
    }

    return errorResponse(res, 403, "INVALID_TOKEN");
  }
};
