import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "@/api/authApi";
import { getCartApi } from "@/api/cartApi";
import { useCartStore } from "@/stores/useCartStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useSocketStore } from "@/stores/useSocketStore";
import io from "socket.io-client";

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
import BlogList from "./features/blogs/components/Admin/BlogList";
import BlogEditor from "./features/blogs/components/Admin/BlogEditor";
import BlogPage from "./pages/blogs/BlogPage";
import BlogDetail from "./pages/blogs/BlogDetail";
import ShopPage from "./pages/shop/ShopPage";
import ShopDetailPage from "./pages/shop/ShopDetailPage";
import UserManagement from "./pages/users/UserManagementPage";
import ProductManagementPage from "./pages/products/ProductManagementPage";
import VoucherManagementPage from "./pages/vouchers/VoucherManagementPage";
import ReviewManagementPage from "./pages/reviews/ReviewManagementPage";
import DashboardPage from "./pages/admin/DashboardPage";

import ForbiddenPage from "./pages/errors/ForbiddenPage";
import NotFoundPage from "./pages/errors/NotFoundPage";

import ProfilePage from "@/pages/users/ProfilePage";

import DPPPage from "@/pages/dpp/DPPPage";

import CheckoutPage from "./pages/orders/CheckoutPage";
import CheckoutSuccessPage from "./pages/orders/CheckoutSuccessPage";
import OrderManagementPage from "./pages/orders/OrderManagementPage";

function App() {
  const { t } = useTranslation(["header"]);
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
              
              // Đồng bộ giỏ hàng từ server về local khi app load
              try {
                const cartRes = await getCartApi();
                if (cartRes.data && cartRes.data.items) {
                  useCartStore.setState({ items: cartRes.data.items });
                }
              } catch (cartErr) {
                console.error("Lỗi khi fetch giỏ hàng đầu phiên:", cartErr);
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

  // Setup Socket.io
  useEffect(() => {
    if (token) {
      // Decode token or rely on user object (but user might not be fully fetched yet)
      // Actually we just wait for `user` to be available
    }
  }, [token]);

  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const setSocket = useSocketStore((state) => state.setSocket);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem("accessToken") || "" },
    });

    setSocket(socket);

    socket.on("connect", () => {
      if (user && user._id) {
        socket.emit("join_user_room", user._id);
        if (user.role === "Admin" || user.role === "Staff") {
          socket.emit("join_admin_room");
        }
      }
    });

    socket.on("new_notification", (notif) => {
      addNotification(notif);
      
      const map = {
        "Đặt hàng thành công": "notifications.title.order_placed",
        "Thanh toán thành công": "notifications.title.payment_success",
        "Đơn hàng đã được xác nhận": "notifications.title.order_confirmed",
        "Đơn hàng đang giao": "notifications.title.order_delivering",
        "Giao hàng thành công": "notifications.title.order_completed",
        "Đơn hàng đã hủy": "notifications.title.order_cancelled",
        "Lưu mã giảm giá thành công": "notifications.title.voucher_saved",
        "Chúc mừng trúng thưởng!": "notifications.title.lucky_wheel_won",
        "FLASH_SALE_TITLE": "notifications.title.flash_sale",
        "Sản phẩm Sale Khủng!": "notifications.title.flash_sale",
        "VOUCHER_PUBLISHED_TITLE": "notifications.title.voucher_published",
        "Bạn có mã ưu đãi mới!": "notifications.title.voucher_published"
      };
      const translatedTitle = map[notif.title] ? t(map[notif.title], { defaultValue: notif.title }) : notif.title;

      toast(translatedTitle, {
        icon: '🔔',
      });
    });

    socket.on("product_updated", (updatedProduct) => {
      const updateProductInItems = useCartStore.getState().updateProductInItems;
      if (updateProductInItems) {
        updateProductInItems(updatedProduct);
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [user, addNotification]);

  return (
    <Router>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          className: '!bg-mkhe-bg !text-mkhe-text !border !border-mkhe-border !rounded-xl !shadow-lg',
          style: {
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 9999
          },
          success: {
            iconTheme: {
              primary: 'var(--color-mkhe-primary)',
              secondary: 'var(--color-mkhe-bg)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'var(--color-mkhe-bg)',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:id" element={<ShopDetailPage />} />
          <Route path="/storytelling" element={<BlogPage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route
            path="/admin/blogs"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <BlogList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blogs/create"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <BlogEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blogs/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <BlogEditor />
              </ProtectedRoute>
            }
          />
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
            path="/admin/vouchers"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <VoucherManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <OrderManagementPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <ReviewManagementPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/analysis"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <DashboardPage />
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
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/success"
            element={
              <ProtectedRoute>
                <CheckoutSuccessPage />
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

        <Route path="/dpp/:uid" element={<DPPPage />} />

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
