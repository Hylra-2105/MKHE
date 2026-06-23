import React from "react";
import { Search, X } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useTranslation } from "react-i18next";

const flatpickrOptions = {
  locale: Vietnamese,
  dateFormat: "Y-m-d",
};

const formatFlatpickrDate = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function OrderFilter({
  searchInput,
  setSearchInput,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  highRisk,
  setHighRisk,
  statusFilter,
  setStatusFilter,
  handleSearch,
}) {
  const { t } = useTranslation();

  const startDateOptions = React.useMemo(() => ({
    ...flatpickrOptions,
  }), []);

  const endDateOptions = React.useMemo(() => ({
    ...flatpickrOptions,
    minDate: startDate || undefined,
  }), [startDate]);

  const statusOptions = [
    { value: "", label: t("admin:orders.status_all", { defaultValue: "Tất cả trạng thái" }) },
    { value: "PENDING", label: t("admin:orders.status_pending", { defaultValue: "Chờ xử lý" }) },
    { value: "CONFIRMED", label: t("admin:orders.status_confirmed", { defaultValue: "Đã xác nhận" }) },
    { value: "DELIVERING", label: t("admin:orders.status_delivering", { defaultValue: "Đang giao" }) },
    { value: "COMPLETED", label: t("admin:orders.status_completed", { defaultValue: "Hoàn thành" }) },
    { value: "CANCELLED", label: t("admin:orders.status_cancelled", { defaultValue: "Đã hủy" }) },
  ];

  return (
    <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 border border-mkhe-border/30">
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row lg:items-center gap-4">
        
        {/* Search Input */}
        <div className="flex-1 relative min-w-[250px]">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-mkhe-text/40" />
          <input
            type="text"
            placeholder={t("admin:orders.search_placeholder", { defaultValue: "Mã đơn, Tên KH, SĐT..." })}
            className="w-full h-10 pl-10 pr-3 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Flatpickr
              value={formatFlatpickrDate(startDate)}
              onChange={([date]) => setStartDate(formatFlatpickrDate(date))}
              options={startDateOptions}
              className="h-10 pl-3 pr-8 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors w-36 cursor-pointer"
              placeholder={t("admin:orders.date_from", { defaultValue: "Từ ngày" })}
            />
            {startDate && (
              <X
                className="absolute right-2 top-3 w-4 h-4 text-mkhe-text/40 hover:text-mkhe-text/80 cursor-pointer transition-colors"
                onClick={() => setStartDate("")}
              />
            )}
          </div>
          <span className="text-mkhe-text/60">-</span>
          <div className="relative">
            <Flatpickr
              value={formatFlatpickrDate(endDate)}
              onChange={([date]) => setEndDate(formatFlatpickrDate(date))}
              options={endDateOptions}
              className="h-10 pl-3 pr-8 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors w-36 cursor-pointer"
              placeholder={t("admin:orders.date_to", { defaultValue: "Đến ngày" })}
            />
            {endDate && (
              <X
                className="absolute right-2 top-3 w-4 h-4 text-mkhe-text/40 hover:text-mkhe-text/80 cursor-pointer transition-colors"
                onClick={() => setEndDate("")}
              />
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <Dropdown
          value={statusFilter}
          options={statusOptions}
          onChange={(val) => setStatusFilter(val)}
          placeholder="Tất cả trạng thái"
          className="w-full lg:w-48 shrink-0"
          triggerClassName="h-10 px-3 rounded"
          optionClassName="text-sm"
        />

        {/* High Risk Checkbox */}
        <div className="flex items-center h-10 px-4 rounded border border-mkhe-border/50 bg-transparent shrink-0 transition-colors hover:border-mkhe-primary">
          <input
            type="checkbox"
            id="highRisk"
            checked={highRisk}
            onChange={(e) => setHighRisk(e.target.checked)}
            className="magic-cb-input"
          />
          <label htmlFor="highRisk" className="magic-cb-label text-sm font-medium text-mkhe-text cursor-pointer select-none whitespace-nowrap m-0">
            <span></span> {t("admin:orders.high_risk_filter", { defaultValue: "Đơn rủi ro cao" })}
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="h-10 bg-mkhe-primary text-white px-6 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold shrink-0"
        >
          {t("admin:filter.search", { defaultValue: "Lọc" })}
        </button>

      </form>
    </div>
  );
}
