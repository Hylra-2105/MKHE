import User from "./user.model.js";
import { errorResponse } from "../../utils/response.js";
import { createVietnameseRegex } from "../../utils/helpers.js";

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
    const updateData = req.body;

    // BẢO MẬT: Xóa những trường không được phép update trực tiếp qua API này
    delete updateData.email;
    delete updateData.password;

    // Tìm và cập nhật user, trả về user mới nhất ({ new: true })
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password -otp -refreshToken"); // Đồng bộ ẩn các trường nhạy cảm như hàm GET

    if (!updatedUser) {
      // Dùng hàm errorResponse và trả về mã lỗi chuẩn
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }

    // Chuẩn hóa format trả về khi thành công
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

    // Tìm và xóa thẳng tay khỏi Database
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }

    return res.status(200).json({
      success: true,
      message: "USER_DELETE_SUCCESS",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
