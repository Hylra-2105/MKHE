import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

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

import ForbiddenPage from "./pages/errors/ForbiddenPage";

function App() {
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
      </Routes>
    </Router>
  );
}

export default App;
