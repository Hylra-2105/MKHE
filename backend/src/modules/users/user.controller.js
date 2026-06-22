import User from "./user.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { createVietnameseRegex, isValidEmail } from "../../utils/helpers.js";
import { sendBlockAccountEmail } from "../../utils/email.js";

// admin lấy danh sách users
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
      .select("-password -refreshToken")
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

    // các trường không được update
    delete updateData.email;
    delete updateData.password;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    ).select("-password -refreshToken");

    if (!updatedUser) return errorResponse(res, 404, "USER_NOT_FOUND");

    // Gửi email nếu tài khoản vừa bị KHÓA
    if (isBlocked === true && blockReason) {
      // Gọi async nhưng không await để không làm chậm response API
      // Lấy language từ user hoặc default vi
      const userLang = req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || updatedUser.language || "vi";
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

// User update profile
export const updateMyProfile = async (req, res) => {
  try {
    // req.user được lấy từ verifyToken
    const userId = req.user.id;
    const { name, phone, bio, avatar, addressText, coordinates } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }

    // Cập nhật thông tin (Chỉ cập nhật field nào được gửi lên)
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    // Cập nhật địa chỉ mặc định nếu có truyền lên
    if (addressText && coordinates) {
      const defaultAddressIndex = user.addresses.findIndex((a) => a.isDefault);
      
      if (defaultAddressIndex !== -1) {
        // Có sẵn địa chỉ mặc định -> Ghi đè
        user.addresses[defaultAddressIndex].addressText = addressText;
        user.addresses[defaultAddressIndex].coordinates = coordinates;
        user.addresses[defaultAddressIndex].receiverName = user.name;
        user.addresses[defaultAddressIndex].receiverPhone = user.phone;
      } else {
        // Chưa có -> Tạo mới và push vào
        user.addresses.push({
          receiverName: user.name,
          receiverPhone: user.phone,
          addressText: addressText,
          coordinates: coordinates,
          isDefault: true
        });
      }
    }

    // Nếu có gửi avatar mới lên -> Kích hoạt khiên bảo vệ
    if (avatar) {
      user.avatar = avatar;
      user.hasCustomAvatar = true;
    }

    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;
    delete userData.refreshToken;

    // Trả về đúng chuẩn Helper
    return successResponse(res, 200, "PROFILE_UPDATED_SUCCESS", userData);
  } catch (error) {
    console.error("[Update Profile Error]", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    // Nếu middleware của Multer không bắt được file
    if (!req.file) {
      return errorResponse(res, 400, "MISSING_FILE");
    }

    const userId = req.user.id;
    const fileUrl = req.file.path; //  LINK CLOUDINARY TRẢ VỀ

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, "USER_NOT_FOUND");

    // Cập nhật ảnh đại diện mới
    user.avatar = fileUrl;
    user.hasCustomAvatar = true;
    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;
    delete userData.refreshToken;

    return successResponse(res, 200, "AVATAR_UPLOAD_SUCCESS", userData);
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// admin create user
export const createUser = async (req, res) => {
  try {
    // Lấy dữ liệu
    let { name, email, password, role } = req.body;

    // 2. Kiểm tra các trường bắt buộc
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "MISSING_FIELDS" });
    }

    // Chuẩn hóa dữ liệu
    name = name.trim();

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "PASSWORD_TOO_SHORT" });
    }

    // Kiểm tra định dạng email hợp lệ
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "INVALID_EMAIL_FORMAT" });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "EMAIL_ALREADY_EXISTS" });
    }

    // Tạo tài khoản mới
    const newUser = new User({
      name,
      email,
      password,
      role: role || "Customer",
      isVerified: true,
      provider: "local",
    });

    await newUser.save();

    // Ẩn password trước khi trả về Frontend
    const userData = newUser.toObject();
    delete userData.password;

    return res.status(201).json({
      success: true,
      message: "USER_CREATED_SUCCESS",
      user: userData,
    });
  } catch (error) {
    console.error("Error in [ADMIN] createUser:", error);
    return res.status(500).json({ success: false, message: "SERVER_ERROR" });
  }
};

// User thêm địa chỉ mới
export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverName, receiverPhone, addressText, coordinates, isDefault } = req.body;

    if (!receiverName || !receiverPhone || !addressText) {
      return errorResponse(res, 400, "MISSING_FIELDS");
    }

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, "USER_NOT_FOUND");

    const newAddress = {
      receiverName,
      receiverPhone,
      addressText,
      coordinates,
      isDefault: false
    };

    // Nếu mảng rỗng hoặc user chọn isDefault = true
    if (user.addresses.length === 0 || isDefault) {
      newAddress.isDefault = true;
      // Nếu là default, cập nhật tất cả địa chỉ cũ thành false
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    return successResponse(res, 201, "ADDRESS_ADDED_SUCCESS", userData);
  } catch (error) {
    console.error("Add Address Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// Cập nhật địa chỉ mặc định
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, "USER_NOT_FOUND");

    let addressFound = false;
    user.addresses.forEach(addr => {
      if (addr._id.toString() === addressId) {
        addr.isDefault = true;
        addressFound = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!addressFound) {
      return errorResponse(res, 404, "ADDRESS_NOT_FOUND");
    }

    await user.save();
    
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    return successResponse(res, 200, "SET_DEFAULT_ADDRESS_SUCCESS", userData);
  } catch (error) {
    console.error("Set Default Address Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
