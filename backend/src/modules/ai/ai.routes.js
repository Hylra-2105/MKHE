import express from "express";
import { handleChat, getChatHistory } from "./ai.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { verifyTokenOptional } from "../../middlewares/verifyTokenOptional.js";

const router = express.Router();

router.get("/chat/history", verifyToken, getChatHistory);
router.post("/chat", verifyTokenOptional, handleChat);

export default router;
