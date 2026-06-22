import { z } from "zod";

export const sendCheckoutOtpSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
  }),
});

export const checkoutSchema = z.object({
  body: z.object({
    shippingInfo: z.object({
      name: z.string().min(2, "Tên quá ngắn"),
      phone: z.string().regex(/^(0|\+84)[1-9][0-9]{8,9}$/, "Số điện thoại không hợp lệ"),
      address: z.string().min(5, "Địa chỉ quá ngắn"),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })).min(1, "Phải có ít nhất 1 sản phẩm"),
    paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
    otp: z.string().length(6).optional(), // Bắt buộc nếu là COD, xử lý ở controller
    voucherId: z.string().optional(),
    isTrustedDevice: z.boolean().optional(),
  }),
});
