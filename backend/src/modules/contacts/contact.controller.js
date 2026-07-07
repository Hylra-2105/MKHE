import Contact from "./contact.model.js";
import Notification from "../notifications/notification.model.js";
import { getIO } from "../../config/socket.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { sendContactConfirmationEmail, sendAdminContactNotificationEmail } from "../../utils/email.js";
import { createVietnameseRegex } from "../../utils/helpers.js";

// POST /api/contacts
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, companyName, taxCode, interest, message } = req.body;

    // Basic validation
    if (!name || !email || !phone || !interest) {
      return errorResponse(res, 400, "MISSING_REQUIRED_FIELDS");
    }

    // AC1: Bắt buộc có trường "Tên Công ty/Mã số thuế" nếu khách muốn đăng ký B2B
    if (interest === "b2b" && (!companyName || !taxCode)) {
      return errorResponse(res, 400, "COMPANY_REQUIRED_FOR_B2B");
    }

    // Create contact
    const newContact = await Contact.create({
      name,
      email,
      phone,
      companyName,
      taxCode,
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
      const interestViMap = {
        "support": "Hỗ trợ đơn hàng & Sản phẩm (Dành cho Khách cá nhân)",
        "b2b": "Yêu cầu mở Tài khoản Doanh nghiệp (B2B Portal)",
        "vip": "Tư vấn giải pháp Quà tặng Doanh nghiệp VIP",
        "design": "Tư vấn thiết kế Không gian & Đồng phục (Resort/Khách sạn)",
        "boardgame": "Tìm hiểu / Hợp tác mảng Board Game \"Giao lộ Di sản\"",
        "other": "Yêu cầu khác / Góp ý"
      };
      const interestDisplay = interestViMap[interest] || interest;

      const adminNotification = await Notification.create({
        isAdmin: true,
        title: "ADMIN_CONTACT_NEW",
        message: `ADMIN_CONTACT_NEW_MESSAGE::${name}::${interest}`,
        type: "CONTACT",
        contactId: newContact._id,
        link: "/admin/contacts", 
      });

      // Socket.io emit to admin room
      const io = getIO();
      if (io) {
        io.to("admin_room").emit("new_admin_notification", adminNotification);
        io.to("admin_room").emit("admin_contact_updated");
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

// GET /api/contacts (Admin only)
export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, interest, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (interest) {
      filter.interest = interest;
    }
    if (search) {
      const searchRegex = createVietnameseRegex(search);
      filter.$or = [
        { name: { $regex: searchRegex, $options: "i" } },
        { email: { $regex: searchRegex, $options: "i" } },
      ];
    }

    const total = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return successResponse(res, 200, "CONTACTS_FETCHED_SUCCESSFULLY", {
      contacts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getAllContacts Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// GET /api/contacts/:id (Admin only)
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return errorResponse(res, 404, "CONTACT_NOT_FOUND");
    }
    return successResponse(res, 200, "CONTACT_FETCHED_SUCCESSFULLY", contact);
  } catch (error) {
    console.error("getContactById Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// PUT /api/contacts/:id/status (Admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["PENDING", "CONTACTED", "RESOLVED"].includes(status)) {
      return errorResponse(res, 400, "INVALID_STATUS");
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return errorResponse(res, 404, "CONTACT_NOT_FOUND");
    }

    const io = getIO();
    if (io) {
      io.to("admin_room").emit("admin_contact_updated");
    }

    return successResponse(res, 200, "CONTACT_STATUS_UPDATED", contact);
  } catch (error) {
    console.error("updateContactStatus Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// DELETE /api/contacts/:id (Admin only)
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return errorResponse(res, 404, "CONTACT_NOT_FOUND");
    }

    const io = getIO();
    if (io) {
      io.to("admin_room").emit("admin_contact_updated");
    }

    return successResponse(res, 200, "CONTACT_DELETED_SUCCESSFULLY");
  } catch (error) {
    console.error("deleteContact Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
