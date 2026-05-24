import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/modules/auth/auth.routes.js";

dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// root route
app.get("/", (req, res) => {
  res.send("API của MKHE đang chạy ngon lành!");
});

// API liên quan đến Auth
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
