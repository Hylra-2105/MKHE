import nodemailer from "nodemailer";
import { Buffer } from "buffer";
import { getGmailClient } from "../config/nodemailer.js";
import { loadTranslation, getTranslation } from "../config/i18n.js";

// Hàm gửi email chung qua Gmail HTTP API (bypass chặn port SMTP)
const sendEmail = async (mailOptions) => {
  try {
    // 1. Build raw email message (MIME) bằng Nodemailer
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "windows",
    });
    const info = await transporter.sendMail(mailOptions);
    
    // Gom các stream chunk lại thành 1 cục
    const chunks = [];
    for await (let chunk of info.message) {
      chunks.push(chunk);
    }
    const messageBuffer = Buffer.concat(chunks);
    
    // Đổi sang base64 url-safe (Chuẩn của Google)
    const rawMessage = messageBuffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 2. Lấy client Gmail và gửi qua giao thức HTTP
    const gmail = getGmailClient();
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });

    console.info(
      `✓ Email đã được gửi tới: ${mailOptions.to} (MessageID: ${result.data.id})`,
    );
    return result.data;
  } catch (error) {
    console.error("✗ Lỗi chi tiết khi gửi email (Gmail API):", {
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
  return new Date().toLocaleString(lang === "vi" ? "vi-VN" : "en-US", options);
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

/**
 * Gửi email chứa OTP để xác nhận đặt hàng (Checkout)
 */
export const sendCheckoutOtpEmail = async (toEmail, otp, lang = "vi") => {
  const trans = loadTranslation(lang, "email");

  const mailOptions = {
    from: `"MKHE Heritage" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: getTranslation(trans, "checkoutOtp.subject"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center; font-size: 24px;">${getTranslation(trans, "checkoutOtp.greeting")}</h2>
        <p style="text-align: center;">${getTranslation(trans, "checkoutOtp.instruction")}</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #e5dcd3; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</span>
        </div>
        <p style="text-align: center; color: #d97706; font-size: 14px;">${getTranslation(trans, "checkoutOtp.ignored")}</p>
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #e5dcd3; padding-top: 20px;">
          ${getTranslation(trans, "checkoutOtp.footer", { time: getFormattedTime(lang) })}
        </p>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};

/**
 * Gửi email hóa đơn sau khi đặt hàng thành công
 */
export const sendInvoiceEmail = async (toEmail, order, lang = "vi") => {
  const trans = loadTranslation(lang, "email");
  const isPaid = order.paymentStatus === "PAID";
  const subjectStr = isPaid 
    ? "Biên lai thanh toán & Xác nhận đơn hàng #{orderCode}" 
    : (getTranslation(trans, "invoice.subject") || "Xác nhận đơn hàng #{orderCode}");
  const subject = subjectStr.replace("{orderCode}", order.orderCode);
  
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          ${item.image ? `<img src="${item.image.startsWith('http') ? item.image : ((process.env.FRONTEND_URL || 'https://mkhe.netlify.app') + (item.image.startsWith('/') ? '' : '/') + item.image)}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px; border: 1px solid #eee;" />` : ''}
          <span style="font-weight: 500;">${item.name}</span>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatMoney(item.price)}</td>
    </tr>
  `).join("");

  const mailOptions = {
    from: `"MKHE Heritage" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fff; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #f8f6f3; padding: 30px 20px; text-align: center; border-bottom: 3px solid #bc9c6a;">
          <h1 style="color: #bc9c6a; margin: 0; font-size: 28px; font-family: Georgia, serif;">MKHE Heritage</h1>
          <p style="margin-top: 10px; color: #666;">${getTranslation(trans, "invoice.greeting")}</p>
          ${isPaid ? `<div style="display: inline-block; margin-top: 15px; background-color: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px;">ĐÃ THANH TOÁN</div>` : ''}
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <p style="color: #333; font-size: 16px;">
            ${isPaid ? `Cảm ơn bạn đã thanh toán thành công cho đơn hàng <strong>${order.orderCode}</strong>. Dưới đây là chi tiết biên lai của bạn:` : getTranslation(trans, "invoice.intro")}
          </p>
          
          <!-- Order Info -->
          <div style="background-color: #fafafa; border: 1px solid #eee; border-radius: 6px; padding: 20px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; color: #666; width: 40%;">${getTranslation(trans, "invoice.orderCode")}:</td>
                <td style="padding: 5px 0; font-weight: bold; color: #bc9c6a;">${order.orderCode}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">${getTranslation(trans, "invoice.paymentMethod")}:</td>
                <td style="padding: 5px 0; font-weight: bold;">${order.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">${getTranslation(trans, "invoice.shippingInfo")}:</td>
                <td style="padding: 5px 0;">
                  <strong>${order.shippingInfo.name}</strong><br/>
                  ${order.shippingInfo.phone}<br/>
                  ${order.shippingInfo.address}
                </td>
              </tr>
            </table>
          </div>

          <!-- Items -->
          <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">${getTranslation(trans, "invoice.items")}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9f9f9; text-align: left;">
                <th style="padding: 12px; color: #666;">${getTranslation(trans, "invoice.items")}</th>
                <th style="padding: 12px; color: #666; text-align: center;">${getTranslation(trans, "invoice.qty")}</th>
                <th style="padding: 12px; color: #666; text-align: right;">${getTranslation(trans, "invoice.price")}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Summary -->
          <div style="margin-top: 20px; text-align: right; border-top: 1px solid #eee; padding-top: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 12px; color: #666; text-align: right;">${getTranslation(trans, "invoice.subtotal")}:</td>
                <td style="padding: 5px 12px; text-align: right; width: 120px;">${formatMoney(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 12px; color: #666; text-align: right;">${getTranslation(trans, "invoice.shippingFee")}:</td>
                <td style="padding: 5px 12px; text-align: right;">${formatMoney(order.shippingFee)}</td>
              </tr>
              ${order.discountAmount > 0 ? `
              <tr>
                <td style="padding: 5px 12px; color: #10b981; text-align: right;">${getTranslation(trans, "invoice.discountAmount")}:</td>
                <td style="padding: 5px 12px; color: #10b981; text-align: right;">-${formatMoney(order.discountAmount)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 15px 12px 5px; color: #333; text-align: right; font-weight: bold; font-size: 18px; border-top: 1px dashed #ccc;">${getTranslation(trans, "invoice.totalAmount")}:</td>
                <td style="padding: 15px 12px 5px; color: #bc9c6a; text-align: right; font-weight: bold; font-size: 18px; border-top: 1px dashed #ccc;">${formatMoney(order.totalAmount)}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #fcfbfa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 13px; margin: 0;">
            ${getTranslation(trans, "invoice.footer", { time: getFormattedTime(lang) }).replace(/\\n/g, '<br/>')}
          </p>
        </div>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};

/**
 * Gửi email thông báo cập nhật trạng thái đơn hàng
 */
export const sendOrderStatusEmail = async (toEmail, order, status, lang = "vi") => {
  let title;
  let message;
  let color = "#bc9c6a"; // default primary color

  switch (status) {
    case "CONFIRMED":
      title = "Đơn hàng đã được xác nhận";
      message = `Cảm ơn bạn đã đặt hàng! Đơn hàng <strong>${order.orderCode}</strong> của bạn đã được xác nhận và đang được chuẩn bị.`;
      break;
    case "DELIVERING":
      title = "Đơn hàng đang giao";
      message = `Tuyệt vời! Đơn hàng <strong>${order.orderCode}</strong> của bạn đã được bàn giao cho đơn vị vận chuyển.`;
      color = "#3b82f6"; // blue
      break;
    case "COMPLETED":
      title = "Giao hàng thành công";
      message = `Đơn hàng <strong>${order.orderCode}</strong> đã được giao thành công. Mong rằng bạn hài lòng với sản phẩm của MKHE!`;
      color = "#10b981"; // green
      break;
    case "CANCELLED":
      title = "Đơn hàng đã bị hủy";
      message = `Rất tiếc, đơn hàng <strong>${order.orderCode}</strong> của bạn đã bị hủy. Vui lòng liên hệ với chúng tôi nếu bạn cần hỗ trợ.`;
      color = "#ef4444"; // red
      break;
    default:
      return;
  }

  const mailOptions = {
    from: `"MKHE Heritage" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Cập nhật trạng thái đơn hàng #${order.orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fff; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: ${color}; padding: 30px 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">${title}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px; text-align: center;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">${message}</p>
          <a href="${process.env.FRONTEND_URL || 'https://mkhe.netlify.app'}/profile?tab=orders" style="display: inline-block; margin-top: 20px; background-color: #bc9c6a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Xem chi tiết đơn hàng
          </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #fcfbfa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 13px; margin: 0;">
            Gửi lúc: ${getFormattedTime(lang)}<br/>
            Nếu bạn có thắc mắc, vui lòng liên hệ CSKH.
          </p>
        </div>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};

/**
 * Gửi email cấp tài khoản B2B kèm link tạo mật khẩu (Activation)
 * @param {string} toEmail - Email doanh nghiệp
 * @param {string} activationToken - Token kích hoạt tài khoản
 * @param {string} lang - Ngôn ngữ (en, vi). Default: vi
 */
export const sendB2BActivationEmail = async (toEmail, activationToken, lang = "vi") => {
  const trans = loadTranslation(lang, "email");
  // Nếu có translation b2bActivation thì dùng, không thì tạm fix cứng tiếng Việt
  const subject = getTranslation(trans, "b2bActivation.subject") || "Kích hoạt tài khoản Doanh nghiệp - Cổng B2B MKHE";
  const greeting = getTranslation(trans, "b2bActivation.greeting") || "Chào mừng Quý đối tác,";
  const instruction = getTranslation(trans, "b2bActivation.instruction") || "Tài khoản Doanh nghiệp của bạn trên hệ thống MKHE đã được tạo thành công. Vui lòng click vào nút bên dưới để thiết lập mật khẩu và kích hoạt tài khoản.";
  const buttonText = getTranslation(trans, "b2bActivation.buttonText") || "Truy cập Cổng Doanh Nghiệp MKHE";
  
  // URL dẫn đến trang set-password trên frontend
  const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate-b2b?token=${activationToken}`;

  const mailOptions = {
    from: `"MKHE B2B Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center; font-size: 24px;">${greeting}</h2>
        <p style="text-align: center; color: #333; line-height: 1.6;">${instruction}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationUrl}" style="background-color: #bc9c6a; color: #fff; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block;">
            ${buttonText}
          </a>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #e5dcd3; padding-top: 20px;">
          ${getTranslation(trans, "verification.footer", { time: getFormattedTime(lang) }) || 'Nếu bạn cần hỗ trợ, vui lòng liên hệ CSKH.'}
        </p>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};

/**
 * Gửi email xác nhận đã nhận yêu cầu liên hệ cho khách hàng
 */
export const sendContactConfirmationEmail = async (toEmail, name, lang = "vi") => {
  const trans = loadTranslation(lang, "email");
  const greeting = getTranslation(trans, "contactConfirmation.greeting", { name }) || `Xin chào ${name},`;

  const mailOptions = {
    from: `"MKHE Heritage" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: getTranslation(trans, "contactConfirmation.subject"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center; font-size: 24px;">${greeting}</h2>
        <p style="text-align: center; color: #333; line-height: 1.6;">${getTranslation(trans, "contactConfirmation.instruction")}</p>
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #e5dcd3; padding-top: 20px; margin-top: 30px;">
          ${getTranslation(trans, "contactConfirmation.footer", { time: getFormattedTime(lang) })}
        </p>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};

/**
 * Gửi email thông báo cho Admin về yêu cầu liên hệ mới
 */
export const sendAdminContactNotificationEmail = async (adminEmail, contactData, lang = "vi") => {
  const trans = loadTranslation(lang, "email");
  const subject = getTranslation(trans, "adminContactNotification.subject", { name: contactData.name }) || `Yêu cầu liên hệ mới từ ${contactData.name}`;

  const mailOptions = {
    from: `"MKHE System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #d97706; text-align: center;">${getTranslation(trans, "adminContactNotification.greeting")}</h2>
        <p style="font-size: 16px; line-height: 1.6;">${getTranslation(trans, "adminContactNotification.instruction")}</p>
        
        <div style="background-color: #fff; border: 1px solid #eee; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">${getTranslation(trans, "adminContactNotification.details")}</h3>
          <p><strong>${getTranslation(trans, "adminContactNotification.name")}</strong> ${contactData.name}</p>
          <p><strong>${getTranslation(trans, "adminContactNotification.email")}</strong> ${contactData.email}</p>
          <p><strong>${getTranslation(trans, "adminContactNotification.phone")}</strong> ${contactData.phone}</p>
          ${contactData.company ? `<p><strong>${getTranslation(trans, "adminContactNotification.company")}</strong> ${contactData.company}</p>` : ''}
          <p><strong>${getTranslation(trans, "adminContactNotification.interest")}</strong> ${contactData.interest}</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc;">
            <strong>${getTranslation(trans, "adminContactNotification.message")}</strong>
            <p style="white-space: pre-wrap; background-color: #fafafa; padding: 10px; border-radius: 4px; margin-top: 5px;">${contactData.message}</p>
          </div>
        </div>

        <p style="color: #999; font-size: 12px; border-top: 1px solid #e5dcd3; padding-top: 20px; margin-top: 30px; text-align: center;">
          ${getTranslation(trans, "adminContactNotification.footer", { time: getFormattedTime(lang) })}
        </p>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};

/**
 * Gửi email thông báo tài khoản B2B đã được cấp kèm mật khẩu
 * @param {string} toEmail - Email khách hàng
 * @param {string} name - Tên khách hàng
 * @param {string} password - Mật khẩu ngẫu nhiên
 * @param {string} lang - Ngôn ngữ
 */
export const sendB2BAccountCreatedEmail = async (toEmail, name, password, lang = "vi") => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;
  
  const mailOptions = {
    from: `"MKHE Heritage B2B" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: lang === "vi" ? "Tài khoản Đối tác B2B MKHE của bạn đã được kích hoạt" : "Your MKHE B2B Partner Account has been activated",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 8px; background-color: #fcfbfa;">
        <h2 style="color: #bc9c6a; text-align: center;">${lang === "vi" ? "Chào mừng đối tác B2B" : "Welcome B2B Partner"}</h2>
        <p>Chào ${name},</p>
        <p>${lang === "vi" ? "Tài khoản đối tác B2B của bạn tại Mekong Culture đã được kích hoạt thành công." : "Your B2B partner account at Mekong Culture has been successfully activated."}</p>
        <p>${lang === "vi" ? "Dưới đây là thông tin đăng nhập của bạn:" : "Here is your login information:"}</p>
        
        <div style="background-color: #e5dcd3; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p><strong>Email:</strong> ${toEmail}</p>
          <p><strong>Password:</strong> <span style="font-size: 18px; font-weight: bold; color: #d97706;">${password}</span></p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #bc9c6a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            ${lang === "vi" ? "Đăng nhập ngay" : "Login Now"}
          </a>
        </div>
        
        <p style="color: #d97706; font-size: 14px; text-align: center;">
          <em>* ${lang === "vi" ? "Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu để đảm bảo an toàn." : "Please change your password after your first login for security."}</em>
        </p>

        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #e5dcd3; padding-top: 20px;">
          ${lang === "vi" ? "Trân trọng," : "Best regards,"}<br>Mekong Culture
        </p>
      </div>
    `,
  };
  await sendEmail(mailOptions);
};
