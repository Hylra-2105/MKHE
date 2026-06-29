import express from "express";
import { handleChat } from "./ai.controller.js";

const router = express.Router();

router.post("/chat", handleChat);

export default router;
