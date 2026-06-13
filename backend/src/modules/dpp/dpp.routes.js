import express from "express";
import { verifyDPP } from "./dpp.controller.js";
const router = express.Router();

// @route   GET /api/dpp/verify/:uid
// @desc    Verify NFC tag and return public product data
// @access  Public
router.get("/verify/:uid", verifyDPP);

export default router;
