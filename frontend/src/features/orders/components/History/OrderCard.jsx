import { useTranslation } from "react-i18next";
import { Package, ChevronRight, Clock } from "lucide-react";

const getStatusConfig = (status, t) => {
  switch (status) {
    case "PENDING":
      return { color: "text-amber-500", bg: "bg-amber-500/10", label: t("history:status_pending", { defaultValue: "Chờ xác nhận" }) };
    case "CONFIRMED":
      return { color: "text-blue-500", bg: "bg-blue-500/10", label: t("history:status_confirmed", { defaultValue: "Đã xác nhận" }) };
    case "DELIVERING":
      return { color: "text-indigo-500", bg: "bg-indigo-500/10", label: t("history:status_delivering", { defaultValue: "Đang giao" }) };
    case "COMPLETED":
      return { color: "text-green-500", bg: "bg-green-500/10", label: t("history:status_completed", { defaultValue: "Hoàn thành" }) };
    case "CANCELLED":
      return { color: "text-red-500", bg: "bg-red-500/10", label: t("history:status_cancelled_label", { defaultValue: "Đã hủy" }) };
    default:
      return { color: "text-gray-500", bg: "bg-gray-500/10", label: status };
  }
};

const OrderCard = ({ order, onClick }) => {
  const { t } = useTranslation();
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  const statusConfig = getStatusConfig(order.orderStatus, t);
  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
  const otherItemsCount = order.items ? order.items.length - 1 : 0;

  const dateStr = new Date(order.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div 
      onClick={onClick}
      className="bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/20 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md hover:border-mkhe-primary/40 cursor-pointer transition-all group"
    >
      <div className="flex justify-between items-center mb-4 border-b border-[var(--color-mkhe-border)]/10 pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-mkhe-primary" />
          <span className="font-bold text-[var(--color-mkhe-text)]">
            {order.orderCode}
          </span>
          <span className="text-sm text-[var(--color-mkhe-text)]/50 hidden sm:inline-flex items-center gap-1 ml-2">
            <Clock className="w-4 h-4" />
            {dateStr}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.color}`}>
          {statusConfig.label}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {firstItem && (
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-xl bg-[var(--color-mkhe-input)] overflow-hidden flex-shrink-0">
              <img 
                src={firstItem.image || "https://placehold.co/100x100?text=No+Image"} 
                alt={firstItem.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Image"; }}
              />
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-mkhe-text)] line-clamp-1">
                {firstItem.name}
              </h4>
              <p className="text-sm text-[var(--color-mkhe-text)]/70 mt-1">
                x{firstItem.quantity}
              </p>
              {otherItemsCount > 0 && (
                <p className="text-xs text-[var(--color-mkhe-text)]/50 mt-1">
                  + {otherItemsCount} {t("history:other_products", { defaultValue: "sản phẩm khác" })}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-[var(--color-mkhe-border)]/10 sm:border-0">
          <div className="text-right mr-4">
            <p className="text-xs text-[var(--color-mkhe-text)]/60 mb-1">{t("history:total_amount", { defaultValue: "Tổng tiền" })}</p>
            <p className="font-bold text-mkhe-primary text-lg">{formatMoney(order.totalAmount)}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-mkhe-text)]/30 group-hover:text-mkhe-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
