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
