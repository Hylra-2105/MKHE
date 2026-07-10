import Order from "./order.model.js";
import Product from "../products/product.model.js";
import Cart from "../cart/cart.model.js";
import UserVoucher from "../vouchers/userVoucher.model.js";
import Voucher from "../vouchers/voucher.model.js";
import OTP from "../auth/otp.model.js";
import Notification from "../notifications/notification.model.js";
import Return from "../returns/return.model.js";
import { getIO } from "../../config/socket.js";
import mongoose from "mongoose";
import { errorResponse, successResponse } from "../../utils/response.js";
import { sendCheckoutOtpEmail, sendInvoiceEmail, sendOrderStatusEmail } from "../../utils/email.js";
import { createVietnameseRegex } from "../../utils/helpers.js";

const generateOrderCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "MKHE-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const sendCheckoutOtp = async (req, res) => {
  try {
    const user = req.user;
    const { paymentMethod } = req.body;

    if (paymentMethod !== "COD") {
      return errorResponse(res, 400, "OTP is only required for COD");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email: user.email, purpose: "CHECKOUT" });
    await OTP.create({ email: user.email, otp, purpose: "CHECKOUT" });

    // Simulate SMS
    console.info(`[SIMULATE SMS] OTP for Checkout (${user.email}): ${otp}`);
    
    const userLang = req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || user.language || "vi";
    
    try {
      await sendCheckoutOtpEmail(user.email, otp, userLang);
    } catch (err) {
      console.error("Failed to send checkout OTP email:", err);
      // Nếu gửi email thất bại, báo lỗi luôn để người dùng biết
      return errorResponse(res, 500, "FAILED_TO_SEND_EMAIL");
    }

    return successResponse(res, 200, "OTP_SENT", { simulatedOtp: otp });
  } catch (error) {
    console.error("Error in sendCheckoutOtp:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const checkout = async (req, res) => {
  try {
    const user = req.user;
    const { shippingInfo, items, paymentMethod, otp, voucherId, isTrustedDevice, note } = req.body;

    // 1. Verify OTP
    if (paymentMethod === "COD" && !isTrustedDevice) {
      if (!otp) throw new Error("OTP_REQUIRED");
      const validOtp = await OTP.findOne({ email: user.email, otp, purpose: "CHECKOUT" });
      if (!validOtp) throw new Error("INVALID_OTP");
      await OTP.deleteOne({ _id: validOtp._id });
    }

    // 2. Check stock & calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    const lowStockAlerts = []; // To trigger after order is successfully created

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`INSUFFICIENT_STOCK:${product.name}`);

      subtotal += product.price * item.quantity;
      
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        quantity: item.quantity,
      });

      const oldStock = product.stock;
      product.stock -= item.quantity;
      
      if (product.stock <= 10 && !product.lowStockAlerted) {
        lowStockAlerts.push({
          productName: product.name,
          productId: product._id,
          currentStock: product.stock
        });
        product.lowStockAlerted = true;
      }

      await product.save();
    }

    // 3. Voucher & Total
    let shippingFee = 0; 
    let discountAmount = 0;
    let appliedVoucherCode = null;

    if (voucherId) {
      const userVoucher = await UserVoucher.findOne({ 
        voucher: voucherId, 
        user: user._id, 
        status: "AVAILABLE" 
      }).populate("voucher");
      
      if (!userVoucher) {
        throw new Error("VOUCHER_NOT_ELIGIBLE_OR_USED");
      }

      const v = userVoucher.voucher;
      appliedVoucherCode = v.code;
        
        if (v.type === "FIXED_AMOUNT") {
          discountAmount = v.discountValue;
        } else if (v.type === "PERCENTAGE") {
          let calculated = (subtotal * v.discountValue) / 100;
          if (v.maxDiscount) calculated = Math.min(calculated, v.maxDiscount);
          discountAmount = calculated;
        }

        userVoucher.status = "USED";
        userVoucher.usedAt = new Date();
        await userVoucher.save();

        // Increment usedCount on Voucher model
        await Voucher.findByIdAndUpdate(v._id, { $inc: { usedCount: 1 } });
    }

    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    // Calculate cancelRate for Anti-Fraud
    const totalUserOrders = await Order.countDocuments({ user: user._id });
    const canceledUserOrders = await Order.countDocuments({ user: user._id, orderStatus: "CANCELLED" });
    const cancelRate = totalUserOrders >= 3 ? (canceledUserOrders / totalUserOrders) * 100 : 0;
    
    const isHighValue = totalAmount >= (parseInt(process.env.HIGH_RISK_THRESHOLD) || 5000000);
    const isHighRiskUser = cancelRate > 50;
    const isHighRisk = isHighValue || isHighRiskUser;

    // 4. Create Order
    let orderCode = generateOrderCode();
    while (await Order.findOne({ orderCode })) {
      orderCode = generateOrderCode();
    }

    const payosOrderCode = Number(String(Date.now()).slice(-9) + Math.floor(Math.random() * 1000));

    const newOrder = await Order.create([{
      orderCode,
      payosOrderCode,
      user: user._id,
      shippingInfo,
      items: orderItems,
      paymentMethod,
      paymentStatus: "UNPAID",
      orderStatus: "PENDING",
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      voucherCode: appliedVoucherCode,
      requireCallConfirm: isHighValue,
      isHighRisk: isHighRisk,
      note: note,
    }]);

    // 5. Remove cart items
    const cart = await Cart.findOne({ user: user._id });
    if (cart) {
      const checkedOutProductIds = items.map(i => i.productId.toString());
      cart.items = cart.items.filter(i => !checkedOutProductIds.includes(i.product.toString()));
      await cart.save();
    }

    // 6. Send Email
    if (paymentMethod === "COD") {
      const userLang = req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || user.language || "vi";
      sendInvoiceEmail(user.email, newOrder[0], userLang).catch((err) => {
        console.error("Failed to send invoice email:", err);
      });
    }

    // 7. Create Notification for Checkout
    try {
      const notif = await Notification.create({
        user: user._id,
        title: "ORDER_PLACED",
        message: `ORDER_PLACED_MESSAGE::${orderCode}`,
        type: "ORDER_STATUS_UPDATE",
        orderId: newOrder[0]._id,
        status: "PENDING",
      });
      const io = getIO();
      io.to(`user_${user._id}`).emit("new_notification", notif);
      io.emit("admin_order_updated");
      io.to(`user_${user._id}`).emit("user_order_updated", newOrder[0]);

      // Admin Notifications
      if (paymentMethod === "COD") {
        const adminNotif = await Notification.create({
          isAdmin: true,
          title: "ADMIN_ORDER_NEW",
          message: `ADMIN_ORDER_NEW::${orderCode}`,
          type: "SYSTEM",
          link: `/admin/orders`,
          orderId: newOrder[0]._id
        });
        io.to("admin_room").emit("new_admin_notification", adminNotif);
      }

      for (const alert of lowStockAlerts) {
        const stockNotif = await Notification.create({
          isAdmin: true,
          title: "ADMIN_STOCK_ALERT",
          message: `ADMIN_STOCK_ALERT::${alert.productName}::${alert.currentStock}`,
          type: "SYSTEM",
          link: `/admin/products`,
          productId: alert.productId
        });
        io.to("admin_room").emit("new_admin_notification", stockNotif);
      }

    } catch (err) {
      console.error("Failed to create checkout notification:", err);
    }

    let payosData = null;
    if (paymentMethod === "BANK_TRANSFER" && process.env.PAYOS_CLIENT_ID) {
      try {
        const { PayOS } = await import("@payos/node");
        const payos = new PayOS({
          clientId: process.env.PAYOS_CLIENT_ID,
          apiKey: process.env.PAYOS_API_KEY,
          checksumKey: process.env.PAYOS_CHECKSUM_KEY
        });
        const domain = process.env.FRONTEND_URL || "https://mkhe.netlify.app";
        const body = {
          orderCode: payosOrderCode,
          amount: totalAmount,
          description: `Thanh toan don ${orderCode}`,
          returnUrl: `${domain}/checkout/success?status=PAID`,
          cancelUrl: `${domain}/checkout/success?cancel=true`,
        };
        const paymentLinkResponse = await payos.paymentRequests.create(body);
        payosData = paymentLinkResponse;
      } catch (err) {
        console.error("PayOS Create Payment Link Error:", err);
      }
    }

    return successResponse(res, 201, "ORDER_CREATED", payosData ? { order: newOrder[0], payosData } : newOrder[0]);

  } catch (error) {
    console.error("Checkout Error:", error);
    
    if (error.message.startsWith("INSUFFICIENT_STOCK")) return errorResponse(res, 400, error.message);
    if (error.message === "INVALID_OTP") return errorResponse(res, 400, "INVALID_OTP");
    if (error.message === "OTP_REQUIRED") return errorResponse(res, 400, "OTP_REQUIRED");
    if (error.message === "VOUCHER_NOT_ELIGIBLE_OR_USED") return errorResponse(res, 400, "VOUCHER_NOT_ELIGIBLE_OR_USED");
    
    return errorResponse(res, 500, "SERVER_ERROR", error.message);
  }
};

