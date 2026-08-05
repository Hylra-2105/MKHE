import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getAllB2BOrdersApi } from "@/api/b2bApi";
import { Loader2, Eye, Calendar, Package, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { useSocketStore } from "@/stores/useSocketStore";
import { formatCurrency } from "@/utils/formatters";
import B2BOrderDetailModal from "./B2BOrderDetailModal";

const AdminB2BOrders = () => {
  const { t } = useTranslation(["b2b", "common"]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const { socket } = useSocketStore();

  const fetchOrders = async () => {
    try {
      const res = await getAllB2BOrdersApi();
      if (res.success) setOrders(res.data);
    } catch (error) {
      toast.error(t("b2b:admin.messages.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("admin_b2b_new_comment", (data) => {
        setOrders(prev => prev.map(o => {
          if (o._id === data.orderId) {
            return { ...o, comments: [...o.comments, data.comment] };
          }
          return o;
        }));
        setSelectedOrder((prev) => {
          if (prev && prev._id === data.orderId) {
            return { ...prev, comments: [...prev.comments, data.comment] };
          }
          return prev;
        });
      });
      socket.on("admin_b2b_order_updated", (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        setSelectedOrder(prev => prev?._id === updatedOrder._id ? updatedOrder : prev);
      });
      socket.on("admin_b2b_new_order", (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
        toast.success(t("b2b:admin.messages.new_order_received", { defaultValue: "Có yêu cầu B2B mới!" }));
      });
    }
    return () => {
      if (socket) {
        socket.off("admin_b2b_new_comment");
        socket.off("admin_b2b_order_updated");
        socket.off("admin_b2b_new_order");
      }
    };
  }, [socket]);

  const handleOrderUpdated = (updatedOrder) => {
    setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  if (loading) return <div className="p-8 flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-mkhe-primary)]" /></div>;

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      PENDING_QUOTE: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      NEGOTIATING: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      CONFIRMED: "bg-[var(--color-mkhe-primary)]/10 text-[var(--color-mkhe-primary)] border-[var(--color-mkhe-primary)]/30",
      PRODUCING: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      DELIVERING: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
      COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      CANCELLED: "bg-rose-500/10 text-rose-500 border-rose-500/30"
    };
    return colors[status] || "bg-gray-500/10 text-gray-500 border-gray-500/30";
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const pageNumbers = [page - 1, page, page + 1];

  return (
    <div className="p-3 md:p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("b2b:admin.title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("b2b:admin.subtitle")}
          </p>
        </div>
      </div>

      <div className={`bg-mkhe-bg rounded shadow overflow-hidden border border-mkhe-border/50 flex flex-col transition-opacity min-h-[420px]`}>
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap min-w-[1000px] h-full">
          <thead>
            <tr className="border-b border-mkhe-border/50 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
              <th className="px-4 py-3 font-semibold sticky left-0 bg-mkhe-bg z-20 border-r border-mkhe-border/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">{t("b2b:admin.table.company")}</th>
              <th className="px-4 py-3 font-semibold"><div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {t("b2b:admin.table.createdAt")}</div></th>
              <th className="px-4 py-3 font-semibold"><div className="flex items-center gap-2"><Package className="w-4 h-4"/> {t("b2b:admin.table.product_request")}</div></th>
              <th className="px-4 py-3 font-semibold text-center">{t("b2b:admin.table.quantity")}</th>
              <th className="px-4 py-3 font-semibold"><div className="flex items-center gap-2"><DollarSign className="w-4 h-4"/> {t("b2b:admin.table.budget")}</div></th>
              <th className="px-4 py-3 font-semibold text-center">{t("b2b:admin.table.status")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("b2b:admin.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="text-mkhe-text text-sm relative">
            {paginatedOrders.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-mkhe-text/60">{t("b2b:admin.table.no_orders")}</td></tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order._id} className="border-b border-mkhe-border/50 hover:bg-mkhe-primary/5 transition-colors last:border-b-0">
                  <td className="px-4 py-2.5 sticky left-0 bg-mkhe-bg z-10 border-r border-mkhe-border/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    <div className="font-bold text-base text-mkhe-primary truncate max-w-[200px]">{order.companyName}</div>
                    <div className="text-xs text-mkhe-text/60 mt-1">{order.user?.name}</div>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-mkhe-text/80">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold truncate max-w-[250px]">{order.productOrService?.name || t("b2b:admin.table.custom_design")}</div>
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold text-mkhe-text/90 text-base">
                    x{order.quantity}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-orange-500">
                    {formatCurrency(order.budget)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(order.status === 'PENDING' ? 'PENDING_QUOTE' : order.status)}`}>
                      {t(`b2b:status.${order.status === 'PENDING' ? 'PENDING_QUOTE' : order.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center align-middle">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                        title={t("b2b:admin.table.view_details")}
                        className="p-2 text-mkhe-primary hover:bg-mkhe-primary/10 rounded-full transition-all cursor-pointer flex items-center justify-center w-10 h-10"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      
      {/* DIVIDER */}
      <div className="h-px bg-mkhe-border/30 my-4 -mb-2"></div>

      {/* PAGINATION */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-mkhe-text/60">
            {t("b2b:admin.pagination.showing_page")} <span className="font-bold text-mkhe-primary">{page}</span> / {totalPages}
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
                  className={`w-10 h-10 flex justify-center items-center transition-all mx-1 ${
                    !isValid
                      ? "invisible w-8"
                      : isActive
                        ? "text-xl text-mkhe-primary cursor-pointer scale-110 font-bold"
                        : "text-sm font-medium cursor-pointer text-mkhe-text/50 hover:text-mkhe-primary"
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
      
      {isModalOpen && selectedOrder && (
        <B2BOrderDetailModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
          order={selectedOrder}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
};

export default AdminB2BOrders;
