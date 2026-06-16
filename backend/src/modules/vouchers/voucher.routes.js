import express from "express";
import {
  getPublicVouchers,
  collectVoucher,
  getUserWallet,
  redeemOfflineVoucher,
} from "./voucher.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// Public routes
router.get("/public", getPublicVouchers);

// Protected routes (User)
router.post("/collect", verifyToken, collectVoucher);
router.get("/wallet", verifyToken, getUserWallet);

// Protected routes (Staff/Admin)
router.post(
  "/redeem-offline",
  verifyToken,
  checkRole(["admin", "staff", "admin_tong", "admin_lang_nghe"]),
  redeemOfflineVoucher
);

export default router;
