import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "@/api/authApi";

import ProtectedRoute from "./components/router/ProtectedRoute";
import AuthRoute from "./components/router/AuthRoute";

// Import Layout
import AuthLayout from "./components/layout/AuthLayout";
import MainLayout from "./components/layout/MainLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOTPPage from "./pages/auth/VerifyOTPPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import HomePage from "./pages/home/HomePage";
import UserManagement from "./pages/users/UserManagementPage";
import ProductManagementPage from "./pages/products/ProductManagementPage";

import ForbiddenPage from "./pages/errors/ForbiddenPage";
import NotFoundPage from "./pages/errors/NotFoundPage";

import ProfilePage from "@/pages/users/ProfilePage";

function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const fetchFreshUserData = async () => {
      try {
        const response = await authApi.getMe();

        if (response && response.success) {
          // Bắt data trả về. Tùy vào hàm successResponse ở Backend cấu hình mà nó nằm ở .user hoặc .data
          const userData = response.user || response.data;
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        // Lỗi này thường do chưa đăng nhập (không có token), cứ kệ nó không cần báo lỗi popup lên màn hình
        console.log("Chưa đăng nhập hoặc Token hết hạn");
      }
    };

    fetchFreshUserData();
  }, [setUser]);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <ProductManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <AuthRoute>
                <VerifyOTPPage />
              </AuthRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRoute>
                <ForgotPasswordPage />
              </AuthRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthRoute>
                <ResetPasswordPage />
              </AuthRoute>
            }
          />
        </Route>

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
