import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

// Lấy __dirname cho ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env từ thư mục backend root
const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import userRoutes from "./src/modules/users/user.routes.js";
import productRoutes from "./src/modules/products/product.routes.js";

connectDB();

const app = express();

// Middleware CORS with proper headers for OAuth
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Add COOP and COEP headers for Google OAuth
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(express.json());

// root route
app.get("/", (req, res) => {
  res.send("API của MKHE đang chạy ngon lành!");
});

// API liên quan đến Auth
app.use("/api/auth", authRoutes);

// API liên quan đến Users
app.use("/api/users", userRoutes);

// API liên quan đến Products
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
