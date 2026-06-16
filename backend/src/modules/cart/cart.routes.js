import express from "express";
import { getCart, syncCart, updateCartItem, removeCartItem } from "./cart.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const router = express.Router();

router.use(verifyToken); // All cart routes require auth

router.get("/", getCart);
router.post("/sync", syncCart);
router.put("/items", updateCartItem);
router.delete("/items/:productId", removeCartItem);

export default router;
