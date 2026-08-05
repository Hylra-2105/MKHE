import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import orderApi from "@/api/orderApi";
import { useSocketStore } from "@/stores/useSocketStore";

const TransactionHistoryTab = () => {
  const { t } = useTranslation(["user", "history", "common", "checkout"]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = useCallback(async (currentPage) => {
    setIsLoading(true);
    try {
      const response = await orderApi.getMyOrders({ page: currentPage, limit: 4, paymentStatus: "PAID" });
      if (response && response.success) {
        setTransactions(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi tải lịch sử giao dịch:", error);
      toast.error(t("history:fetch_orders_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const { socket } = useSocketStore();

  useEffect(() => {
    fetchTransactions(page);
    
    if (socket) {
      const handleUpdate = () => fetchTransactions(page); 
      socket.on("user_order_updated", handleUpdate);
      return () => {
        socket.off("user_order_updated", handleUpdate);
      };
    }
  }, [fetchTransactions, page, socket]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gradient-gold flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-mkhe-primary" />
          {t("history:tx_title", { defaultValue: "Lịch sử giao dịch" })}
        </h2>
        <p className="text-[var(--color-mkhe-text)]/60 mt-2">
          {t("history:tx_desc", { defaultValue: "Quản lý dòng tiền thanh toán" })}
        </p>
      </div>

      <div className="flex-1 pr-2 overflow-y-auto custom-scrollbar relative min-h-[400px]">
        {isLoading && transactions.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-mkhe-bg)] rounded-2xl p-5 border border-[var(--color-mkhe-border)]/10 animate-pulse h-24" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-mkhe-text)]/40">
            <CreditCard className="w-16 h-16 mb-4 opacity-50" />
            <p>{t("history:no_orders")}</p>
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity duration-300 ${isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
            {transactions.map((tx) => (
              <div 
                key={tx._id}
                className="bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-primary)]/30 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md hover:border-mkhe-primary/60 transition-all group"
              >
                <div className="flex justify-between items-center mb-4 border-b border-[var(--color-mkhe-border)]/10 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-mkhe-primary" />
                    <span className="font-bold text-[var(--color-mkhe-text)]">
                      {tx.orderCode}
                    </span>
                    <span className="text-sm text-[var(--color-mkhe-text)]/50 hidden sm:inline-flex items-center gap-1 ml-2">
                      <Clock className="w-4 h-4" />
                      {formatDate(tx.createdAt)}
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                     {t("history:completed", { defaultValue: "Hoàn tất" })}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-sm font-medium text-[var(--color-mkhe-text)]/80 px-2.5 py-1 rounded-lg bg-[var(--color-mkhe-border)]/5">
                      {t(`checkout:payment_method.${tx.paymentMethod.toLowerCase()}`, { defaultValue: tx.paymentMethod })}
                    </span>
                  </div>
                  <div className="font-bold text-lg text-mkhe-primary">
                    -{formatCurrency(tx.totalAmount)}
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default TransactionHistoryTab;
