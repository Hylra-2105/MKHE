import nodemailer from "nodemailer";

export const sendVerificationEmail = async (
  toEmail,
  otp,
  emailUser,
  emailPass,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"MKHE Heritage" <${emailUser}>`,
    to: toEmail,
    subject: "Mã xác thực OTP của bạn tại MKHE",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center; font-size: 24px;">Chào mừng bạn đến với MKHE</h2>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; text-align: center;">
          Để hoàn tất đăng ký, vui lòng nhập mã OTP gồm 6 chữ số bên dưới vào ứng dụng:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #e5dcd3; color: #333; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </span>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
          Mã này sẽ hết hạn sau <strong>15 phút</strong>.<br>
          Vui lòng không chia sẻ mã này cho bất kỳ ai.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email OTP đã được gửi tới: ${toEmail}`);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    throw new Error("Không thể gửi email xác thực");
  }
};

// gửi email reset password (ĐÃ SỬA SANG DẠNG OTP)
export const sendPasswordResetEmail = async (
  toEmail,
  otp, // Thay resetUrl thành otp
  emailUser,
  emailPass,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"MKHE Heritage" <${emailUser}>`,
    to: toEmail,
    subject: "Yêu cầu đặt lại mật khẩu tại MKHE",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center; font-size: 24px;">Khôi phục mật khẩu</h2>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; text-align: center;">
          Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản MKHE liên kết với email này.
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; text-align: center;">
          Vui lòng nhập mã OTP gồm 6 chữ số bên dưới để tiến hành tạo mật khẩu mới:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #e5dcd3; color: #333; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </span>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px; border-top: 1px solid #e5dcd3; padding-top: 20px;">
          Mã này sẽ hết hạn sau <strong>15 phút</strong>.<br>
          Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email Reset OTP đã được gửi tới: ${toEmail}`);
  } catch (error) {
    console.error("Lỗi khi gửi email reset password:", error);
    throw new Error("Không thể gửi email khôi phục mật khẩu");
  }
};
