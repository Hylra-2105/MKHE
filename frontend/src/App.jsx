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

import DPPPage from "@/pages/dpp/DPPPage";

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);
  const logoutAction = useAuthStore((state) => state.logoutAction);
  const setFetchingUser = useAuthStore((state) => state.setFetchingUser);
  
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      if (token) {
        const fetchFreshUserData = async () => {
          setFetchingUser(true);
          try {
            const response = await authApi.getMe();

            if (response && response.success) {
              const userData = response.data || response.user;
              if (userData) {
                setUser(userData);
              }
            }
          } catch (error) {
            console.log("Chưa đăng nhập hoặc Token hết hạn, đang dọn dẹp...");
            logoutAction();
          } finally {
            setFetchingUser(false);
          }
        };

        fetchFreshUserData();
      }
    }
  }, [setUser, token, logoutAction, setFetchingUser]);

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

        <Route path="/dpp/:id" element={<DPPPage />} />

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
