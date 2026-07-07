import Contact from "./contact.model.js";
import Notification from "../notifications/notification.model.js";
import { getIO } from "../../config/socket.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { sendContactConfirmationEmail, sendAdminContactNotificationEmail } from "../../utils/email.js";

// POST /api/contacts
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, company, interest, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !interest || !message) {
      return errorResponse(res, 400, "MISSING_REQUIRED_FIELDS");
    }

    // AC1: Bắt buộc có trường "Tên Công ty/Mã số thuế" nếu khách muốn đăng ký B2B
    if (interest === "Yêu cầu mở Tài khoản Doanh nghiệp (B2B Portal)" && !company) {
      return errorResponse(res, 400, "COMPANY_REQUIRED_FOR_B2B");
    }

    // Create contact
    const newContact = await Contact.create({
      name,
      email,
      phone,
      company,
      interest,
      message,
    });

    // Send Emails async (fire and forget)
    // Send confirmation to guest
    sendContactConfirmationEmail(email, name).catch((err) => {
      console.error("[Email Error] sendContactConfirmationEmail failed:", err.message);
    });

    // Send notification to Admin (fallback to EMAIL_USER if ADMIN_EMAIL is not set)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (adminEmail) {
      sendAdminContactNotificationEmail(adminEmail, newContact).catch((err) => {
        console.error("[Email Error] sendAdminContactNotificationEmail failed:", err.message);
      });
    }

    // Create in-app notification for Admin
    try {
      const adminNotification = await Notification.create({
        isAdmin: true,
        title: "Yêu cầu liên hệ mới",
        message: `Khách hàng ${name} đã gửi một yêu cầu: ${interest}`,
        type: "CONTACT",
        link: "/admin/contacts", // Assuming there will be an admin page for contacts
      });

      // Socket.io emit to admin room
      const io = getIO();
      if (io) {
        io.to("admin_room").emit("new_admin_notification", adminNotification);
      }
    } catch (notifErr) {
      console.error("[Notification Error] Failed to create admin notification:", notifErr.message);
    }

    return successResponse(res, 201, "CONTACT_CREATED_SUCCESSFULLY", newContact);
  } catch (error) {
    console.error("createContact Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
