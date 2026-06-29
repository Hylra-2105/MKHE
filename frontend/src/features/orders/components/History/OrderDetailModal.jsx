import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Package, MapPin, CreditCard, Loader2, CheckCircle2, RotateCcw, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import orderApi from "@/api/orderApi";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useCartStore } from "@/stores/useCartStore";
import ReviewModal from "@/features/reviews/components/ReviewModal";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "DELIVERING", "COMPLETED"];

const OrderDetailModal = ({ orderId, onClose, onOrderUpdated }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRebuying, setIsRebuying] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmReceiveOpen, setIsConfirmReceiveOpen] = useState(false);
  
  // Review state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  const addToCart = useCartStore((state) => state.addToCart);
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await orderApi.getOrderById(orderId);
        if (response && response.success) {
          setOrder(response.data);
        }
      } catch (error) {
        toast.error(t("history:fetch_order_error"));
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderId, onClose, t]);

  const handleCancelOrderClick = () => {
    setIsConfirmModalOpen(true);
  };

  const executeCancelOrder = async () => {
    setIsConfirmModalOpen(false);
    setIsCancelling(true);
    try {
      const response = await orderApi.cancelOrder(orderId);
      if (response && response.success) {
        toast.success(t("history:cancel_success"));
        setOrder(response.data);
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (error) {
      toast.error(t("history:cancel_error"));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReceiveClick = () => {
    setIsConfirmReceiveOpen(true);
  };

  const executeReceiveOrder = async () => {
    setIsConfirmReceiveOpen(false);
    setIsReceiving(true);
    try {
      const response = await orderApi.receiveOrder(orderId);
      if (response && response.success) {
        toast.success(t("history:receive_success"));
        setOrder(response.data);
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (error) {
      toast.error(t("history:receive_error"));
    } finally {
      setIsReceiving(false);
    }
  };

  const handleRebuy = async () => {
    setIsRebuying(true);
    try {
      let successCount = 0;
      for (const item of order.items) {
        // item.product has been populated
        if (item.product && item.product.stock > 0) {
          await addToCart(item.product, item.quantity, { silent: true });
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(t("history:rebuy_success"));
        setCartOpen(true);
        onClose();
      } else {
        toast.error(t("history:rebuy_out_of_stock"));
      }
    } catch (error) {
      toast.error(t("history:rebuy_error"));
    } finally {
      setIsRebuying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-4">
        <Loader2 className="w-10 h-10 text-mkhe-primary animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const isCancelled = order.orderStatus === "CANCELLED";
  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--color-mkhe-bg)] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--color-mkhe-border)]/20 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-mkhe-border)]/10">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-mkhe-text)] flex items-center gap-2">
              <Package className="w-6 h-6 text-mkhe-primary" />
              {t("history:order_detail", { defaultValue: "Chi tiết đơn hàng" })}
            </h2>
            <p className="text-sm text-[var(--color-mkhe-text)]/50 mt-1">
              {t("history:order_code", { defaultValue: "Mã đơn" })}: <span className="font-semibold text-[var(--color-mkhe-text)]">{order.orderCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-mkhe-input)] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-[var(--color-mkhe-text)]/50" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* Stepper Timeline */}
          <div className="mb-8">
            <h3 className="font-bold text-[var(--color-mkhe-text)] mb-4">{t("history:order_status", { defaultValue: "Trạng thái đơn hàng" })}</h3>
            {isCancelled ? (
              <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3 font-semibold">
                <X className="w-6 h-6" />
                {t("history:status_cancelled", { defaultValue: "Đơn hàng đã bị hủy" })}
              </div>
            ) : (
              <div className="relative z-0 flex justify-between items-center w-full max-w-xl mx-auto mt-6 mb-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--color-mkhe-border)]/20 -z-10 rounded-full"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-mkhe-primary -z-10 rounded-full transition-all duration-500"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
                ></div>

                {STATUS_STEPS.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  const labels = [t("history:status_pending", { defaultValue: "Chờ xác nhận" }), t("history:status_confirmed", { defaultValue: "Đã xác nhận" }), t("history:status_delivering", { defaultValue: "Đang giao" }), t("history:status_completed", { defaultValue: "Hoàn thành" })];
                  
                  return (
                    <div key={step} className="flex flex-col items-center gap-2 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${
                        isActive 
                          ? "bg-mkhe-primary text-white shadow-md shadow-mkhe-primary/30" 
                          : "bg-[var(--color-mkhe-input)] text-[var(--color-mkhe-text)]/40 border border-[var(--color-mkhe-border)]/20"
                      }`}>
                        {isActive ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>
                      <span className={`text-xs absolute top-10 whitespace-nowrap font-medium ${
                        isActive ? "text-mkhe-primary" : "text-[var(--color-mkhe-text)]/40"
                      }`}>
                        {labels[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-12">
            {/* Shipping Info */}
            <div className="bg-[var(--color-mkhe-input)]/50 p-5 rounded-2xl border border-[var(--color-mkhe-border)]/10">
              <h3 className="font-bold text-[var(--color-mkhe-text)] flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-mkhe-primary" />
                {t("checkout:shipping_info.title", { defaultValue: "Thông tin giao hàng" })}
              </h3>
              <div className="space-y-2 text-sm text-[var(--color-mkhe-text)]/80">
                <p><span className="font-semibold">{order.shippingInfo.name}</span></p>
                <p>{order.shippingInfo.phone}</p>
                <p className="opacity-70">{order.shippingInfo.address}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-[var(--color-mkhe-input)]/50 p-5 rounded-2xl border border-[var(--color-mkhe-border)]/10">
              <h3 className="font-bold text-[var(--color-mkhe-text)] flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-mkhe-primary" />
                {t("checkout:payment_method.title", { defaultValue: "Phương thức thanh toán" })}
              </h3>
              <div className="space-y-2 text-sm text-[var(--color-mkhe-text)]/80">
                <p>{order.paymentMethod === "COD" ? t("checkout:payment_method.cod", { defaultValue: "Thanh toán khi nhận hàng (COD)" }) : t("checkout:payment_method.bank_transfer", { defaultValue: "Chuyển khoản ngân hàng" })}</p>
                <p className="mt-2 font-semibold flex items-center gap-2">
                  {t("history:payment_status", { defaultValue: "Trạng thái" })}: 
                  <span className={order.paymentStatus === "PAID" ? "text-green-500" : "text-amber-500"}>
                    {order.paymentStatus === "PAID" ? t("history:payment_paid", { defaultValue: "Đã thanh toán" }) : t("history:payment_unpaid", { defaultValue: "Chưa thanh toán" })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {order.note && (
            <div className="bg-[var(--color-mkhe-input)]/50 p-5 rounded-2xl border border-[var(--color-mkhe-border)]/10 mb-8">
              <h3 className="font-bold text-[var(--color-mkhe-text)] flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-mkhe-primary" />
                {t("history:note", { defaultValue: "Ghi chú đơn hàng" })}
              </h3>
              <p className="text-sm text-[var(--color-mkhe-text)]/80 italic">{order.note}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="font-bold text-[var(--color-mkhe-text)] mb-4">{t("checkout:summary.title", { defaultValue: "Đơn hàng" })}</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[var(--color-mkhe-input)]/30 rounded-xl border border-[var(--color-mkhe-border)]/5">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-lg bg-[var(--color-mkhe-bg)] overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image || "https://placehold.co/100x100?text=No+Image"} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Image"; }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-[var(--color-mkhe-text)] line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-[var(--color-mkhe-text)]/50 mt-1">{t("history:quantity", { defaultValue: "Số lượng" })}: {item.quantity}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-[var(--color-mkhe-border)]/10 sm:border-0">
                    <div className="font-bold text-mkhe-primary text-sm">
                      {formatMoney(item.price * item.quantity)}
                    </div>
                    
                    {order.orderStatus === "COMPLETED" && (
                      item.isReviewed ? (
                        <div className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--color-mkhe-border)]/20 text-[var(--color-mkhe-text)]/40 bg-[var(--color-mkhe-input)]/50 cursor-not-allowed">
                          {t("history:already_reviewed", { defaultValue: "Đã đánh giá" })}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReviewItem(item);
                            setIsReviewModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-mkhe-primary text-mkhe-primary hover:bg-mkhe-primary/10 transition-colors cursor-pointer"
                        >
                          {t("history:write_review", { defaultValue: "Đánh giá sản phẩm" })}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--color-mkhe-border)]/10 space-y-2 text-sm">
              <div className="flex justify-between text-[var(--color-mkhe-text)]/70">
                <span>{t("history:subtotal", { defaultValue: "Tạm tính" })}</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-mkhe-text)]/70">
                <span>{t("history:shipping_fee", { defaultValue: "Phí vận chuyển" })}</span>
                <span>{formatMoney(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>{t("history:discount", { defaultValue: "Giảm giá" })} {order.voucherCode ? `(${order.voucherCode})` : ""}</span>
                  <span>-{formatMoney(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-[var(--color-mkhe-border)]/10">
                <span className="text-[var(--color-mkhe-text)]">{t("history:total", { defaultValue: "Tổng cộng" })}</span>
                <span className="text-mkhe-primary">{formatMoney(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[var(--color-mkhe-border)]/10 bg-[var(--color-mkhe-input)]/20 flex items-center justify-end gap-3">
          {order.orderStatus === "PENDING" && (
            <button
              onClick={handleCancelOrderClick}
              disabled={isCancelling}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isCancelling ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t("history:cancel_btn", { defaultValue: "Hủy đơn hàng" })}
            </button>
          )}

          {order.orderStatus === "DELIVERING" && (
            <button
              onClick={handleReceiveClick}
              disabled={isReceiving}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer border border-green-500/30"
            >
              {isReceiving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t("history:receive_btn", { defaultValue: "Đã nhận được hàng" })}
                </>
              )}
            </button>
          )}

          <button
            onClick={handleRebuy}
            disabled={isRebuying}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-mkhe-primary text-white hover:brightness-110 shadow-lg shadow-mkhe-primary/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isRebuying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                {t("history:rebuy_btn", { defaultValue: "Mua lại" })}
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onConfirm={executeCancelOrder}
        onCancel={() => setIsConfirmModalOpen(false)}
        title={t("history:cancel_btn", { defaultValue: "Hủy đơn hàng" })}
        message={t("history:confirm_cancel", { defaultValue: "Bạn có chắc chắn muốn hủy đơn hàng này không?" })}
        confirmText={t("history:cancel_btn", { defaultValue: "Hủy đơn hàng" })}
        cancelText={t("common:cancel", { defaultValue: "Hủy" })}
        icon="alert"
        isDanger={true}
      />

      <ConfirmModal
        isOpen={isConfirmReceiveOpen}
        onConfirm={executeReceiveOrder}
        onCancel={() => setIsConfirmReceiveOpen(false)}
        title={t("history:receive_btn", { defaultValue: "Đã nhận được hàng" })}
        message={t("history:confirm_receive", { defaultValue: "Xác nhận bạn đã nhận được hàng và sản phẩm không có vấn đề gì?" })}
        confirmText={t("history:confirm_btn", { defaultValue: "Đồng ý" })}
        cancelText={t("common:back", { defaultValue: "Trở lại" })}
        icon="check"
      />

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewItem(null);
        }}
        orderId={order._id}
        item={reviewItem}
        onSuccess={() => {
          setOrder(prev => {
            if (!prev || !reviewItem) return prev;
            return {
              ...prev,
              items: prev.items.map(i => i._id === reviewItem._id ? { ...i, isReviewed: true } : i)
            };
          });
        }}
      />
    </div>
  );
};

export default OrderDetailModal;
