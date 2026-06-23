import React from "react";
import { useTranslation } from "react-i18next";

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();

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

export default StatusBadge;
