import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Package, ChevronRight, ChevronLeft, Clock } from "lucide-react";
import toast from "react-hot-toast";
import returnApi from "@/api/returnApi";
import { useSocketStore } from "@/stores/useSocketStore";
import UserReturnDetailModal from "./UserReturnDetailModal";

const ReturnHistoryTab = () => {
  const { t } = useTranslation("history");
  const [searchParams, setSearchParams] = useSearchParams();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { socket } = useSocketStore();

  const STATUS_CONFIG = {
    PENDING: { color: "text-amber-500", bg: "bg-amber-500/10", label: t("returns.status.PENDING") },
    APPROVED: { color: "text-green-500", bg: "bg-green-500/10", label: t("returns.status.APPROVED") },
    REJECTED: { color: "text-red-500", bg: "bg-red-500/10", label: t("returns.status.REJECTED") }
  };

  useEffect(() => {
    const returnId = searchParams.get("returnId");
    if (returnId) {
      const fetchSpecificReturn = async () => {
        try {
          const res = await returnApi.getReturnById(returnId);
          if (res.success) {
            setSelectedReturn(res.data);
          }
        } catch (error) {
          console.error(t("returns.fetch_detail_error"), error);
        }
      };
      fetchSpecificReturn();
      
      // Clean up URL
      searchParams.delete("returnId");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

  useEffect(() => {
    fetchReturns(page);
  }, [refreshKey, page]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReturnUpdated = (updatedReturn) => {
      setReturns(prevReturns => prevReturns.map(r => r._id === updatedReturn._id ? updatedReturn : r));
      setSelectedReturn(prev => (prev && prev._id === updatedReturn._id) ? updatedReturn : prev);
    };

    const handleNewReturn = (newReturn) => {
      setRefreshKey(prev => prev + 1); // Refresh the list from the server to keep pagination accurate
    };
    
    socket.on("return_updated", handleReturnUpdated);
    socket.on("new_return", handleNewReturn);
    
    return () => {
      socket.off("return_updated", handleReturnUpdated);
      socket.off("new_return", handleNewReturn);
    };
  }, [socket]);

  const fetchReturns = async (currentPage) => {
    setLoading(true);
    try {
      const response = await returnApi.getUserReturns({ page: currentPage, limit: 3 }); 
      if (response.success) {
        setReturns(response.data.returns);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error(t("returns.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gradient-gold flex items-center gap-3">
          <Package className="w-7 h-7 text-mkhe-primary" />
          {t("returns.title")}
        </h2>
        <p className="text-[var(--color-mkhe-text)]/60 mt-2">
          {t("returns.desc")}
        </p>
      </div>

      <div className="flex-1 pr-2">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-mkhe-bg)] rounded-2xl p-5 border border-[var(--color-mkhe-border)]/10 animate-pulse h-32" />
            ))}
          </div>
        ) : returns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-mkhe-text)]/40">
            <Package className="w-16 h-16 mb-4 opacity-50" />
            <p>{t("returns.no_returns")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((request) => {
              const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.PENDING;
              return (
                <div 
                  key={request._id}
                  onClick={() => setSelectedReturn(request)}
                  className="group relative bg-[var(--color-mkhe-surface)] border border-[var(--color-mkhe-border)]/10 rounded-2xl p-5 hover:border-mkhe-primary/30 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-mkhe-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                    
                    <div className="flex-1 w-full space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-[var(--color-mkhe-input)] text-mkhe-primary group-hover:scale-110 transition-transform">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--color-mkhe-text)] text-sm sm:text-base">
                              {t("returns.order_code")} <span className="text-mkhe-primary">{request.order?.orderCode}</span>
                            </p>
                            <div className="flex items-center gap-2 text-xs text-[var(--color-mkhe-text)]/50 mt-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {new Date(request.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                {" "}
                                {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${status.bg} ${status.color} border border-current/20 shadow-sm self-start sm:self-auto`}>
                          {status.label}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4 bg-[var(--color-mkhe-input)]/50 rounded-xl p-3 pr-4 group-hover:bg-[var(--color-mkhe-input)] transition-colors">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {request.items && request.items[0]?.image ? (
                            <img 
                              src={request.items[0].image} 
                              alt={request.items[0].name}
                              className="w-12 h-12 rounded-lg object-cover border border-[var(--color-mkhe-border)]/20 bg-white"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[var(--color-mkhe-border)]/10 flex items-center justify-center text-[8px] text-[var(--color-mkhe-text)]/40 border border-[var(--color-mkhe-border)]/20">
                              No Image
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-mkhe-text)] truncate">
                              {request.items && request.items[0] ? request.items[0].name : "N/A"}
                            </p>
                            <p className="text-xs text-[var(--color-mkhe-text)]/60 mt-0.5">
                              {t("returns.return_quantity")}: <span className="font-semibold text-mkhe-primary">{request.items && request.items[0] ? request.items[0].quantity : 0}</span>
                            </p>
                            {request.items && request.items.length > 1 && (
                              <p className="text-[10px] text-[var(--color-mkhe-text)]/40 mt-1 italic">
                                + {request.items.length - 1} {t("other_products")}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 shrink-0 text-[var(--color-mkhe-text)]/30 group-hover:text-mkhe-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
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
            disabled={page === 1 || loading}
            className="p-2 rounded-xl bg-[var(--color-mkhe-input)] hover:bg-[var(--color-mkhe-border)]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--color-mkhe-text)]" />
          </button>
          
          <span className="text-sm font-semibold text-[var(--color-mkhe-text)]/70">
            {page} / {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="p-2 rounded-xl bg-[var(--color-mkhe-input)] hover:bg-[var(--color-mkhe-border)]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-[var(--color-mkhe-text)]" />
          </button>
        </div>
      )}

      {selectedReturn && (
        <UserReturnDetailModal 
          returnRequest={selectedReturn} 
          onClose={() => setSelectedReturn(null)} 
        />
      )}
    </div>
  );
};

export default ReturnHistoryTab;
