import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Ticket, Loader2, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { getUserWalletApi } from "@/api/voucherApi";
import { useSocketStore } from "@/stores/useSocketStore";

const MyVouchersTab = () => {
  const { t } = useTranslation(["user", "common"]);
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const VOUCHERS_PER_PAGE = 6;

  const paginatedVouchers = useMemo(() => {
    const startIndex = (page - 1) * VOUCHERS_PER_PAGE;
    return vouchers.slice(startIndex, startIndex + VOUCHERS_PER_PAGE);
  }, [vouchers, page]);

  const totalPages = Math.ceil(vouchers.length / VOUCHERS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const fetchVouchers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUserWalletApi();
      const responseData = response.data;
      if (responseData && responseData.success) {
        setVouchers(responseData.data || []);
      }
    } catch (error) {
      console.error("Lỗi tải ví voucher:", error);
      toast.error(t("common:error", { defaultValue: "Đã xảy ra lỗi" }));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const { socket } = useSocketStore();

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  useEffect(() => {
    if (!socket) return;
    
    const handleWalletUpdated = () => {
      fetchVouchers(); // Refresh list when a new voucher is collected
    };
    
    socket.on("wallet_updated", handleWalletUpdated);
    
    return () => {
      socket.off("wallet_updated", handleWalletUpdated);
    };
  }, [socket, fetchVouchers]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusDisplay = (status) => {
    switch(status) {
      case "AVAILABLE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-3.5 h-3.5" /> {t("user:vouchers_tab.status_available", { defaultValue: "Khả dụng" })}</span>;
      case "USED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-500">{t("user:vouchers_tab.status_used", { defaultValue: "Đã sử dụng" })}</span>;
      case "EXPIRED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500">{t("user:vouchers_tab.status_expired", { defaultValue: "Đã hết hạn" })}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gradient-gold flex items-center gap-3">
          <Ticket className="w-7 h-7 text-mkhe-primary" />
          {t("user:profile.vouchers", { defaultValue: "Ví Voucher" })}
        </h2>
      </div>

      <div className="flex-1 pr-2 overflow-y-auto custom-scrollbar relative min-h-[400px]">
        {isLoading && vouchers.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-mkhe-bg)] rounded-2xl p-5 border border-[var(--color-mkhe-border)]/10 animate-pulse h-32" />
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-mkhe-text)]/40">
            <Ticket className="w-16 h-16 mb-4 opacity-50" />
            <p>{t("user:vouchers_tab.no_vouchers", { defaultValue: "Bạn chưa có voucher nào" })}</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 px-3 py-1 transition-opacity duration-300 ${isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
            {paginatedVouchers.map((userVoucher) => {
              const v = userVoucher.voucher;
              if (!v) return null;
              
              return (
                <div 
                  key={userVoucher._id}
                  className={`group bg-[var(--color-mkhe-bg)] dark:bg-[#3d271d] border rounded-2xl p-5 flex flex-col gap-4 relative transition-all ${
                    userVoucher.status === "AVAILABLE" 
                      ? "border-[var(--color-mkhe-primary)]/50 shadow-md hover:shadow-lg hover:border-[var(--color-mkhe-primary)]" 
                      : "border-[var(--color-mkhe-primary)]/20 opacity-80"
                  }`}
                >
                  {/* Decorator circles */}
                  <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-mkhe-input)] border-r z-10 transition-all ${
                    userVoucher.status === "AVAILABLE" 
                      ? "border-[var(--color-mkhe-primary)]/50 group-hover:border-[var(--color-mkhe-primary)]" 
                      : "border-[var(--color-mkhe-primary)]/20"
                  }`} />
                  <div className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-mkhe-input)] border-l z-10 transition-all ${
                    userVoucher.status === "AVAILABLE" 
                      ? "border-[var(--color-mkhe-primary)]/50 group-hover:border-[var(--color-mkhe-primary)]" 
                      : "border-[var(--color-mkhe-primary)]/20"
                  }`} />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-[var(--color-mkhe-text)]">{v.code}</h4>
                      <p className="text-sm font-medium text-mkhe-primary mt-1">
                        {v.type === "PERCENTAGE" ? `${t("user:vouchers_tab.discount", { defaultValue: "Giảm" })} ${v.discountValue}%` : `${t("user:vouchers_tab.discount", { defaultValue: "Giảm" })} ${new Intl.NumberFormat("vi-VN").format(v.discountValue)}đ`}
                      </p>
                    </div>
                    {getStatusDisplay(userVoucher.status)}
                  </div>
                  
                  <div className="border-t border-dashed border-[var(--color-mkhe-border)]/20 pt-4 mt-auto">
                    <p className="text-xs text-[var(--color-mkhe-text)]/60 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {t("user:vouchers_tab.expiry", { defaultValue: "HSD" })}: {formatDate(v.endDate)}
                    </p>
                  </div>
                </div>
              );
            })}
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

export default MyVouchersTab;
