import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

export const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {

    return errorResponse(res, 401, "MISSING_TOKEN");
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {

      return errorResponse(res, 401, "TOKEN_EXPIRED");
    }

    return errorResponse(res, 403, "INVALID_TOKEN");
  }
};
