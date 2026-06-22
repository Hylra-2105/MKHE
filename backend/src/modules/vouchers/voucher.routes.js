import express from "express";
import {
  getPublicVouchers,
  collectVoucher,
  getUserWallet,
  redeemOfflineVoucher,
  createVoucher,
  getAllAdminVouchers,
  collectVoucherByCode,
  getVoucherOptions,
  checkNfcClaim,
  claimNfcGacha,
} from "./voucher.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// Public routes
router.get("/public", getPublicVouchers);

// Protected routes (User)
router.post("/collect", verifyToken, collectVoucher);
router.post("/collect-by-code", verifyToken, collectVoucherByCode);
router.get("/check-nfc-claim", verifyToken, checkNfcClaim);
router.post("/claim-nfc", verifyToken, claimNfcGacha);
router.get("/wallet", verifyToken, getUserWallet);

// Protected routes (Staff/Admin)
router.post(
  "/redeem-offline",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  redeemOfflineVoucher
);

router.post(
  "/admin",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  createVoucher
);

router.get(
  "/admin",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  getAllAdminVouchers
);

router.get(
  "/options",
  verifyToken,
  checkRole(["Admin", "Staff"]),
  getVoucherOptions
);

export default router;
