import nodemailer from "nodemailer";

// Khởi tạo trạm bưu điện SMTP trung chuyển
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm gửi email xác thực tài khoản (AUTH-01)
export const sendVerificationEmail = async (toEmail, verificationToken) => {
  // Đường link kích hoạt tài khoản dẫn về Backend để xử lý kích hoạt
  const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"MKHE Heritage" <${process.env.EMAIL_USER}>`, // Tên hiển thị cực sang trọng
    to: toEmail,
    subject: "Xác thực tài khoản của bạn tại MKHE!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center; font-size: 24px;">Chào mừng bạn đến với MKHE</h2>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          Cảm ơn bạn đã đăng ký tài khoản. Nơi tinh hoa di sản hội tụ rất vinh hạnh được đồng hành cùng bạn. 
          Để hoàn tất quá trình đăng ký, vui lòng kích hoạt tài khoản bằng cách bấm vào nút bên dưới:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #bc9c6a; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 16px; display: inline-block;">
            Xác Thực Tài Khoản
          </a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.<br>
          Đây là email tự động, vui lòng không trả lời.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email xác thực đã được gửi tới: ${toEmail}`);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    throw new Error("Không thể gửi email xác thực");
  }
};
