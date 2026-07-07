import express from "express";
import { createContact } from "./contact.controller.js";

const router = express.Router();

router.post("/", createContact);

export default router;
