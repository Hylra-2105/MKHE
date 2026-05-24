import jwt from 'jsonwebtoken';
import User from './auth.model.js';
import { sendVerificationEmail } from '../../utils/email.js';

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    const user = await User.create({
      email,
      password,
    });

    if (user) {
      // 1. Tạo ra một Token xác thực dùng 1 lần (Hết hạn trong 15 phút)
      const verificationToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      // 2. Gọi hàm gửi email xác thực và ném cái Token vào đó
      sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({
        message: 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực.',
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
        }
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ, không thể tạo tài khoản' });
    }
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};