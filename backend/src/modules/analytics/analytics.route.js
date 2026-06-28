import express from "express";
import { getRevenueAnalytics, getProductsReport, getAdvancedAnalytics } from "./analytics.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

router.use(verifyToken);
router.use(checkRole(["Admin", "Staff"]));

router.get("/revenue", getRevenueAnalytics);
router.get("/products-report", getProductsReport);
router.get("/advanced", getAdvancedAnalytics);

export default router;
