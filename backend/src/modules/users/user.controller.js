import User from "./user.model.js";
import { errorResponse } from "../../utils/response.js";
import { createVietnameseRegex } from "../../utils/helpers.js";
import { sendBlockAccountEmail } from "../../utils/email.js";

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const roleFilter = req.query.role || "";

    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      const searchRegex = createVietnameseRegex(search);
      query.$or = [
        { name: { $regex: searchRegex, $options: "i" } },
        { email: { $regex: searchRegex, $options: "i" } },
        { phone: { $regex: searchRegex, $options: "i" } },
      ];
    }
    if (roleFilter) query.role = roleFilter;

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .collation({ locale: "vi", strength: 2 })
      .select("-password -otp -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      success: true,
      pagination: {
        totalItems: totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
      data: users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// Admin update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, blockReason, ...otherData } = req.body;

    let updateData = { ...otherData };

    // Xử lý logic khóa / mở khóa
    if (isBlocked !== undefined) {
      updateData.isBlocked = isBlocked;
      // Chỉ lưu lý do nếu đang thực hiện KHÓA (isBlocked = true)
      updateData.blockReason = isBlocked ? blockReason : "";
    }

    // Bảo mật: Loại bỏ các trường không được update
    delete updateData.email;
    delete updateData.password;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    ).select("-password -otp -refreshToken");

    if (!updatedUser) return errorResponse(res, 404, "USER_NOT_FOUND");

    // Gửi email nếu tài khoản vừa bị KHÓA
    if (isBlocked === true && blockReason) {
      // Gọi async nhưng không await để không làm chậm response API
      // Lấy language từ user hoặc default vi
      const userLang = updatedUser.language || "vi";
      sendBlockAccountEmail(updatedUser.email, blockReason, userLang).catch(
        (err) => {
          console.error("[⚠️ Email Error] Gửi mail thất bại:", {
            email: updatedUser.email,
            reason: blockReason,
            language: userLang,
            error: err.message,
          });
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "USER_UPDATE_SUCCESS",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// Admin xóa user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) return errorResponse(res, 404, "USER_NOT_FOUND");

    return res.status(200).json({
      success: true,
      message: "USER_DELETE_SUCCESS",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
