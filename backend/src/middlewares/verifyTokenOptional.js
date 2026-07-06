import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";

export const verifyTokenOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // Proceed without req.user
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is blocked
    const user = await User.findById(decoded.id);
    if (user && !user.isBlocked) {
      req.user = user;
    }
  } catch (error) {
    // Nếu token hết hạn hoặc lỗi, phải trả về 401 để frontend tự động refresh token
    // Không được lờ đi vì frontend sẽ hiển thị sai state (Admin nhưng data Guest)
    return res.status(401).json({
      success: false,
      message: "TOKEN_EXPIRED_OR_INVALID"
    });
  }

  next();
};
