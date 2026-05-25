import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/layout/Header";

import ProtectedRoute from "./components/router/ProtectedRoute";
import AuthRoute from "./components/router/AuthRoute";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOTPPage from "./pages/auth/VerifyOTPPage";
import HomePage from "./pages/Home/HomePage";

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* VÙNG BẢO VỆ CHO USER */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* VÙNG CHỈ DÀNH CHO KHÁCH (CHƯA ĐĂNG NHẬP) */}
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
