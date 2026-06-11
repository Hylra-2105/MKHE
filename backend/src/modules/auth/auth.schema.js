import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    language: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const socialLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().optional(),
    avatar: z.string().optional(),
    providerId: z.string().optional(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    resetToken: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});
