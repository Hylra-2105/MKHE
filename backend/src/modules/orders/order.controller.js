import Order from "./order.model.js";
import Product from "../products/product.model.js";
import Cart from "../cart/cart.model.js";
import UserVoucher from "../vouchers/userVoucher.model.js";
import OTP from "../auth/otp.model.js";
import mongoose from "mongoose";
import { errorResponse, successResponse } from "../../utils/response.js";
import { sendCheckoutOtpEmail, sendInvoiceEmail } from "../../utils/email.js";

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
    sendCheckoutOtpEmail(user.email, otp, userLang).catch((err) => {
      console.error("Failed to send checkout OTP email:", err);
    });

    return successResponse(res, 200, "OTP_SENT", { simulatedOtp: otp });
  } catch (error) {
    console.error("Error in sendCheckoutOtp:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

export const checkout = async (req, res) => {
  try {
    const user = req.user;
    const { shippingInfo, items, paymentMethod, otp, voucherId, isTrustedDevice } = req.body;

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

      product.stock -= item.quantity;
      await product.save();
    }

    // 3. Voucher & Total
    let shippingFee = 0; 
    let discountAmount = 0;
    let appliedVoucherCode = null;

    if (voucherId) {
      const userVoucher = await UserVoucher.findOne({ 
        _id: voucherId, 
        user: user._id, 
        status: "AVAILABLE" 
      }).populate("voucher");
      
      if (userVoucher) {
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
      }
    }

    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    // 4. Create Order
    let orderCode = generateOrderCode();
    while (await Order.findOne({ orderCode })) {
      orderCode = generateOrderCode();
    }

    const newOrder = await Order.create([{
      orderCode,
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
      requireCallConfirm: totalAmount >= (parseInt(process.env.HIGH_RISK_THRESHOLD) || 5000000),
    }]);

    // 5. Remove cart items
    const cart = await Cart.findOne({ user: user._id });
    if (cart) {
      const checkedOutProductIds = items.map(i => i.productId.toString());
      cart.items = cart.items.filter(i => !checkedOutProductIds.includes(i.product.toString()));
      await cart.save();
    }

    // 6. Send Email
    const userLang = req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || user.language || "vi";
    sendInvoiceEmail(user.email, newOrder[0], userLang).catch((err) => {
      console.error("Failed to send invoice email:", err);
    });

    return successResponse(res, 201, "ORDER_CREATED", newOrder[0]);

  } catch (error) {
    console.error("Checkout Error:", error);
    
    if (error.message.startsWith("INSUFFICIENT_STOCK")) return errorResponse(res, 400, error.message);
    if (error.message === "INVALID_OTP") return errorResponse(res, 400, "INVALID_OTP");
    if (error.message === "OTP_REQUIRED") return errorResponse(res, 400, "OTP_REQUIRED");
    
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

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user._id });

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
    const order = await Order.findOne({ _id: id, user: req.user._id }).populate("items.product");
    
    if (!order) {
      return errorResponse(res, 404, "ORDER_NOT_FOUND");
    }

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

    return successResponse(res, 200, "ORDER_CANCELLED", order);
  } catch (error) {
    console.error("cancelOrder Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
