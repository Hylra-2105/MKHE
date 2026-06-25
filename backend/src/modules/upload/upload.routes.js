import express from "express";
import { uploadImage } from "./upload.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { uploadCloud } from "../../config/cloudinary.js";

const router = express.Router();

router.post("/image", verifyToken, uploadCloud.single("image"), uploadImage);

export default router;
