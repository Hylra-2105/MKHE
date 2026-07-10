import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingBag, ChevronLeft, ChevronRight, MapPin, Clock, Search, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import orderApi from "@/api/orderApi";
import OrderCard from "./OrderCard";
import OrderDetailModal from "./OrderDetailModal";
import { useSocketStore } from "@/stores/useSocketStore";

const OrderHistoryTab = () => {
  const { t } = useTranslation(["history", "common"]);
  const { socket } = useSocketStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = useCallback(async (currentPage, isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const response = await orderApi.getMyOrders({ page: currentPage, limit: 3 });
      if (response && response.success) {
        setOrders(prev => JSON.stringify(prev) === JSON.stringify(response.data.data || []) ? prev : (response.data.data || []));
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi tải lịch sử đơn hàng:", error);
      toast.error(t("history:fetch_orders_error"));
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders(page);
    
    if (socket) {
      const handleUpdate = () => fetchOrders(page, true); // true = isBackground
      socket.on("user_order_updated", handleUpdate);
      return () => {
        socket.off("user_order_updated", handleUpdate);
      };
    }
  }, [fetchOrders, page, socket]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleOrderUpdated = () => {
    fetchOrders(page);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gradient-gold flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-mkhe-primary" />
          {t("history:title", { defaultValue: "Lịch sử mua hàng" })}
        </h2>
        <p className="text-[var(--color-mkhe-text)]/60 mt-2">
          {t("history:desc", { defaultValue: "Theo dõi và quản lý các đơn hàng của bạn" })}
        </p>
      </div>

      <div className="flex-1 pr-2">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-mkhe-bg)] rounded-2xl p-5 border border-[var(--color-mkhe-border)]/10 animate-pulse h-32" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-mkhe-text)]/40">
            <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
            <p>{t("history:no_orders", { defaultValue: "Bạn chưa có đơn hàng nào." })}</p>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                onClick={() => setSelectedOrderId(order._id)} 
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[var(--color-mkhe-border)]/10">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className="p-2 rounded-xl bg-[var(--color-mkhe-input)] hover:bg-[var(--color-mkhe-border)]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--color-mkhe-text)]" />
          </button>
          
          <span className="text-sm font-semibold text-[var(--color-mkhe-text)]/70">
            {page} / {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isLoading}
            className="p-2 rounded-xl bg-[var(--color-mkhe-input)] hover:bg-[var(--color-mkhe-border)]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-[var(--color-mkhe-text)]" />
          </button>
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
};

export default OrderHistoryTab;
