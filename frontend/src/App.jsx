import React from "react";
import {  useEffect, Suspense  } from "react";
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
import ScrollToTop from "./components/router/ScrollToTop";

// Import Layout
import AuthLayout from "./components/layout/AuthLayout";
import MainLayout from "./components/layout/MainLayout";

import PageSkeleton from "./components/ui/PageSkeleton";

const LoginPage = React.lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/auth/RegisterPage"));
const VerifyOTPPage = React.lazy(() => import("./pages/auth/VerifyOTPPage"));
const ForgotPasswordPage = React.lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/auth/ResetPasswordPage"));
const B2BActivationPage = React.lazy(() => import("./pages/auth/B2BActivationPage"));

const HomePage = React.lazy(() => import("./pages/home/HomePage"));
const BlogList = React.lazy(() => import("./features/blogs/components/Admin/BlogList"));
const BlogEditor = React.lazy(() => import("./features/blogs/components/Admin/BlogEditor"));
const BlogPage = React.lazy(() => import("./pages/blogs/BlogPage"));
const BlogDetail = React.lazy(() => import("./pages/blogs/BlogDetail"));
const ShopPage = React.lazy(() => import("./pages/shop/ShopPage"));
const ShopDetailPage = React.lazy(() => import("./pages/shop/ShopDetailPage"));
const UserManagement = React.lazy(() => import("./pages/users/UserManagementPage"));
const ProductManagementPage = React.lazy(() => import("./pages/products/ProductManagementPage"));
const VoucherManagementPage = React.lazy(() => import("./pages/vouchers/VoucherManagementPage"));
const ContactManagementPage = React.lazy(() => import("./pages/contact/ContactManagementPage"));

const ReviewManagementPage = React.lazy(() => import("./pages/reviews/ReviewManagementPage"));
const ReturnManagementPage = React.lazy(() => import("./pages/returns/ReturnManagementPage"));
const PolicyManagement = React.lazy(() => import("./features/policies/components/Admin/PolicyManagement"));
const PolicyEditor = React.lazy(() => import("./features/policies/components/Admin/PolicyEditor"));
const HelpCenterPage = React.lazy(() => import("./pages/policies/HelpCenterPage"));

const DashboardPage = React.lazy(() => import("./pages/admin/DashboardPage"));
const B2BDashboardPage = React.lazy(() => import("./pages/b2b/B2BDashboardPage"));
const B2BOrderRequest = React.lazy(() => import("./pages/b2b/B2BOrderRequest"));

const ForbiddenPage = React.lazy(() => import("./pages/errors/ForbiddenPage"));
const NotFoundPage = React.lazy(() => import("./pages/errors/NotFoundPage"));

const ProfilePage = React.lazy(() => import("@/pages/users/ProfilePage"));

const DPPPage = React.lazy(() => import("@/pages/dpp/DPPPage"));
const AboutPage = React.lazy(() => import("@/pages/about/AboutPage"));
const ContactPage = React.lazy(() => import("@/pages/contact/ContactPage"));

const CheckoutPage = React.lazy(() => import("./pages/orders/CheckoutPage"));
const CheckoutSuccessPage = React.lazy(() => import("./pages/orders/CheckoutSuccessPage"));
const OrderManagementPage = React.lazy(() => import("./pages/orders/OrderManagementPage"));
const AdminB2BOrdersPage = React.lazy(() => import("./pages/admin/AdminB2BOrdersPage"));

