import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import orderApi from "@/api/orderApi";
import { toast } from "react-hot-toast";
import { FiPrinter, FiLock, FiAlertTriangle } from "react-icons/fi";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import OrderFilter from "@/features/orders/components/Admin/OrderFilter";
import OrderDetailModal from "@/features/orders/components/Admin/OrderDetailModal";
import UserDetailModal from "@/features/users/components/Admin/UserDetailModal";
import StatusBadge from "@/features/orders/components/Admin/StatusBadge";
import { printInvoice } from "@/features/orders/utils/printInvoice";

const OrderManagementPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [highRisk, setHighRisk] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const HIGH_RISK_THRESHOLD = import.meta.env.VITE_HIGH_RISK_THRESHOLD || 5000000;

  const fetchOrders = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await orderApi.getAllOrdersAdmin({ 
        page, 
        limit: 6, 
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        search: searchInput,
        startDate,
        endDate,
        highRisk
      });
      if (res.success) {
        setOrders(prev => JSON.stringify(prev) === JSON.stringify(res.data.data) ? prev : res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t("admin:orders.fetch_error"));
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [page, statusFilter, searchInput, startDate, endDate, highRisk]); 

  const handleStatusChange = async (id, newStatus, newPaymentStatus) => {
    try {
      const res = await orderApi.updateOrderStatusAdmin(id, newStatus, newPaymentStatus);
      if (res.success) {
        toast.success(t("admin:orders.update_success"));
        fetchOrders();
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus, paymentStatus: newPaymentStatus || selectedOrder.paymentStatus });
        }
        setIsModalOpen(false);
      } else {
        toast.error(res.message || t("admin:orders.update_fail"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("admin:orders.system_error"));
    }
  };

  // Removed handleLockUser because we use UserDetailModal now

  const handlePrintInvoice = (order) => {
    printInvoice(order, t, i18n);
  };

  const isHighRisk = (order) => {
    return order.totalAmount > HIGH_RISK_THRESHOLD || (order.user?.cancelRate > 50);
  };

  const pageNumbers = [page - 1, page, page + 1];

  return (
    <div className="p-3 md:p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("admin:orders.title", { defaultValue: "Quản lý Đơn hàng" })}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("admin:orders.subtitle", { defaultValue: "Theo dõi, xử lý và phân tích đơn đặt hàng" })}
          </p>
        </div>
      </div>

      <OrderFilter 
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        highRisk={highRisk}
        setHighRisk={setHighRisk}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        handleSearch={handleSearch}
      />

      <div className={`bg-mkhe-bg rounded shadow overflow-hidden border border-mkhe-border/50 min-h-[420px] flex flex-col transition-opacity ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-mkhe-border/50 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
              <th className="px-4 py-3 font-semibold sticky left-0 bg-mkhe-bg z-20 border-r border-mkhe-border/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">{t("admin:orders.table_id", { defaultValue: "Mã Đơn" })}</th>
              <th className="px-4 py-3 font-semibold">{t("admin:orders.table_date", { defaultValue: "Ngày Đặt" })}</th>
              <th className="px-4 py-3 font-semibold">{t("admin:orders.table_customer", { defaultValue: "Khách Hàng" })}</th>
              <th className="px-4 py-3 font-semibold">{t("admin:orders.table_total", { defaultValue: "Tổng Tiền" })}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("admin:orders.table_payment", { defaultValue: "THANH TOÁN" })}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("admin:orders.table_status", { defaultValue: "Trạng Thái" })}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("admin:orders.table_action", { defaultValue: "Hành Động" })}</th>
            </tr>
          </thead>
          <tbody className="text-mkhe-text relative">
            {loading && (
              <tr className="absolute inset-0 h-full flex items-center justify-center bg-mkhe-bg/50 backdrop-blur-sm pointer-events-none">
                <td colSpan="7" className="text-center">
                  <div className="inline-block animate-spin">
                    <div className="w-8 h-8 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
                  </div>
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-mkhe-text/60">{t("admin:orders.no_orders", { defaultValue: "Không tìm thấy đơn hàng nào." })}</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b border-mkhe-border/50 hover:bg-mkhe-primary/5 transition-colors last:border-b-0">
                  <td className="px-4 py-2.5 font-medium sticky left-0 bg-mkhe-bg z-10 border-r border-mkhe-border/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">{order.orderCode}</td>
                  <td className="px-4 py-2.5 text-mkhe-text/80">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{order.shippingInfo.name}</div>
                    <div className="text-sm text-mkhe-text/60">{order.shippingInfo.phone}</div>
                    {isHighRisk(order) && (
                      <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/30">
                        <FiAlertTriangle /> {t("admin:orders.high_risk", { defaultValue: "RỦI RO CAO" })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{order.totalAmount.toLocaleString()}đ</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                      order.paymentStatus === "PAID" ? "bg-green-500/10 text-green-500" :
                      order.paymentStatus === "REFUNDED" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {order.paymentStatus === "PAID" ? "Đã thanh toán" :
                       order.paymentStatus === "REFUNDED" ? "Hoàn tiền" :
                       "Chưa thanh toán"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <StatusBadge status={order.orderStatus} />
                  </td>
                  <td className="px-4 py-2.5 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                        title={t("admin:orders.view_detail", { defaultValue: "Xem chi tiết" })} 
                        className="p-2 bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary/20 rounded-full transition-colors cursor-pointer flex items-center justify-center w-9 h-9 shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handlePrintInvoice(order)} 
                        title={t("admin:orders.print_invoice", { defaultValue: "In hóa đơn" })} 
                        className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-full transition-colors cursor-pointer flex items-center justify-center w-9 h-9 shrink-0"
                      >
                        <FiPrinter size={18} />
                      </button>
                      {user?.role === "Admin" && order.user && (
                        <button 
                          onClick={() => { setSelectedUser(order.user); setIsUserModalOpen(true); }}
                          className={`p-2 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center w-9 h-9 shrink-0 ${order.user.isBlocked ? "text-green-500 hover:bg-green-500/20 bg-green-500/10" : "text-orange-500 hover:bg-orange-500/20 bg-orange-500/10"}`}
                          title={order.user.isBlocked ? t("common.unlock_account", { defaultValue: "Mở Khóa Tài Khoản" }) : t("admin:orders.lock_account", { defaultValue: "Khóa Tài Khoản" })}
                        >
                          <FiLock size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      
      <OrderDetailModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
      />

      <UserDetailModal
        isOpen={isUserModalOpen}
        onClose={() => { setIsUserModalOpen(false); setSelectedUser(null); }}
        user={selectedUser}
        onRefresh={fetchOrders}
        lockOnly={true}
      />

      <div className="h-px bg-mkhe-border/30 my-7"></div>

      {totalPages > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-mkhe-text/60">
            Hiển thị trang{" "}
            <span className="font-bold text-mkhe-primary">{page}</span> /{" "}
            {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || loading}
              className={`px-2 py-1 rounded transition-colors mr-2 ${
                page === 1
                  ? "invisible"
                  : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              &lt;
            </button>

            {pageNumbers.map((pageNum) => {
              const isValid = pageNum >= 1 && pageNum <= totalPages;
              const isActive = page === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => isValid && setPage(pageNum)}
                  disabled={loading || !isValid}
                  className={`w-10 h-10 flex justify-center items-center transition-all duration-300 mx-1 ${
                    !isValid
                      ? "invisible w-8"
                      : isActive
                        ? "text-2xl text-mkhe-primary scale-80 cursor-pointer font-bold"
                        : "text-base font-medium cursor-pointer text-mkhe-text/50 hover:text-mkhe-primary"
                  } bg-transparent border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || loading}
              className={`px-2 py-1 rounded transition-colors font-bold ml-2 ${
                page === totalPages
                  ? "invisible"
                  : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
