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

const OrderManagementPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [highRisk, setHighRisk] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const HIGH_RISK_THRESHOLD = import.meta.env.VITE_HIGH_RISK_THRESHOLD || 5000000;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getAllOrdersAdmin({ 
        page, 
        limit: 6, 
        status: statusFilter,
        search: searchInput,
        startDate,
        endDate,
        highRisk
      });
      if (res.success) {
        setOrders(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t("admin:orders.fetch_error", { defaultValue: "Lỗi tải danh sách đơn hàng" }));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [page]); 

  const handleStatusChange = async (id, newStatus, newPaymentStatus) => {
    try {
      const res = await orderApi.updateOrderStatusAdmin(id, newStatus, newPaymentStatus);
      if (res.success) {
        toast.success(t("admin:orders.update_success", { defaultValue: "Cập nhật trạng thái thành công" }));
        fetchOrders();
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus, paymentStatus: newPaymentStatus || selectedOrder.paymentStatus });
        }
        setIsModalOpen(false);
      } else {
        toast.error(res.message || t("admin:orders.update_fail", { defaultValue: "Cập nhật thất bại" }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("admin:orders.system_error", { defaultValue: "Lỗi hệ thống" }));
    }
  };

  // Removed handleLockUser because we use UserDetailModal now

  const handlePrintInvoice = (order) => {
    const isPaid = order.paymentStatus === "Paid" || order.paymentStatus === "PAID";
    const codAmount = isPaid ? 0 : order.totalAmount;
    
    const printLng = i18n.language === "vi" ? "vi" : "en";
    
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Phiếu Giao Hàng - ${order.orderCode}</title>
          <style>
            @page { margin: 0; }
            body { font-family: sans-serif; padding: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 20px; }
            .info-block { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-block > div { width: 48%; }
            .cod-block { text-align: right; margin-top: 20px; border: 2px solid #000; padding: 15px; display: inline-block; float: right; border-radius: 8px; }
            .clearfix::after { content: ""; clear: both; display: table; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${t("admin:orders.print.title", { lng: printLng, defaultValue: "PHIẾU GIAO HÀNG (SHIPPING LABEL)" })}</h2>
            <p>${t("admin:orders.print.order_code", { lng: printLng, defaultValue: "Mã đơn" })}: <strong>${order.orderCode}</strong></p>
          </div>
          
          <div class="info-block">
            <div>
              <h3>${t("admin:orders.print.sender", { lng: printLng, defaultValue: "NGƯỜI GỬI:" })}</h3>
              <p><strong>${t("admin:orders.print.shop", { lng: printLng, defaultValue: "Shop:" })}</strong> MKHE Heritage</p>
              <p><strong>${t("admin:orders.print.phone", { lng: printLng, defaultValue: "Điện thoại:" })}</strong> 090 123 4567</p>
              <p><strong>${t("admin:orders.print.address", { lng: printLng, defaultValue: "Địa chỉ:" })}</strong> Trung tâm Kho vận MKHE, TP. Hồ Chí Minh</p>
            </div>
            <div>
              <h3>${t("admin:orders.print.receiver", { lng: printLng, defaultValue: "NGƯỜI NHẬN:" })}</h3>
              <p><strong>${t("admin:orders.print.customer", { lng: printLng, defaultValue: "Khách hàng:" })}</strong> ${order.shippingInfo.name}</p>
              <p><strong>${t("admin:orders.print.phone", { lng: printLng, defaultValue: "Điện thoại:" })}</strong> ${order.shippingInfo.phone}</p>
              <p><strong>${t("admin:orders.print.address", { lng: printLng, defaultValue: "Địa chỉ:" })}</strong> ${order.shippingInfo.address}</p>
              ${order.shippingInfo.note ? `<p><strong>${t("admin:orders.print.note", { lng: printLng, defaultValue: "Ghi chú:" })}</strong> ${order.shippingInfo.note}</p>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${t("admin:orders.print.product", { lng: printLng, defaultValue: "Sản phẩm" })}</th>
                <th>${t("admin:orders.print.quantity", { lng: printLng, defaultValue: "Số lượng" })}</th>
                <th>${t("admin:orders.print.unit_price", { lng: printLng, defaultValue: "Đơn giá" })}</th>
                <th>${t("admin:orders.print.total", { lng: printLng, defaultValue: "Thành tiền" })}</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(i => `
                <tr>
                  <td>${i.name}</td>
                  <td>${i.quantity}</td>
                  <td>${i.price.toLocaleString()}đ</td>
                  <td>${(i.price * i.quantity).toLocaleString()}đ</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="clearfix">
            <h3 style="text-align: right; margin-top: 20px;">${t("admin:orders.print.total_amount", { lng: printLng, defaultValue: "Tổng tiền đơn hàng:" })} ${order.totalAmount.toLocaleString()}đ</h3>
            <div class="cod-block">
              <p style="margin: 0 0 5px 0;">${t("admin:orders.print.payment_method", { lng: printLng, defaultValue: "Phương thức thanh toán:" })} <strong>${order.paymentMethod}</strong></p>
              <h2 style="margin: 0; color: #000;">${t("admin:orders.print.cod", { lng: printLng, defaultValue: "TIỀN THU HỘ (COD):" })} ${codAmount.toLocaleString()}đ</h2>
            </div>
          </div>

          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const StatusBadgeInline = ({ status }) => {
    const colorClass = (s) => {
      switch (s) {
        case "PENDING": return "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 font-semibold px-3 py-1 rounded-full text-xs inline-block text-center min-w-[100px]";
        case "CONFIRMED": return "bg-blue-500/10 text-blue-600 border border-blue-500/30 font-semibold px-3 py-1 rounded-full text-xs inline-block text-center min-w-[100px]";
        case "DELIVERING": return "bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 font-semibold px-3 py-1 rounded-full text-xs inline-block text-center min-w-[100px]";
        case "COMPLETED": return "bg-green-500/10 text-green-600 border border-green-500/30 font-semibold px-3 py-1 rounded-full text-xs inline-block text-center min-w-[100px]";
        case "CANCELLED": return "bg-red-500/10 text-red-600 border border-red-500/30 font-semibold px-3 py-1 rounded-full text-xs inline-block text-center min-w-[100px]";
        default: return "bg-gray-500/10 text-gray-600 border border-gray-500/30 font-semibold px-3 py-1 rounded-full text-xs inline-block text-center min-w-[100px]";
      }
    };
    const statusLabels = { 
      "PENDING": t("admin:orders.status_pending", { defaultValue: "Chờ Xử Lý" }), 
      "CONFIRMED": t("admin:orders.status_confirmed", { defaultValue: "Đã Xác Nhận" }), 
      "DELIVERING": t("admin:orders.status_delivering", { defaultValue: "Đang Giao" }), 
      "COMPLETED": t("admin:orders.status_completed", { defaultValue: "Hoàn Thành" }), 
      "CANCELLED": t("admin:orders.status_cancelled", { defaultValue: "Đã Hủy" }) 
    };
    return <div className={colorClass(status)}>{statusLabels[status] || status}</div>;
  };

  const isHighRisk = (order) => {
    return order.totalAmount > HIGH_RISK_THRESHOLD || (order.user?.cancelRate > 50);
  };

  const pageNumbers = [page - 1, page, page + 1];

  return (
    <div className="p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col">
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
        handleSearch={handleSearch}
      />

      <div className={`bg-mkhe-bg rounded shadow overflow-hidden border border-mkhe-border/30 h-[600px] flex flex-col transition-opacity ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-mkhe-border/30 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
              <th className="p-4 font-semibold">{t("admin:orders.table_id", { defaultValue: "Mã Đơn" })}</th>
              <th className="p-4 font-semibold">{t("admin:orders.table_date", { defaultValue: "Ngày Đặt" })}</th>
              <th className="p-4 font-semibold">{t("admin:orders.table_customer", { defaultValue: "Khách Hàng" })}</th>
              <th className="p-4 font-semibold">{t("admin:orders.table_total", { defaultValue: "Tổng Tiền" })}</th>
              <th className="p-4 font-semibold text-center">{t("admin:orders.table_status", { defaultValue: "Trạng Thái" })}</th>
              <th className="p-4 font-semibold text-center">{t("admin:orders.table_action", { defaultValue: "Hành Động" })}</th>
            </tr>
          </thead>
          <tbody className="text-mkhe-text relative">
            {loading && (
              <tr className="absolute inset-0 h-full flex items-center justify-center bg-mkhe-bg/50 backdrop-blur-sm pointer-events-none">
                <td colSpan="6" className="text-center">
                  <div className="inline-block animate-spin">
                    <div className="w-8 h-8 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
                  </div>
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-mkhe-text/60">{t("admin:orders.no_orders", { defaultValue: "Không tìm thấy đơn hàng nào." })}</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b border-mkhe-border/20 hover:bg-mkhe-primary/5 transition-colors last:border-b-0">
                  <td className="p-4 font-medium">{order.orderCode}</td>
                  <td className="p-4 text-mkhe-text/80">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="p-4">
                    <div className="font-medium">{order.shippingInfo.name}</div>
                    <div className="text-sm text-mkhe-text/60">{order.shippingInfo.phone}</div>
                    {isHighRisk(order) && (
                      <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/30">
                        <FiAlertTriangle /> {t("admin:orders.high_risk", { defaultValue: "RỦI RO CAO" })}
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{order.totalAmount.toLocaleString()}đ</td>
                  <td className="p-4 text-center">
                    <StatusBadgeInline status={order.orderStatus} />
                  </td>
                  <td className="p-4 flex gap-2 justify-center">
                    <button 
                      onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                      title={t("admin:orders.view_detail", { defaultValue: "Xem chi tiết" })} 
                      className="p-2 bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary/20 rounded-full transition-colors cursor-pointer flex items-center justify-center w-9 h-9"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handlePrintInvoice(order)} 
                      title={t("admin:orders.print_invoice", { defaultValue: "In hóa đơn" })} 
                      className="p-2 bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary/20 rounded-full transition-colors cursor-pointer flex items-center justify-center w-9 h-9"
                    >
                      <FiPrinter size={18} />
                    </button>
                    {user?.role === "Admin" && order.user && (
                      <button 
                        onClick={() => { setSelectedUser(order.user); setIsUserModalOpen(true); }}
                        className={`p-2 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center w-9 h-9 ${order.user.isBlocked ? "text-orange-500 hover:bg-orange-500/20 bg-orange-500/10" : "text-red-600 hover:bg-red-500/20 bg-red-500/10"}`}
                        title={order.user.isBlocked ? t("common.unlock_account", { defaultValue: "Mở Khóa Tài Khoản" }) : t("admin:orders.lock_account", { defaultValue: "Khóa Tài Khoản" })}
                      >
                        <FiLock size={18} />
                      </button>
                    )}
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
