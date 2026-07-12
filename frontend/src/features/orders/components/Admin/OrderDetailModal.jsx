import {  useState, useEffect  } from "react";
import { X, MapPin, Phone, User, Package, MessageSquare } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function OrderDetailModal({ isOpen, onClose, order, onStatusChange }) {
  const { t } = useTranslation();
  const [localStatus, setLocalStatus] = useState("");
  const [localPaymentStatus, setLocalPaymentStatus] = useState("");

  useEffect(() => {
    if (order) {
      setLocalStatus(order.orderStatus);
      setLocalPaymentStatus(order.paymentStatus || "UNPAID");
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSave = () => {
    if (order.paymentMethod === "BANK_TRANSFER" && localPaymentStatus === "UNPAID") {
      if (["CONFIRMED", "DELIVERING", "COMPLETED"].includes(localStatus)) {
        toast.error(t("admin:orders.error_vietqr_unpaid"));
        return;
      }
    }

    if (localStatus === "COMPLETED" && localPaymentStatus === "UNPAID") {
      toast.error(t("admin:orders.error_completed_unpaid"));
      return;
    }

    onStatusChange(order._id, localStatus, localPaymentStatus);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "!bg-yellow-500/10 !text-yellow-600 !border-yellow-500/30";
      case "CONFIRMED": return "!bg-blue-500/10 !text-blue-600 !border-blue-500/30";
      case "DELIVERING": return "!bg-indigo-500/10 !text-indigo-600 !border-indigo-500/30";
      case "COMPLETED": return "!bg-emerald-500/10 !text-emerald-600 !border-emerald-500/30";
      case "CANCELLED": return "!bg-rose-500/10 !text-rose-600 !border-rose-500/30";
      default: return "!bg-gray-500/10 !text-gray-600 !border-gray-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* OVERLAY */}
      <div 
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />
      
      {/* MODAL CONTENT */}
      <div className="relative bg-mkhe-bg w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-mkhe-border/30 bg-mkhe-bg">
          <div>
            <h2 className="text-xl font-bold text-gradient-gold">{t("admin:orders.detail_title", { defaultValue: "Chi Tiết Đơn Hàng" })}</h2>
            <p className="text-sm text-mkhe-text/60 mt-1">{t("admin:orders.table_id", { defaultValue: "Mã đơn" })}: <span className="font-semibold text-mkhe-text">{order.orderCode}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-mkhe-border/20 rounded-full transition-colors cursor-pointer text-mkhe-text/60 hover:text-mkhe-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 text-mkhe-text bg-mkhe-bg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* THÔNG TIN KHÁCH HÀNG */}
            <div className="bg-mkhe-input/50 p-4 rounded-lg border border-mkhe-border/20 shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-mkhe-text/80">
                <User className="w-4 h-4" /> {t("checkout:shipping_info.title", { defaultValue: "Thông tin giao hàng" })}
              </h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><User className="w-4 h-4 text-mkhe-text/40"/> <span className="font-medium">{order.shippingInfo.name}</span></p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-mkhe-text/40"/> <span>{order.shippingInfo.phone}</span></p>
                <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-mkhe-text/40 mt-0.5 shrink-0"/> <span className="leading-relaxed">{order.shippingInfo.address}</span></p>
              </div>
            </div>

            {/* TRẠNG THÁI & HÀNH ĐỘNG */}
            <div className="bg-mkhe-input/50 p-4 rounded-lg border border-mkhe-border/20 shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-mkhe-text/80">
                <Package className="w-4 h-4" /> {t("history:order_status", { defaultValue: "Trạng thái đơn hàng" })}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-mkhe-text/60 mb-1">{t("admin:orders.table_date", { defaultValue: "Ngày đặt" })}:</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                
                <div>
                  <p className="text-sm text-mkhe-text/60 mb-1">{t("admin:orders.payment_method", { defaultValue: "Thanh toán" })}:</p>
                  <p className="font-medium text-sm text-mkhe-text">
                    {order.paymentMethod === "COD" ? t("checkout:payment_method.cod", { defaultValue: "Thanh toán khi nhận hàng (COD)" }) : 
                     order.paymentMethod === "BANK_TRANSFER" ? t("checkout:payment_method.bank_transfer", { defaultValue: "Chuyển khoản (VietQR)" }) : 
                     order.paymentMethod || "Chưa xác định"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-mkhe-text/70">{t("admin:orders.payment_status", { defaultValue: "Trạng thái thanh toán" })}:</span>
                    <Dropdown 
                      value={localPaymentStatus}
                      options={[
                        { value: "UNPAID", label: t("admin:orders.unpaid", { defaultValue: "Chưa thanh toán" }), color: "text-amber-500" },
                        { value: "PAID", label: t("admin:orders.paid", { defaultValue: "Đã thanh toán" }), color: "text-emerald-600" }
                      ]}
                      onChange={(val) => {
                        setLocalPaymentStatus(val);
                        if (val === "UNPAID" && ["CONFIRMED", "DELIVERING", "COMPLETED"].includes(localStatus)) {
                          setLocalStatus("PENDING");
                        }
                      }}
                      placeholder="Chọn trạng thái"
                      className={`w-48 ${
                        order.orderStatus === "CANCELLED" || 
                        order.orderStatus === "COMPLETED" || 
                        (order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "PAID") 
                          ? "pointer-events-none opacity-60" 
                          : ""
                      }`}
                      triggerClassName="h-8 px-2 rounded font-bold text-sm bg-mkhe-input border-mkhe-border/50"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-mkhe-text/60 mb-1">{t("admin:orders.table_status", { defaultValue: "Cập nhật trạng thái" })}:</p>
                  <Dropdown 
                    value={localStatus}
                    options={[
                      { value: "PENDING", label: t("admin:orders.status_pending", { defaultValue: "PENDING" }) },
                      { value: "CONFIRMED", label: t("admin:orders.status_confirmed", { defaultValue: "CONFIRMED" }), disabled: order.paymentMethod === "BANK_TRANSFER" && localPaymentStatus === "UNPAID" },
                      { value: "DELIVERING", label: t("admin:orders.status_delivering", { defaultValue: "DELIVERING" }), disabled: order.paymentMethod === "BANK_TRANSFER" && localPaymentStatus === "UNPAID" },
                      { value: "COMPLETED", label: t("admin:orders.status_completed", { defaultValue: "COMPLETED" }), disabled: order.paymentMethod === "BANK_TRANSFER" && localPaymentStatus === "UNPAID" },
                      { value: "CANCELLED", label: t("admin:orders.status_cancelled", { defaultValue: "CANCELLED" }) },
                    ]}
                    onChange={(val) => {
                      setLocalStatus(val);
                      if (val === "COMPLETED") {
                        setLocalPaymentStatus("PAID");
                      }
                    }}
                    placeholder="Chọn trạng thái"
                    className={`w-full ${order.orderStatus === "CANCELLED" || order.orderStatus === "COMPLETED" ? "pointer-events-none opacity-60" : ""}`}
                    triggerClassName={`h-10 px-3 rounded font-bold border-mkhe-border/50 ${getStatusColor(localStatus)}`}
                    optionClassName="text-sm font-semibold"
                  />
                  {(order.orderStatus === "CANCELLED" || order.orderStatus === "COMPLETED") && (
                    <p className="text-xs text-rose-500/80 mt-1 italic">Trạng thái này không thể thay đổi nữa.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {order.note && (
            <div className="mb-6 p-4 bg-mkhe-primary/5 border border-mkhe-primary/20 rounded-lg">
              <p className="text-sm font-semibold text-mkhe-primary mb-1 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> {t("history:note", { defaultValue: "Ghi chú của khách hàng" })}:
              </p>
              <p className="text-sm italic text-mkhe-text/80 leading-relaxed">{order.note}</p>
            </div>
          )}

          {/* DANH SÁCH SẢN PHẨM */}
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-mkhe-text/80">
            <Package className="w-4 h-4" /> {t("history:products", { defaultValue: "Sản phẩm" })} ({order.items.length})
          </h3>
          <div className="bg-mkhe-input/30 rounded-lg border border-mkhe-border/20 overflow-hidden mb-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-mkhe-border/10 text-mkhe-text/70">
                <tr>
                  <th className="p-3 font-semibold">{t("history:product_name", { defaultValue: "Tên sản phẩm" })}</th>
                  <th className="p-3 font-semibold text-center w-24">{t("history:quantity", { defaultValue: "SL" })}</th>
                  <th className="p-3 font-semibold text-right w-32">{t("history:price", { defaultValue: "Đơn giá" })}</th>
                  <th className="p-3 font-semibold text-right w-32">{t("history:total", { defaultValue: "Thành tiền" })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mkhe-border/20">
                {order.items.map((item) => (
                  <tr key={item._id} className="hover:bg-mkhe-primary/5 transition-colors">
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded border border-mkhe-border/30" />
                        )}
                        <span className="line-clamp-2">
                          {item.name}
                          {item.color && (
                            <span className="block text-xs text-mkhe-text/60 mt-0.5">
                              {t("history:color", { defaultValue: "Màu sắc:" })} {item.color}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">{item.price.toLocaleString()}đ</td>
                    <td className="p-3 text-right font-medium text-mkhe-primary">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TỔNG KẾT */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 bg-mkhe-input/50 p-4 rounded-lg border border-mkhe-border/20">
              <div className="space-y-2 text-sm text-mkhe-text/80">
                <div className="flex justify-between">
                  <span>{t("history:subtotal", { defaultValue: "Tạm tính" })}:</span>
                  <span>{order.subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("history:shipping_fee", { defaultValue: "Phí vận chuyển" })}:</span>
                  <span>{order.shippingFee.toLocaleString()}đ</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{t("history:discount", { defaultValue: "Giảm giá" })}:</span>
                    <span>-{order.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="h-px bg-mkhe-border/30 my-2"></div>
                <div className="flex justify-between items-center text-lg font-bold text-mkhe-text">
                  <span>{t("history:total", { defaultValue: "Tổng cộng" })}:</span>
                  <span className="text-mkhe-primary flex items-center gap-1">
                    {order.totalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-mkhe-border/30 bg-mkhe-input/30 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all disabled:opacity-50 text-sm cursor-pointer"
          >
            {t("common.cancel", { defaultValue: "Hủy" })}
          </button>
          <Button 
            onClick={handleSave}
            disabled={(localStatus === order.orderStatus && localPaymentStatus === order.paymentStatus) || order.orderStatus === "CANCELLED" || order.orderStatus === "COMPLETED"}
            className="!w-auto px-8 py-2.5 rounded-xl text-sm"
          >
            {t("admin:orders.save", { defaultValue: "Lưu thay đổi" })}
          </Button>
        </div>
      </div>
    </div>
  );
}