export const getMyOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ user: req.user._id });
    const canceledOrders = await Order.countDocuments({ user: req.user._id, orderStatus: "CANCELLED" });
    const cancelRate = totalOrders >= 3 ? (canceledOrders / totalOrders) : 0;
    
    return successResponse(res, 200, "OK", {
      totalOrders,
      canceledOrders,
      cancelRate
    });
  } catch (error) {
    console.error("getMyOrderStats Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// GET /api/orders/me
export const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const paymentStatus = req.query.paymentStatus;

    const query = { user: req.user._id };
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    return successResponse(res, 200, "OK", {
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getMyOrders Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// GET /api/orders/me/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id }).populate("items.product").lean();
    
    if (!order) {
      return errorResponse(res, 404, "ORDER_NOT_FOUND");
    }

    const returns = await Return.find({ order: id });
    const returnedItemsMap = {};

    for (const ret of returns) {
      for (const retItem of ret.items) {
        const pId = retItem.product.toString();
        if (!returnedItemsMap[pId]) returnedItemsMap[pId] = 0;
        returnedItemsMap[pId] += retItem.quantity;
      }
    }

    order.items = order.items.map(item => {
      const pId = item.product?._id ? item.product._id.toString() : item.product.toString();
      const returnedQuantity = returnedItemsMap[pId] || 0;
      return {
        ...item,
        returnedQuantity,
        remainReturnQuantity: Math.max(0, item.quantity - returnedQuantity)
      };
    });

    return successResponse(res, 200, "OK", order);
  } catch (error) {
    console.error("getOrderById Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// PUT /api/orders/me/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return errorResponse(res, 404, "ORDER_NOT_FOUND");
    }

    if (order.orderStatus !== "PENDING") {
      return errorResponse(res, 400, "CANNOT_CANCEL_ORDER");
    }

    order.orderStatus = "CANCELLED";
    await order.save();

    // ROLLBACK STOCK
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        if (product.status === "OUT_OF_STOCK") product.status = "PUBLISHED";
        await product.save();
      }
    }

    const io = getIO();
    io.emit("admin_order_updated");
    io.to(`user_${req.user._id}`).emit("user_order_updated", order);
    return successResponse(res, 200, "ORDER_CANCELLED", order);
  } catch (error) {
    console.error("cancelOrder Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// PUT /api/orders/me/:id/receive
export const receiveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user.id });

    if (!order) {
      return errorResponse(res, 404, "ORDER_NOT_FOUND");
    }

    if (order.orderStatus !== "DELIVERING") {
      return errorResponse(res, 400, "CANNOT_RECEIVE_ORDER_NOT_DELIVERING");
    }

    const previousPaymentStatus = order.paymentStatus;
    
    order.orderStatus = "COMPLETED";
    order.paymentStatus = "PAID";
    
    await order.save();

    const io = getIO();
    io.emit("admin_order_updated");
    io.to(`user_${req.user._id}`).emit("user_order_updated", order);

    // Increment sold count if it just became PAID (for COD orders)
    if (previousPaymentStatus !== "PAID") {
      const Product = mongoose.model("Product");
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { sold: item.quantity } });
      }
    }

    try {
      const adminNotif = await Notification.create({
        isAdmin: true,
        title: "ADMIN_ORDER_COMPLETED",
        message: `ADMIN_ORDER_COMPLETED::${order.orderCode}`,
        type: "SYSTEM",
        link: `/admin/orders`,
        orderId: order._id
      });
      io.to("admin_room").emit("new_admin_notification", adminNotif);
    } catch (err) {
      console.error("Failed to create admin notification for receiveOrder:", err);
    }

    return successResponse(res, 200, "ORDER_RECEIVED", order);
  } catch (error) {
    console.error("receiveOrder Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// GET /api/orders/admin
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const statusFilter = req.query.status || "";
    const search = req.query.search || "";
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";
    const highRisk = req.query.highRisk || "";
    
    const skip = (page - 1) * limit;

    let query = {};
    if (statusFilter) query.orderStatus = statusFilter;
    
    const paymentStatus = req.query.paymentStatus || "";
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    if (highRisk === "true") query.isHighRisk = true;

    if (search) {
      const searchRegex = createVietnameseRegex(search);
      query.$or = [
        { orderCode: { $regex: searchRegex, $options: "i" } },
        { "shippingInfo.name": { $regex: searchRegex, $options: "i" } },
        { "shippingInfo.phone": { $regex: searchRegex, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email phone avatar isBlocked role bio addresses")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // We still compute cancelRate to attach to the response so frontend can show the exact % if needed
    const ordersWithCancelRate = await Promise.all(orders.map(async (order) => {
      const orderObj = order.toObject();
      if (orderObj.user) {
        const totalUserOrders = await Order.countDocuments({ user: orderObj.user._id });
        const canceledUserOrders = await Order.countDocuments({ user: orderObj.user._id, orderStatus: "CANCELLED" });
        orderObj.user.cancelRate = totalUserOrders >= 3 ? Math.round((canceledUserOrders / totalUserOrders) * 100) : 0;
      }
      return orderObj;
    }));

    return successResponse(res, 200, "OK", {
      data: ordersWithCancelRate,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAllOrdersAdmin Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// PUT /api/orders/admin/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const allowedStatuses = ["PENDING", "CONFIRMED", "DELIVERING", "COMPLETED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return errorResponse(res, 400, "INVALID_STATUS");
    }

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 404, "ORDER_NOT_FOUND");
    }

    const previousPaymentStatus = order.paymentStatus;

    if (paymentStatus) {
      const allowedPaymentStatuses = ["UNPAID", "PAID"];
      if (allowedPaymentStatuses.includes(paymentStatus)) {
        order.paymentStatus = paymentStatus;
      }
    }

    // Validation: Block shipping if VietQR is UNPAID
    if (order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "UNPAID") {
      if (["CONFIRMED", "DELIVERING", "COMPLETED"].includes(status)) {
        return errorResponse(res, 400, "VIETQR_UNPAID_CANNOT_SHIP");
      }
    }

    // Validation: COMPLETED status ALWAYS requires PAID
    if (status === "COMPLETED" && order.paymentStatus === "UNPAID") {
      return errorResponse(res, 400, "COMPLETED_MUST_BE_PAID");
    }

    const previousStatus = order.orderStatus;
    
    // Nếu từ trạng thái CANCELLED chuyển về trạng thái khác, ta phải trừ kho lại (check tồn kho trước)
    if (previousStatus === "CANCELLED" && status !== "CANCELLED") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
          return errorResponse(res, 400, `INSUFFICIENT_STOCK:${product?.name || item.product}`);
        }
      }
      // Thực sự trừ kho
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        product.stock -= item.quantity;
        await product.save();
      }
    }

    order.orderStatus = status;
    
    // Nếu chuyển sang CANCELLED và trước đó không phải CANCELLED -> Hoàn kho
    if (status === "CANCELLED" && previousStatus !== "CANCELLED") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          if (product.status === "OUT_OF_STOCK") product.status = "PUBLISHED";
          await product.save();
        }
      }
    }

    await order.save();

    // Adjust sold count based on PAID and CANCELLED states
    const wasCountedAsSold = previousPaymentStatus === "PAID" && previousStatus !== "CANCELLED";
    const willBeCountedAsSold = order.paymentStatus === "PAID" && order.orderStatus !== "CANCELLED";

    if (!wasCountedAsSold && willBeCountedAsSold) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { sold: item.quantity } });
      }
    } else if (wasCountedAsSold && !willBeCountedAsSold) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { sold: -item.quantity } });
      }
    }

    // --- TRIGGER NOTIFICATION FOR PAYMENT SUCCESS ---
    if (order.paymentStatus === "PAID" && previousPaymentStatus !== "PAID") {
      try {
        const notif = await Notification.create({
          user: order.user,
          title: "ORDER_PAYMENT_SUCCESS",
          message: `ORDER_PAYMENT_SUCCESS_MESSAGE::${order.orderCode}`,
          type: "ORDER_STATUS_UPDATE",
          orderId: order._id,
          status: order.orderStatus,
        });
        const io = getIO();
        io.to(`user_${order.user}`).emit("new_notification", notif);

        const userForEmail = await mongoose.model("User").findById(order.user);
        if (userForEmail && userForEmail.email) {
          sendInvoiceEmail(userForEmail.email, order, "vi").catch(err => {
             console.error("Failed to send payment invoice email:", err);
          });
        }
      } catch (err) {
        console.error("Failed to handle payment success notification:", err);
      }
    }

    // --- TRIGGER NOTIFICATION ---
    if (order.user && status !== previousStatus) {
      let title = "";
      let message = "";
      
      switch (status) {
        case "CONFIRMED":
          title = "ORDER_CONFIRMED";
          message = `ORDER_CONFIRMED_MESSAGE::${order.orderCode}`;
          break;
        case "DELIVERING":
          title = "ORDER_DELIVERING";
          message = `ORDER_DELIVERING_MESSAGE::${order.orderCode}`;
          break;
        case "COMPLETED":
          title = "ORDER_COMPLETED";
          message = `ORDER_COMPLETED_MESSAGE::${order.orderCode}`;
          break;
        case "CANCELLED":
          title = "ORDER_CANCELLED";
          message = `ORDER_CANCELLED_MESSAGE::${order.orderCode}`;
          break;
      }

      if (title) {
        const notif = await Notification.create({
          user: order.user,
          title,
          message,
          type: "ORDER_STATUS_UPDATE",
          orderId: order._id,
          status,
        });

        try {
          const io = getIO();
          io.to(`user_${order.user}`).emit("new_notification", notif);
        } catch (err) {
          console.error("Socket emit error:", err);
        }
        
        // --- SEND EMAIL (Only for DELIVERING or CANCELLED) ---
        if (status === "DELIVERING" || status === "CANCELLED") {
          try {
            // Lấy user email
            const userForEmail = await mongoose.model("User").findById(order.user);
            if (userForEmail && userForEmail.email) {
              sendOrderStatusEmail(userForEmail.email, order, status).catch(err => {
                 console.error("Failed to send status email:", err);
              });
            }
          } catch (err) {
            console.error("Error sending status email:", err);
          }
        }
      }
    }

    const ioMain = getIO();
    ioMain.emit("admin_order_updated");
    ioMain.to(`user_${order.user}`).emit("user_order_updated", order);

    return successResponse(res, 200, "ORDER_STATUS_UPDATED", order);
  } catch (error) {
    console.error("updateOrderStatus Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// Webhook từ PayOS
export const payosWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    if (!process.env.PAYOS_CLIENT_ID) {
      return res.json({ success: true });
    }

    const m = await import("@payos/node");
    const PayOS = m.default.PayOS;
    const payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY
    });

    const data = await payos.webhooks.verify(webhookData);

    // code "00" nghĩa là thanh toán thành công
    if (webhookData.code === "00") {
      const order = await Order.findOne({ payosOrderCode: data.orderCode });
      if (order && order.paymentStatus !== "PAID") {
        order.paymentStatus = "PAID";
        await order.save();
        
        // Increment sold count
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { sold: item.quantity } });
        }

        // Admin Notification
        try {
          const adminNotif = await Notification.create({
            isAdmin: true,
            title: "ADMIN_ORDER_PAID",
            message: `ADMIN_ORDER_PAID::${order.orderCode}`,
            type: "SYSTEM",
            link: `/admin/orders`,
            orderId: order._id
          });
          const io = getIO();
          io.to("admin_room").emit("new_admin_notification", adminNotif);
        } catch (err) {
          console.error("Failed to create webhook admin notification:", err);
        }

        // User Notification & Socket Event
        try {
          const userNotif = await Notification.create({
            user: order.user,
            title: "ORDER_PAYMENT_SUCCESS",
            message: `ORDER_PAYMENT_SUCCESS_MESSAGE::${order.orderCode}`,
            type: "ORDER_STATUS_UPDATE",
            orderId: order._id,
            orderCode: order.orderCode,
            link: `/profile?tab=orders`
          });
          const io = getIO();
          io.to(`user_${order.user}`).emit("new_notification", userNotif);
          io.to(`user_${order.user}`).emit("order_payment_status_updated", {
            orderId: order._id,
            orderCode: order.orderCode,
            paymentStatus: "PAID"
          });
          
          // Gửi email hóa đơn
          const userForEmail = await User.findById(order.user);
          if (userForEmail) {
            try {
              const userLang = userForEmail.language || "vi";
              await sendInvoiceEmail(userForEmail.email, order, userLang);
            } catch (err) {
              console.error("Failed to send invoice email in webhook:", err.message);
            }
          }
        } catch (err) {
          console.error("Failed to create webhook user notification:", err);
        }
      }
    }

    return res.json({
      success: true,
      message: "Ok",
    });
  } catch (error) {
    console.error("PayOS Webhook Error:", error);
    return res.status(400).json({
      success: false,
      message: "WEBHOOK_ERROR",
    });
  }
};
