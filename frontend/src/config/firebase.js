// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyB9gb4Nn7CdquMWA5ff32N2n90xf1Hz48k",
  authDomain: "mkhe-auth.firebaseapp.com",
  projectId: "mkhe-auth",
  storageBucket: "mkhe-auth.firebasestorage.app",
  messagingSenderId: "646967991776",
  appId: "1:646967991776:web:8e6229a5e424746ba79f85",
  measurementId: "G-1TT1R6BJ48",
};

// Khởi tạo app Firebase
const app = initializeApp(firebaseConfig);

// Lấy bộ công cụ Auth
export const auth = getAuth(app);

// Khởi tạo Google provider
export const googleProvider = new GoogleAuthProvider();
