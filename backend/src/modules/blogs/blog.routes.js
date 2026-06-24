import express from "express";
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
} from "./blog.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { verifyTokenOptional } from "../../middlewares/verifyTokenOptional.js";
import { checkRole } from "../../middlewares/checkRole.js";
import { uploadCloud } from "../../config/cloudinary.js";

const router = express.Router();

// Public routes
router.get("/", verifyTokenOptional, getBlogs);
router.get("/:slug", verifyTokenOptional, getBlogBySlug);

// Admin / Staff routes
router.post("/", verifyToken, checkRole(["Admin", "Staff"]), createBlog);
router.put("/:id", verifyToken, checkRole(["Admin", "Staff"]), updateBlog);
router.delete("/:id", verifyToken, checkRole(["Admin", "Staff"]), deleteBlog);

// Upload ảnh từ Rich Text Editor
router.post("/upload-image", verifyToken, checkRole(["Admin", "Staff"]), uploadCloud.single("image"), uploadBlogImage);

export default router;
