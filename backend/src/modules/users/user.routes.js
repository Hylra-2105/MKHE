import express from "express";
import { getAllUsers } from "./user.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";

const router = express.Router();

// Chỉ Admin và Staff mới được xem danh sách
router.get("/", verifyToken, checkRole(["Admin"]), getAllUsers);

export default router;