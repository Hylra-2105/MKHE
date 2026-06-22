import { Loader2, Ticket } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OrderSummary({ checkoutItems, subtotal, shippingFee, discountAmount, totalAmount, handleCheckout, isSubmitting, otpSending, selectedVoucher, onOpenVoucherDrawer }) {
  const { t } = useTranslation("checkout");
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="w-full lg:w-1/3">
      <div className="bg-mkhe-border/5 p-6 rounded-lg shadow-sm border border-mkhe-border/10 sticky top-24">
        <h2 className="text-xl font-medium mb-4 pb-2 border-b border-mkhe-border/10 text-mkhe-text">{t("summary.title")}</h2>
        
        <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
          {checkoutItems.map((item) => (
            <div key={item.product._id} className="flex gap-4">
              <div className="w-16 h-16 bg-mkhe-border/10 rounded-md overflow-hidden flex-shrink-0">
                {item.product.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-mkhe-text/40">No img</div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm line-clamp-2 text-mkhe-text">{item.product.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-mkhe-text/60 text-sm">{t("summary.qty")}: {item.quantity}</span>
                  <span className="font-medium text-mkhe-primary">{formatMoney(item.product.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div 
          onClick={onOpenVoucherDrawer}
          className="w-full flex items-center justify-between p-3 border hover:border-mkhe-primary/50 border-mkhe-border/30 rounded-xl bg-mkhe-bg/50 cursor-pointer group transition-colors mb-4"
        >
          <div className="flex items-center gap-2">
            <Ticket className={`w-5 h-5 ${selectedVoucher ? "text-mkhe-primary" : "text-mkhe-text/50"}`} />
            <span className={`font-medium text-sm ${selectedVoucher ? "text-mkhe-primary" : "text-mkhe-text/50"}`}>
              {selectedVoucher ? `${t("voucher.selected", { defaultValue: "Đã chọn:" })} ${selectedVoucher.code}` : t("summary.select_voucher")}
            </span>
          </div>
          <span className="text-sm font-semibold text-mkhe-primary group-hover:underline cursor-pointer">
            {selectedVoucher ? t("voucher.change", { defaultValue: "Thay đổi" }) : t("summary.select_btn")}
          </span>
        </div>

        <div className="space-y-3 pt-4 border-t border-mkhe-border/10 text-sm">
          <div className="flex justify-between">
            <span className="text-mkhe-text/80">{t("summary.subtotal")}</span>
            <span className="font-medium text-mkhe-text">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mkhe-text/80">{t("summary.shipping_fee")}</span>
            <span className="font-medium text-mkhe-text">{shippingFee === 0 ? t("summary.free") : formatMoney(shippingFee)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-500">
              <span>{t("summary.discount")}:</span>
              <span>-{formatMoney(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t border-mkhe-border/10">
            <span className="font-medium text-lg text-mkhe-text">{t("summary.total")}</span>
            <span className="font-bold text-2xl text-mkhe-primary">{formatMoney(totalAmount)}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isSubmitting || otpSending}
          className="w-full mt-6 bg-mkhe-primary text-white py-4 rounded-md hover:brightness-90 transition-colors uppercase tracking-wider font-medium flex items-center justify-center disabled:opacity-70 cursor-pointer"
        >
          {otpSending ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {t("summary.sending_otp")}</> :
           isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {t("summary.processing")}</> :
           t("summary.confirm_btn")}
        </button>
      </div>
    </div>
  );
}
