import express from "express";
import {
  createReview,
  getReviewsByProduct,
  getAllReviews,
  toggleVisibility,
} from "./review.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// Public / Customer
router.get("/product/:productId", getReviewsByProduct);
router.post("/", verifyToken, createReview);

// Admin
router.get("/", verifyToken, checkRole(["Admin"]), getAllReviews);
router.patch("/:id/toggle-visibility", verifyToken, checkRole(["Admin"]), toggleVisibility);

export default router;
