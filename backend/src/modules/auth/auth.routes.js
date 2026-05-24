import express from 'express';
import { registerUser } from './auth.controller.js';

const router = express.Router();

// Tạo đường dẫn POST cho đăng ký
router.post('/register', registerUser);

export default router;