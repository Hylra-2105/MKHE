import express from "express";
import {
  getPolicies,
  getPolicyBySlug,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from "./policy.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";
import { extractUser } from "../../middlewares/extractUser.js";

const router = express.Router();

// Public routes
// Optional auth to differentiate Admin/Staff from normal users when fetching list
router.get("/", extractUser, getPolicies);
router.get("/:slug", getPolicyBySlug);

// Admin routes
router.use(verifyToken, checkRole(["Admin", "Staff"]));
router.post("/", createPolicy);
router.put("/:id", updatePolicy);
router.delete("/:id", deletePolicy);

export default router;