function App() {
  const { t } = useTranslation(["header"]);
  const tRef = React.useRef(t);
  
  React.useEffect(() => {
    tRef.current = t;
  }, [t]);

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
    const socketUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';
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

    if (socket.connected && user && user._id) {
      socket.emit("join_user_room", user._id);
      if (user.role === "Admin" || user.role === "Staff") {
        socket.emit("join_admin_room");
      }
    }

    socket.on("new_notification", (notif) => {
      addNotification(notif);
      
      const map = {
        "ORDER_PLACED": "notifications.title.order_placed",
        "ORDER_PAYMENT_SUCCESS": "notifications.title.payment_success",
        "ORDER_CONFIRMED": "notifications.title.order_confirmed",
        "ORDER_DELIVERING": "notifications.title.order_delivering",
        "ORDER_COMPLETED": "notifications.title.order_completed",
        "ORDER_CANCELLED": "notifications.title.order_cancelled",
        "VOUCHER_SAVED": "notifications.title.voucher_saved",
        "LUCKY_WHEEL_WON": "notifications.title.lucky_wheel_won",
        "FLASH_SALE_TITLE": "notifications.title.flash_sale",
        "VOUCHER_PUBLISHED_TITLE": "notifications.title.voucher_published",
        "USER_RETURN_CREATED": "notifications.title.USER_RETURN_CREATED",
        "USER_RETURN_UPDATED": "notifications.title.USER_RETURN_UPDATED",
        "USER_RETURN_UPDATED_APPROVED": "notifications.title.USER_RETURN_UPDATED_APPROVED",
        "USER_RETURN_UPDATED_REJECTED": "notifications.title.USER_RETURN_UPDATED_REJECTED",
        "Yêu cầu Đổi/Trả thành công": "notifications.title.USER_RETURN_CREATED",
        "Cập nhật trạng thái Đổi/Trả": "notifications.title.USER_RETURN_UPDATED",
        "Cập nhật trạng thái B2B": "notifications.title.B2B_STATUS_UPDATED",
        "B2B_QUOTE_UPLOADED": "notifications.title.B2B_QUOTE_UPLOADED"
      };
      const currentT = tRef.current;
      const translatedTitle = map[notif.title] ? currentT(map[notif.title], { defaultValue: notif.title }) : notif.title;

      let toastMessage = translatedTitle;
      if (notif.title === "USER_RETURN_UPDATED_APPROVED" || notif.title === "USER_RETURN_UPDATED_REJECTED") {
        const isApproved = notif.title === "USER_RETURN_UPDATED_APPROVED";
        const statusStr = currentT(`notifications.title.return_status_${isApproved ? 'approved' : 'rejected'}`, { defaultValue: isApproved ? "Đã duyệt" : "Từ chối" });
        toastMessage = currentT("notifications.title.return_updated_toast", {
          defaultValue: `Cập nhật đổi trả đơn ${notif.orderCode || ''}: ${statusStr}`,
          orderCode: notif.orderCode || '',
          status: statusStr
        });
      }

      toast(toastMessage, {
        icon: '🔔',
      });
    });

    socket.on("new_admin_notification", (notif) => {
      if (user && (user.role === "Admin" || user.role === "Staff")) {
        addNotification(notif);
        
        const adminMap = {
          "ADMIN_ORDER_NEW": "notifications.title.admin_order_new",
          "ADMIN_ORDER_PAID": "notifications.title.admin_order_paid",
          "ADMIN_ORDER_COMPLETED": "notifications.title.admin_order_completed",
          "ADMIN_STOCK_ALERT": "notifications.title.admin_stock_alert",
          "ADMIN_RETURN_NEW": "notifications.title.ADMIN_RETURN_NEW",
          "Yêu cầu Đổi/Trả mới": "notifications.title.ADMIN_RETURN_NEW"
        };
        const currentT = tRef.current;
        const translatedTitle = adminMap[notif.title] ? currentT(adminMap[notif.title], { defaultValue: notif.title }) : notif.title;

        toast(`[${currentT("notifications.header_title", { defaultValue: "Hệ thống" })}] ${translatedTitle}`, {
          icon: '🚨',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    });

    socket.on("product_updated", (updatedProduct) => {
      const updateProductInItems = useCartStore.getState().updateProductInItems;
      if (updateProductInItems) {
        updateProductInItems(updatedProduct);
      }
    });

    socket.on("force_logout", (data) => {
      const currentT = tRef.current;
      toast.error(
        data?.reason 
          ? `${currentT("messages.account_blocked_reason", { defaultValue: "Tài khoản của bạn đã bị khóa:" })} ${data.reason}` 
          : currentT("messages.account_blocked", { defaultValue: "Tài khoản của bạn đã bị khóa bởi Quản trị viên!" }),
        { duration: 5000 }
      );
      useAuthStore.getState().logoutAction();
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
      <ScrollToTop />
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        containerStyle={{
          zIndex: 999999,
        }}
        toastOptions={{
          className: '!bg-mkhe-bg !text-mkhe-text !border !border-mkhe-border !rounded-xl !shadow-lg',
          style: {
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
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
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
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
            path="/admin/policies"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <PolicyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/policies/create"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <PolicyEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/policies/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <PolicyEditor />
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
            path="/admin/contacts"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <ContactManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/b2b/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Enterprise"]}>
                <B2BDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/b2b/request"
            element={
              <ProtectedRoute allowedRoles={["Enterprise"]}>
                <B2BOrderRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/b2b-orders"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <AdminB2BOrdersPage />
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
            path="/admin/returns"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <ReturnManagementPage />
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
            path="/b2b/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Enterprise"]}>
                <B2BDashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/b2b/order-request"
            element={
              <ProtectedRoute allowedRoles={["Enterprise"]}>
                <B2BOrderRequest />
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
          <Route
            path="/activate-b2b"
            element={
              <AuthRoute>
                <B2BActivationPage />
              </AuthRoute>
            }
          />
        </Route>

        <Route path="/dpp/:uid" element={<Suspense fallback={<PageSkeleton />}><DPPPage /></Suspense>} />

        <Route path="/403" element={<Suspense fallback={<PageSkeleton />}><ForbiddenPage /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<PageSkeleton />}><NotFoundPage /></Suspense>} />
      </Routes>
    </Router>
  );
}

export default App;
