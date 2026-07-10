const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'b2b', 'b2b.controller.js');
let content = fs.readFileSync(filePath, 'utf8');

// Insert imports
if (!content.includes('Notification')) {
  content = content.replace(
    /import B2BOrder from "\.\/b2bOrder\.model\.js";/,
    `import B2BOrder from "./b2bOrder.model.js";\nimport Notification from "../notifications/notification.model.js";\nimport { getIO } from "../../config/socket.js";`
  );
}

// Ensure default status is PENDING_QUOTE for createB2BOrder
// It's already default in the schema but just in case we need to send notifications when order is created?
// If the user didn't ask for create notification, we skip.

// Add new controllers
const newControllers = `
// [GET] /api/b2b/orders/me
export const getMyB2BOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await B2BOrder.find({ user: userId })
      .populate("productOrService", "name sku thumbnail")
      .populate("comments.sender", "firstName lastName avatar role")
      .sort({ createdAt: -1 });
    
    return successResponse(res, 200, "GET_MY_B2B_ORDERS_SUCCESS", orders);
  } catch (error) {
    console.error("Error in getMyB2BOrders:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [GET] /api/b2b/orders
export const getAllB2BOrders = async (req, res) => {
  try {
    const orders = await B2BOrder.find()
      .populate("user", "firstName lastName email")
      .populate("productOrService", "name sku thumbnail")
      .populate("comments.sender", "firstName lastName avatar role")
      .sort({ createdAt: -1 });
    
    return successResponse(res, 200, "GET_ALL_B2B_ORDERS_SUCCESS", orders);
  } catch (error) {
    console.error("Error in getAllB2BOrders:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [PUT] /api/b2b/orders/:id/quote
export const uploadB2BQuote = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file && !req.body.quotePdfUrl) {
      return errorResponse(res, 400, "MISSING_PDF_FILE");
    }
    
    const quotePdfUrl = req.file ? req.file.path : req.body.quotePdfUrl;

    const order = await B2BOrder.findById(id);
    if (!order) return errorResponse(res, 404, "ORDER_NOT_FOUND");

    order.quotePdfUrl = quotePdfUrl;
    if (order.status === "PENDING_QUOTE") {
      order.status = "NEGOTIATING";
    }
    
    await order.save();

    // Create Notification for User
    const notif = await Notification.create({
      user: order.user,
      title: "B2B_QUOTE_UPLOADED",
      message: \`B2B_QUOTE_UPLOADED::\${order._id}\`,
      type: "SYSTEM",
      link: "/profile?tab=b2b_orders"
    });
    
    const io = getIO();
    io.to(\`user_\${order.user}\`).emit("new_notification", notif);
    io.to(\`user_\${order.user}\`).emit("b2b_order_updated", order);

    return successResponse(res, 200, "UPLOAD_QUOTE_SUCCESS", order);
  } catch (error) {
    console.error("Error in uploadB2BQuote:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [PUT] /api/b2b/orders/:id/confirm
export const confirmB2BOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await B2BOrder.findOne({ _id: id, user: userId });
    if (!order) return errorResponse(res, 404, "ORDER_NOT_FOUND");

    if (order.status !== "NEGOTIATING") {
      return errorResponse(res, 400, "INVALID_STATUS_FOR_CONFIRM");
    }

    order.status = "CONFIRMED";
    await order.save();

    // Create Notification for Admin
    const adminNotif = await Notification.create({
      isAdmin: true,
      title: "ADMIN_B2B_ORDER_CONFIRMED",
      message: \`ADMIN_B2B_ORDER_CONFIRMED::\${order._id}\`,
      type: "SYSTEM",
      link: "/admin/b2b-orders"
    });
    
    const io = getIO();
    io.emit("new_admin_notification", adminNotif);
    io.emit("admin_b2b_order_updated", order);

    return successResponse(res, 200, "CONFIRM_B2B_ORDER_SUCCESS", order);
  } catch (error) {
    console.error("Error in confirmB2BOrder:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [PUT] /api/b2b/orders/:id/status
export const updateB2BOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await B2BOrder.findByIdAndUpdate(id, { status }, { new: true })
      .populate("productOrService", "name sku thumbnail")
      .populate("comments.sender", "firstName lastName avatar role");
      
    if (!order) return errorResponse(res, 404, "ORDER_NOT_FOUND");

    const io = getIO();
    io.to(\`user_\${order.user}\`).emit("b2b_order_updated", order);

    return successResponse(res, 200, "UPDATE_STATUS_SUCCESS", order);
  } catch (error) {
    console.error("Error in updateB2BOrderStatus:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// [POST] /api/b2b/orders/:id/comments
export const addB2BOrderComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) return errorResponse(res, 400, "MISSING_COMMENT_TEXT");

    const order = await B2BOrder.findById(id);
    if (!order) return errorResponse(res, 404, "ORDER_NOT_FOUND");

    // Push comment
    order.comments.push({
      sender: userId,
      text
    });
    await order.save();
    
    const updatedOrder = await B2BOrder.findById(id)
      .populate("comments.sender", "firstName lastName avatar role");
    
    const newComment = updatedOrder.comments[updatedOrder.comments.length - 1];

    // Emit event
    const io = getIO();
    io.to(\`user_\${order.user}\`).emit("b2b_new_comment", { orderId: id, comment: newComment });
    io.emit("admin_b2b_new_comment", { orderId: id, comment: newComment });

    return successResponse(res, 200, "ADD_COMMENT_SUCCESS", newComment);
  } catch (error) {
    console.error("Error in addB2BOrderComment:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
`;

if (!content.includes('getMyB2BOrders')) {
  fs.writeFileSync(filePath, content + '\n' + newControllers);
  console.log('Updated b2b.controller.js');
} else {
  console.log('Already updated.');
}
