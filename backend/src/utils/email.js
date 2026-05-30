import { getTransporter } from "../config/nodemailer.js";
import { loadTranslation, getTranslation } from "../config/i18n.js";

// Hàm gửi email chung (giúp tránh lặp lại code)
const sendEmail = async (mailOptions) => {
  try {
    const transporter = getTransporter();
    const result = await transporter.sendMail(mailOptions);
    console.log(
      `✓ Email đã được gửi tới: ${mailOptions.to} (MessageID: ${result.messageId})`,
    );
    return result;
  } catch (error) {
    console.error("✗ Lỗi chi tiết khi gửi email:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
      errorMessage: error.message,
      errorCode: error.code,
      stack: error.stack,
    });
    throw error;
  }
};

// Helper function để format thời gian
const getFormattedTime = (lang = "vi") => {
  const options = {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date().toLocaleString(lang === "en" ? "en-US" : "vi-VN", options);
};

/**
 * Gửi mã OTP xác thực
 * @param {string} toEmail - Email người nhận
 * @param {string} otp - Mã OTP
 * @param {string} lang - Ngôn ngữ (en, vi). Default: vi
 */
export const sendVerificationEmail = async (toEmail, otp, lang = "vi") => {
  const trans = loadTranslation(lang, "email");
  const verTrans = trans.verification || {};

  const mailOptions = {
    from: `"MKHE Heritage" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: getTranslation(trans, "verification.subject"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center; font-size: 24px;">${getTranslation(trans, "verification.greeting")}</h2>
        <p style="text-align: center;">${getTranslation(trans, "verification.instruction")}</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #e5dcd3; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #e5dcd3; padding-top: 20px;">
          ${getTranslation(trans, "verification.footer", { time: getFormattedTime(lang) })}
        </p>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};

/**
 * Gửi email reset password
 * @param {string} toEmail - Email người nhận
 * @param {string} otp - Mã reset OTP
 * @param {string} lang - Ngôn ngữ (en, vi). Default: vi
 */
export const sendPasswordResetEmail = async (toEmail, otp, lang = "vi") => {
  const trans = loadTranslation(lang, "email");

  const mailOptions = {
    from: `"MKHE Heritage" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: getTranslation(trans, "resetPassword.subject"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center; font-size: 24px;">${getTranslation(trans, "resetPassword.greeting")}</h2>
        <p style="text-align: center;">${getTranslation(trans, "resetPassword.instruction")}</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #e5dcd3; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #e5dcd3; padding-top: 20px;">
          ${getTranslation(trans, "resetPassword.footer", { time: getFormattedTime(lang) })}
        </p>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};

/**
 * Gửi email thông báo khóa tài khoản
 * @param {string} toEmail - Email người nhận
 * @param {string} reason - Lý do khóa (code)
 * @param {string} lang - Ngôn ngữ (en, vi). Default: vi
 */
export const sendBlockAccountEmail = async (toEmail, reason, lang = "vi") => {
  const trans = loadTranslation(lang, "email");

  // Get translated reason text
  const reasonText =
    getTranslation(trans, `blockAccount.reasons.${reason}`) || reason;

  const mailOptions = {
    from: `"MKHE Heritage Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: getTranslation(trans, "blockAccount.subject"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #d97706; text-align: center;">${getTranslation(trans, "blockAccount.greeting")}</h2>
        <p style="font-size: 16px; line-height: 1.6;">${getTranslation(trans, "blockAccount.accountLocked")}</p>
        <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong style="font-size: 16px; color: #b45309;">${reasonText}</strong>
        </div>
        <p style="font-size: 14px; line-height: 1.6;">${getTranslation(trans, "blockAccount.support")}</p>
        <p style="color: #999; font-size: 12px; border-top: 1px solid #e5dcd3; padding-top: 20px; margin-top: 30px;">
          ${getTranslation(trans, "blockAccount.footer", { time: getFormattedTime(lang) })}
        </p>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};


/**
 * Gửi email xác thực khi người dùng CHỦ ĐỘNG đổi mật khẩu trong Profile
 * @param {string} toEmail - Email người nhận
 * @param {string} otp - Mã xác thực OTP
 * @param {string} lang - Ngôn ngữ (en, vi). Default: vi
 */
export const sendChangePasswordEmail = async (toEmail, otp, lang = "vi") => {
  const trans = loadTranslation(lang, "email");

  const mailOptions = {
    from: `"MKHE Heritage" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: getTranslation(trans, "changePassword.subject"), // <--- Móc đúng vào block changePassword
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center; font-size: 24px;">${getTranslation(trans, "changePassword.greeting")}</h2>
        <p style="text-align: center;">${getTranslation(trans, "changePassword.instruction")}</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #e5dcd3; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #e5dcd3; padding-top: 20px;">
          ${getTranslation(trans, "changePassword.footer", { time: getFormattedTime(lang) })}
        </p>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};