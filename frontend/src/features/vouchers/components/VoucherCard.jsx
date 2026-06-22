import React from "react";
import { formatNumber } from "@/utils/formatters";
import { QrCode, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const VoucherCard = ({ 
  voucher, 
  userVoucherId,
  isEligible, 
  reason, 
  isSelected, 
  onSelect,
  onShowQR,
  mode = "selector" // 'selector' (in cart) | 'wallet' (in profile)
}) => {
  const { t } = useTranslation(["cart"]);

  const getDiscountText = () => {
    if (voucher.type === "PERCENTAGE") {
      return t("voucher.discount_percentage_val", { value: voucher.discountValue });
    }
    if (voucher.type === "FIXED_AMOUNT") {
      return t("voucher.discount_fixed_val", { val: formatNumber(voucher.discountValue) });
    }
    if (voucher.type === "FREE_SHIP") {
      return t("voucher.free_shipping");
    }
    return "";
  };

  const getMinOrderText = () => {
    if (voucher.minOrderValue > 0) {
      return t("voucher.min_order_card", { value: formatNumber(voucher.minOrderValue) });
    }
    return t("voucher.no_min_order");
  };

  return (
    <div className={`relative flex w-full bg-mkhe-card rounded-xl overflow-hidden border-2 transition-all ${
      !isEligible ? "border-mkhe-border/30 bg-mkhe-card/50" : 
      isSelected ? "border-mkhe-primary shadow-lg shadow-mkhe-primary/20" : "border-mkhe-border/50 hover:border-mkhe-primary/60"
    }`}>
      
      <div className="absolute top-0 bottom-0 left-[100px] border-l-2 border-dashed border-mkhe-border/40"></div>

      
      <div className={`w-[100px] flex flex-col items-center justify-center p-3 text-center ${isEligible ? "bg-mkhe-primary/10" : "bg-mkhe-border/5"}`}>
        <span className={`text-xl font-bold ${isEligible ? "text-mkhe-primary" : "text-mkhe-text/40"}`}>
          {voucher.type === "PERCENTAGE" ? `${voucher.discountValue}%` : 
           voucher.type === "FREE_SHIP" ? "FREE" : 
           `${formatNumber(voucher.discountValue / 1000)}k`}
        </span>
        <span className="text-[10px] text-mkhe-text/60 mt-1 uppercase font-semibold">
          {voucher.code}
        </span>
      </div>

      
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h4 className="font-medium text-mkhe-text text-sm mb-1">{getDiscountText()}</h4>
          <p className="text-xs text-mkhe-text/60">{getMinOrderText()}</p>
          {voucher.type === "PERCENTAGE" && voucher.maxDiscount > 0 && (
            <p className="text-xs text-mkhe-text/60">{t("voucher.max_discount_card", { value: formatNumber(voucher.maxDiscount) })}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-mkhe-text/50">
            {t("voucher.expiry_date", { date: new Date(voucher.endDate).toLocaleDateString(), defaultValue: `HSD: ${new Date(voucher.endDate).toLocaleDateString()}` })}
          </span>

          {mode === "selector" ? (
            <button
              disabled={!isEligible}
              onClick={() => isEligible && onSelect()}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                isSelected 
                  ? "bg-mkhe-primary text-white" 
                  : isEligible 
                    ? "bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary hover:text-white"
                    : "bg-mkhe-border/10 text-mkhe-text/40 cursor-not-allowed"
              }`}
            >
              {isSelected ? t("voucher.applying") : t("voucher.use_now")}
            </button>
          ) : (
            // Wallet Mode
            <div className="flex gap-2">
              {voucher.isO2O && onShowQR && (
                <button
                  onClick={() => onShowQR(userVoucherId)}
                  className="p-1.5 rounded-full bg-mkhe-border/10 text-mkhe-text hover:bg-mkhe-border/20 transition-colors"
                  title={t("voucher.scan_at_counter")}
                >
                  <QrCode className="w-4 h-4" />
                </button>
              )}
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-mkhe-primary text-white hover:bg-mkhe-primary/90 transition-colors"
              >
                {t("voucher.use_online")}
              </button>
            </div>
          )}
        </div>

        
        {!isEligible && reason && mode === "selector" && (
          <p className="text-[10px] text-red-500/90 mt-2 bg-red-500/10 p-1.5 rounded border border-red-500/20">
            {reason}
          </p>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 text-mkhe-primary">
          <CheckCircle2 className="w-5 h-5 fill-current text-white" />
        </div>
      )}
    </div>
  );
};

export default VoucherCard;
