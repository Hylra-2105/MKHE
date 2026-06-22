import React, { useEffect, useState } from "react";
import { X, Ticket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useVoucherStore } from "@/stores/useVoucherStore";
import VoucherCard from "./VoucherCard";
import { formatNumber } from "@/utils/formatters";

const VoucherSelectorDrawer = ({ isOpen, onClose, cartItems, cartTotal, selectedVoucherId, onSelectVoucher }) => {
  const { t } = useTranslation(["cart"]);
  const { walletVouchers, fetchWalletVouchers, isLoadingWallet } = useVoucherStore();
  const [activeTab, setActiveTab] = useState("AVAILABLE");

  useEffect(() => {
    if (isOpen) {
      fetchWalletVouchers();
    }
  }, [isOpen]);

  const checkEligibility = (voucher) => {
    if (cartTotal < voucher.minOrderValue) {
      const amountNeeded = formatNumber(voucher.minOrderValue - cartTotal);
      return {
        isEligible: false,
        reason: t("voucher.buy_more_to_apply", { amount: amountNeeded }),
      };
    }

    // Check categories/villages if any
    const hasCategoryRestriction = voucher.applicableCategories && voucher.applicableCategories.length > 0;
    const hasVillageRestriction = voucher.applicableVillages && voucher.applicableVillages.length > 0;

    if (hasCategoryRestriction || hasVillageRestriction) {
      const isItemValid = cartItems.some((item) => {
        let validCat = true;
        let validVill = true;
        if (hasCategoryRestriction) {
          validCat = voucher.applicableCategories.some((c) => c === item.product.categoryMatrix || c === item.product.category);
        }
        if (hasVillageRestriction) {
          validVill = voucher.applicableVillages.some((v) => v === item.product.craftVillage);
        }
        return validCat && validVill;
      });

      if (!isItemValid) {
        return {
          isEligible: false,
          reason: t("voucher.invalid_category_village"),
        };
      }
    }

    return { isEligible: true, reason: null };
  };

  const availableVouchers = walletVouchers.filter((uv) => uv.status === "AVAILABLE");

  const sortedVouchers = [...availableVouchers].sort((a, b) => {
    const aEligible = checkEligibility(a.voucher).isEligible;
    const bEligible = checkEligibility(b.voucher).isEligible;

    if (aEligible && !bEligible) return -1;
    if (!aEligible && bEligible) return 1;

    const getDiscountAmount = (voucher) => {
      if (voucher.type === "FIXED_AMOUNT") return voucher.discountValue;
      if (voucher.type === "PERCENTAGE") {
        const calculated = (cartTotal * voucher.discountValue) / 100;
        return voucher.maxDiscount ? Math.min(calculated, voucher.maxDiscount) : calculated;
      }
      return 0;
    };

    return getDiscountAmount(b.voucher) - getDiscountAmount(a.voucher);
  });

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[60] transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-mkhe-bg z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-mkhe-border/10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-mkhe-border/10 bg-mkhe-bg">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-mkhe-primary" />
            <h2 className="font-serif text-xl text-mkhe-text">{t("voucher.select_voucher")}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-mkhe-border/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-mkhe-bg/50">
          {isLoadingWallet ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mkhe-primary"></div>
            </div>
          ) : availableVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-mkhe-text/50">
              <Ticket className="w-16 h-16 mb-4 opacity-20" />
              <p>{t("voucher.no_vouchers_wallet")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedVouchers.map((uv) => {
                const { isEligible, reason } = checkEligibility(uv.voucher);
                const isSelected = selectedVoucherId === uv.voucher._id;
                return (
                  <VoucherCard
                    key={uv._id}
                    voucher={uv.voucher}
                    isEligible={isEligible}
                    reason={reason}
                    isSelected={isSelected}
                    onSelect={() => {
                      if (isSelected) {
                        onSelectVoucher(null); // Deselect
                      } else {
                        onSelectVoucher(uv.voucher);
                      }
                      onClose();
                    }}
                    mode="selector"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VoucherSelectorDrawer;
