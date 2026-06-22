import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Ticket, Calendar, TrendingDown, Tag, Box } from "lucide-react";
import { getAdminVouchersApi } from "@/api/voucherApi";
import { formatNumber } from "@/utils/formatters";
import toast from "react-hot-toast";
import VoucherFormModal from "./VoucherFormModal";
import Dropdown from "@/components/ui/Dropdown";

const VoucherManagementFeature = () => {
  const { t } = useTranslation(["admin", "common"]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(4);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminVouchersApi(page, limit, appliedSearch, statusFilter, typeFilter);
      if (res.data && res.data.success) {
        setVouchers(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        setVouchers(res.data || []); 
      }
    } catch (error) {
      toast.error(t("voucher.fetch_error"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, appliedSearch, statusFilter, typeFilter, t]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Pagination display
  const pageNumbers = [page - 1, page, page + 1];

  const getStatusBadge = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (!voucher.isActive) {
      return <span className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">{t("voucher.badge_inactive")}</span>;
    }
    if (now < startDate) {
      return <span className="px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">{t("voucher.badge_upcoming")}</span>;
    }
    if (now > endDate) {
      return <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">{t("voucher.expired")}</span>;
    }
    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      return <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">{t("voucher.out_of_stock")}</span>;
    }
    return <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">{t("voucher.running")}</span>;
  };

  return (
    <div className="p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">{t("voucher.title")}</h1>
          <p className="text-sm text-mkhe-text/60 italic">{t("voucher.subtitle")}</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-mkhe-primary text-white cursor-pointer px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-mkhe-primary/90 transition-all shadow-lg shadow-mkhe-primary/20"
        >
          <Plus className="w-5 h-5" />
          {t("voucher.create_new")}
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 flex flex-col xl:flex-row xl:items-center gap-4 border border-mkhe-border/30">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <input
            type="text"
            placeholder={t("voucher.search_placeholder")}
            className="w-full h-10 px-3 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="h-10 w-28 md:w-40 bg-mkhe-primary text-white px-4 md:px-6 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold whitespace-nowrap"
          >
            {t("filter.search")}
          </button>
        </form>
        
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <Dropdown
            value={statusFilter}
            options={[
              { value: "ALL", label: t("voucher.status_all") },
              { value: "RUNNING", label: t("voucher.running") },
              { value: "UPCOMING", label: t("voucher.badge_upcoming") },
              { value: "EXPIRED", label: t("voucher.expired") },
              { value: "OUT_OF_STOCK", label: t("voucher.out_of_stock") }
            ]}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            placeholder={t("voucher.status_all")}
            className="w-full md:w-56"
            triggerClassName="h-10 px-3 rounded"
            optionClassName="text-sm"
          />

          <Dropdown
            value={typeFilter}
            options={[
              { value: "ALL", label: t("voucher.type_all") },
              { value: "PERCENTAGE", label: t("voucher.type_percentage") },
              { value: "FIXED_AMOUNT", label: t("voucher.type_fixed") },
              { value: "FREE_SHIP", label: t("voucher.type_freeship") }
            ]}
            onChange={(val) => { setTypeFilter(val); setPage(1); }}
            placeholder={t("voucher.type_all")}
            className="w-full md:w-60"
            triggerClassName="h-10 px-3 rounded"
            optionClassName="text-sm"
          />
        </div>
      </div>

      {/* Table */}
        <div className={`bg-mkhe-bg rounded shadow overflow-x-auto overflow-y-hidden border border-mkhe-border/30 h-[440px] transition-opacity ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-mkhe-border/30 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
                <th className="p-4 font-semibold">{t("voucher.voucher_code")}</th>
                <th className="p-4 font-semibold">{t("voucher.discount_amount")}</th>
                <th className="p-4 font-semibold">{t("voucher.applicable_conditions")}</th>
                <th className="p-4 font-semibold">{t("voucher.issue_quantity")}</th>
                <th className="p-4 font-semibold">{t("voucher.drop_rate")}</th>
                <th className="p-4 font-semibold">{t("voucher.time")}</th>
                <th className="p-4 font-semibold">{t("voucher.status")}</th>
              </tr>
            </thead>
            <tbody className="text-mkhe-text relative">
              {loading && (
                <tr className="absolute inset-0 h-full flex items-center justify-center bg-mkhe-bg/50 backdrop-blur-sm pointer-events-none z-10">
                  <td colSpan="7" className="text-center">
                    <div className="inline-block animate-spin">
                      <div className="w-8 h-8 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && vouchers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-mkhe-text/50">
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    {t("voucher.no_vouchers")}
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher._id} className="border-b border-mkhe-border/20 hover:bg-mkhe-primary/5 transition-colors last:border-b-0 group">
                    <td className="p-4">
                      <div className="font-bold text-mkhe-primary mb-1">{voucher.code}</div>
                      {voucher.isO2O && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-mkhe-primary/10 text-mkhe-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <Box className="w-3 h-3" /> {t("voucher.o2o_offline")}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-mkhe-text flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        {voucher.type === "PERCENTAGE" && `${voucher.discountValue}%`}
                        {voucher.type === "FIXED_AMOUNT" && t("voucher.discount_fixed_val", { val: formatNumber(voucher.discountValue) })}
                        {voucher.type === "FREE_SHIP" && t("voucher.free_shipping")}
                      </div>
                      {voucher.maxDiscount > 0 && (
                        <div className="text-xs text-mkhe-text/60 mt-1">{t("voucher.max_discount_val", { val: formatNumber(voucher.maxDiscount) })}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">{t("voucher.min_order_val", { val: formatNumber(voucher.minOrderValue) })}</div>
                      {(voucher.applicableVillages.length > 0 || voucher.applicableCategories.length > 0) && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-mkhe-text/60">
                          <Tag className="w-3 h-3" />
                          {t("voucher.limited_products")}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <span className="font-semibold">{voucher.usedCount}</span>
                        <span className="text-mkhe-text/50 mx-1">/</span>
                        {voucher.usageLimit ? voucher.usageLimit : "∞"}
                      </div>
                      <div className="w-full bg-mkhe-border/10 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-mkhe-primary rounded-full" 
                          style={{ width: voucher.usageLimit ? `${Math.min((voucher.usedCount / voucher.usageLimit) * 100, 100)}%` : "0%" }}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-mkhe-primary">
                        {voucher.dropRate > 0 ? `${voucher.dropRate}%` : "-"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5 text-mkhe-text/70">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(voucher.startDate).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                        </div>
                        <div className="text-mkhe-text/40 text-xs ml-5">{t("voucher.to_date")}</div>
                        <div className="flex items-center gap-1.5 text-mkhe-text/70">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(voucher.endDate).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(voucher)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {/* DIVIDER */}
      <div className="h-px bg-mkhe-border/30 my-7"></div>

      {/* PAGINATION */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-mkhe-text/60">
            {t("pagination.showing_page")} <span className="font-bold text-mkhe-primary">{page}</span> / {totalPages}
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
                        ? "text-2xl text-mkhe-primary scale-80 cursor-pointer"
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

      <VoucherFormModal 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={fetchVouchers}
      />
    </div>
  );
};

export default VoucherManagementFeature;
