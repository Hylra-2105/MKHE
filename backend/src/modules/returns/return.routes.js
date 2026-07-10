import express from "express";
import { createReturn, getAdminReturns, updateReturnStatus, getUserReturns, getReturnById } from "./return.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// User routes
router.post("/", verifyToken, createReturn);
router.get("/user", verifyToken, getUserReturns);

// Admin routes
router.get("/admin", verifyToken, checkRole(["Admin", "Staff"]), getAdminReturns);
router.put("/admin/:id/status", verifyToken, checkRole(["Admin", "Staff"]), updateReturnStatus);

// Common route
router.get("/:id", verifyToken, getReturnById);

export default router;
