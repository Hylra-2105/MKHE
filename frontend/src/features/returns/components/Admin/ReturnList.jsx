import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Loader2, Package, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Dropdown from "@/components/ui/Dropdown";
import returnApi from "@/api/returnApi";
import ReturnDetailModal from "./ReturnDetailModal";
import { useSocketStore } from "@/stores/useSocketStore";

const ReturnList = () => {
  const { t } = useTranslation("admin");
  const [searchParams, setSearchParams] = useSearchParams();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1 });
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const socket = useSocketStore((state) => state.socket);
  const [refreshKey, setRefreshKey] = useState(0);

  const STATUS_CONFIG = useMemo(() => ({
    PENDING: { color: "text-yellow-600", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: t("returns.status.PENDING") },
    APPROVED: { color: "text-green-600", bg: "bg-green-500/10", border: "border-green-500/30", label: t("returns.status.APPROVED") },
    REJECTED: { color: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/30", label: t("returns.status.REJECTED") }
  }), [t]);

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
          console.error("Lỗi khi tải chi tiết đổi trả:", error);
        }
      };
      fetchSpecificReturn();
      
      // Clean up URL
      searchParams.delete("returnId");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await returnApi.getAdminReturns({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search: appliedSearch
      });
      if (response.success) {
        setReturns(response.data.returns);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error(t("returns.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [pagination.page, statusFilter, appliedSearch, refreshKey]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewReturn = (data) => {
      setRefreshKey(prev => prev + 1);
      toast(t("returns.new_return_toast"), { icon: "📦" });
    };

    const handleReturnUpdated = (updatedReturn) => {
      setReturns(prevReturns => prevReturns.map(r => r._id === updatedReturn._id ? updatedReturn : r));
      setSelectedReturn(prev => (prev && prev._id === updatedReturn._id) ? updatedReturn : prev);
    };
    
    socket.on("new_return", handleNewReturn);
    socket.on("return_updated", handleReturnUpdated);

    return () => {
      socket.off("new_return", handleNewReturn);
      socket.off("return_updated", handleReturnUpdated);
    };
  }, [socket, t]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="flex flex-col flex-1">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("returns.title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("returns.desc")}
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 flex flex-col xl:flex-row xl:items-center gap-4 border border-mkhe-border/30">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <input
            type="text"
            placeholder={t("returns.search_placeholder")}
            className="w-full h-10 px-3 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            className="h-10 w-28 md:w-40 bg-mkhe-primary text-white px-4 md:px-6 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold whitespace-nowrap"
          >
            <Search className="w-5 h-5 mx-auto" />
          </button>
        </form>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <Dropdown
            value={statusFilter}
            options={[
              { value: "", label: t("returns.all_status") },
              { value: "PENDING", label: t("returns.status.PENDING") },
              { value: "APPROVED", label: t("returns.status.APPROVED") },
              { value: "REJECTED", label: t("returns.status.REJECTED") },
            ]}
            onChange={(val) => {
              setStatusFilter(val);
              setPagination({ ...pagination, page: 1 });
            }}
            placeholder={t("returns.all_status")}
            className="w-full md:w-48"
            triggerClassName="h-10 px-3 rounded"
            optionClassName="text-sm"
          />
        </div>
      </div>

      <div className={`bg-mkhe-bg rounded shadow overflow-x-auto border border-mkhe-border/50 min-h-[420px] transition-opacity relative ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-mkhe-border/50 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
              <th className="px-4 py-3 font-semibold sticky left-0 bg-mkhe-bg z-20 border-r border-mkhe-border/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">{t("returns.order_code")}</th>
              <th className="px-4 py-3 font-semibold">{t("returns.customer")}</th>
              <th className="px-4 py-3 font-semibold">{t("returns.items_title")}</th>
              <th className="px-4 py-3 font-semibold">{t("returns.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("common.status")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("contacts.actions")}</th>
            </tr>
          </thead>
          <tbody className="text-mkhe-text relative">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <Loader2 className="w-8 h-8 text-mkhe-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[var(--color-mkhe-text)]/50">
                    {t("returns.no_results")}
                  </td>
                </tr>
              ) : (
                returns.map((ret) => {
                  const conf = STATUS_CONFIG[ret.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={ret._id} className="border-b border-mkhe-border/50 hover:bg-mkhe-primary/5 transition-colors last:border-b-0">
                      <td className="px-4 py-3 font-medium text-mkhe-text sticky left-0 bg-mkhe-bg z-10 border-r border-mkhe-border/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                        {ret.order?.orderCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-mkhe-text">{ret.user?.name}</div>
                        <div className="text-xs text-mkhe-text/60 mt-0.5">{ret.user?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-2">
                          {ret.items.map((item, i) => (
                            <img 
                              key={i} 
                              src={item.image || item.product?.image || null} 
                              alt="product" 
                              className="w-8 h-8 rounded-full border-2 border-[var(--color-mkhe-bg)] object-cover bg-gray-200"
                              title={`${item.name || item.product?.name} (x${item.quantity})`}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-mkhe-text/60 mt-1">
                          {ret.items.length} mặt hàng
                        </div>
                      </td>
                      <td className="px-4 py-3 text-mkhe-text/80">{formatDate(ret.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold px-3 py-1 rounded-full text-xs inline-block text-center min-w-[100px] border ${conf.bg} ${conf.color} ${conf.border}`}>
                          {conf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedReturn(ret)}
                            className="p-2 rounded-full bg-mkhe-primary/10 hover:bg-mkhe-primary/20 text-mkhe-primary transition-all cursor-pointer"
                            title={t("contacts.view_detail")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        
        {/* Pagination was moved outside */}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 px-2">
          <span className="text-sm text-mkhe-text/60">
            Trang <span className="font-bold text-mkhe-primary">{pagination.page}</span> /{" "}
            {pagination.totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1 || loading}
              className={`px-2 py-1 rounded transition-colors mr-2 ${
                pagination.page === 1
                  ? "invisible"
                  : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              &lt;
            </button>

            {[pagination.page - 1, pagination.page, pagination.page + 1].map((pageNum) => {
              const isValid = pageNum >= 1 && pageNum <= pagination.totalPages;
              const isActive = pagination.page === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => isValid && setPagination(p => ({ ...p, page: pageNum }))}
                  disabled={loading || !isValid}
                  className={`w-10 h-10 flex justify-center items-center transition-all duration-300 mx-1 ${
                    !isValid
                      ? "invisible w-8"
                      : isActive
                        ? "text-2xl text-mkhe-primary scale-80 cursor-pointer"
                        : "text-base font-medium cursor-pointer text-mkhe-text/50 hover:text-mkhe-primary"
                  } bg-transparent border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.totalPages || loading}
              className={`px-2 py-1 rounded transition-colors font-bold ml-2 ${
                pagination.page === pagination.totalPages
                  ? "invisible"
                  : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {selectedReturn && (
        <ReturnDetailModal
          returnRequest={selectedReturn}
          onClose={() => setSelectedReturn(null)}
          onSuccess={() => {
            fetchReturns();
            setSelectedReturn(null);
          }}
        />
      )}
    </div>
  );
};

export default ReturnList;
