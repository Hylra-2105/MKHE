import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Ticket, Calendar, TrendingDown, Tag, Box } from "lucide-react";
import { getAdminVouchersApi } from "@/api/voucherApi";
import { formatNumber } from "@/utils/formatters";
import toast from "react-hot-toast";
import VoucherFormModal from "./VoucherFormModal";

const VoucherManagementFeature = () => {
  const { t } = useTranslation(["admin"]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await getAdminVouchersApi();
      if (res.data && res.data.success) {
        setVouchers(res.data.data || []);
      } else {
        setVouchers(res.data || []); // Fallback just in case
      }
    } catch (error) {
      toast.error(t("voucher.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-mkhe-text font-bold mb-2">{t("voucher.title")}</h1>
          <p className="text-mkhe-text/60">{t("voucher.subtitle")}</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-mkhe-primary text-white cursor-pointer px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-mkhe-primary/90 transition-all shadow-lg shadow-mkhe-primary/20"
        >
          <Plus className="w-5 h-5" />
          {t("voucher.create_new")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-mkhe-input rounded-2xl shadow-sm border border-mkhe-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-mkhe-bg/50 border-b border-mkhe-border/10 text-sm text-mkhe-text/70 uppercase tracking-wider">
                <th className="p-4 font-semibold">{t("voucher.voucher_code")}</th>
                <th className="p-4 font-semibold">{t("voucher.discount_amount")}</th>
                <th className="p-4 font-semibold">{t("voucher.applicable_conditions")}</th>
                <th className="p-4 font-semibold">{t("voucher.issue_quantity")}</th>
                <th className="p-4 font-semibold">{t("voucher.drop_rate")}</th>
                <th className="p-4 font-semibold">{t("voucher.time")}</th>
                <th className="p-4 font-semibold">{t("voucher.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mkhe-border/10">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-mkhe-text/50">{t("voucher.loading")}</td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-mkhe-text/50">
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    {t("voucher.no_vouchers")}
                  </td>
                </tr>
              ) : (
                vouchers.map(voucher => (
                  <tr key={voucher._id} className="hover:bg-mkhe-bg/30 transition-colors">
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
      </div>

      <VoucherFormModal 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={fetchVouchers}
      />
    </div>
  );
};

export default VoucherManagementFeature;
