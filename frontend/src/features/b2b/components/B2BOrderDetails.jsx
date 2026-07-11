import {  useState, useEffect  } from "react";
import { useTranslation } from "react-i18next";
import { Download, CheckCircle, Clock, Check, Truck, Settings, Package, Loader2, ChevronLeft, PhoneCall, Mail, User, FileText, Image as ImageIcon, Wallet, Calendar, Hash } from "lucide-react";
import { confirmB2BOrderApi } from "@/api/b2bApi";
import toast from "react-hot-toast";
import { formatCurrency } from "@/utils/formatters";

const STATUS_STEPS = [
  { id: "PENDING_QUOTE", icon: Clock },
  { id: "NEGOTIATING", icon: Settings },
  { id: "CONFIRMED", icon: CheckCircle },
  { id: "PRODUCING", icon: Package },
  { id: "DELIVERING", icon: Truck },
  { id: "COMPLETED", icon: Check }
];

const B2BOrderDetails = ({ order, onBack, onUpdateOrder }) => {
  const { t } = useTranslation(["b2b", "common"]);
  const [isConfirming, setIsConfirming] = useState(false);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleConfirmOrder = async () => {
    if (!window.confirm(t("b2b:confirm_msg", { defaultValue: "Xác nhận chốt đơn hàng và đồng ý với báo giá này?" }))) return;
    setIsConfirming(true);
    try {
      const res = await confirmB2BOrderApi(order._id);
      if (res.success) {
        toast.success(t("b2b:status.CONFIRMED", { defaultValue: "Đã chốt hợp đồng thành công!" }));
        onUpdateOrder(order._id, res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("b2b:messages.error", { defaultValue: "Có lỗi xảy ra" }));
    } finally {
      setIsConfirming(false);
    }
  };

  const getStepIndex = (status) => {
    return STATUS_STEPS.findIndex((s) => s.id === status);
  };
  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="bg-mkhe-bg rounded-xl border border-mkhe-border/30 overflow-hidden flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-mkhe-border/30 flex justify-between items-center bg-mkhe-primary/5">
        <div>
          <button onClick={onBack} className="text-mkhe-primary text-sm font-bold mb-2 flex items-center gap-1 hover:underline cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            {t("common:back", { defaultValue: "Trở lại" })}
          </button>
          <h2 className="text-xl font-bold text-mkhe-text">
            {order.productOrService?.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-2 bg-mkhe-bg text-mkhe-text px-3 py-1.5 rounded-lg border border-mkhe-primary/20 shadow-sm">
              <Hash className="w-4 h-4 text-mkhe-primary" />
              <span className="text-sm font-medium">Số lượng: <strong className="font-bold text-mkhe-primary ml-1">{order.quantity}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-mkhe-bg text-mkhe-text px-3 py-1.5 rounded-lg border border-mkhe-primary/20 shadow-sm">
              <Wallet className="w-4 h-4 text-mkhe-primary" />
              <span className="text-sm font-medium">Ngân sách: <strong className="font-bold text-mkhe-primary ml-1">{formatCurrency(order.budget)}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-mkhe-bg text-mkhe-text px-3 py-1.5 rounded-lg border border-mkhe-primary/20 shadow-sm">
              <Calendar className="w-4 h-4 text-mkhe-primary" />
              <span className="text-sm font-medium">Giao hàng: <strong className="font-bold text-mkhe-primary ml-1">{new Date(order.deliveryDate).toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="p-6 border-b border-mkhe-border/10 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= currentStepIndex || order.status === "COMPLETED";
            return (
              <div key={step.id} className="flex flex-col items-center relative flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors duration-500 ${isActive ? 'bg-mkhe-primary text-white shadow-md shadow-mkhe-primary/30' : 'bg-mkhe-bg border-2 border-mkhe-border/20 text-mkhe-text/40'}`}>
                  {index + 1}
                </div>
                <span className={`text-[11px] uppercase font-bold mt-2 text-center transition-colors duration-500 ${isActive ? 'text-mkhe-primary' : 'text-mkhe-text/40'}`}>
                  {t(`b2b:status.${step.id}`, { defaultValue: step.id })}
                </span>
                {index < STATUS_STEPS.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-1 -z-10 transition-colors duration-500 ${index < currentStepIndex || order.status === "COMPLETED" ? 'bg-mkhe-primary' : 'bg-mkhe-border/20'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cột trái: Thông tin chính + File đính kèm + Báo giá */}
        <div className="md:col-span-2 space-y-6">
          
          {/* File đính kèm từ khách hàng */}
          <div className="bg-mkhe-bg border border-mkhe-border/20 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-mkhe-text mb-4 text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-mkhe-primary" /> File / Ý tưởng đính kèm của bạn
            </h3>
            {order.designFiles && order.designFiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {order.designFiles.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative aspect-square rounded-lg border border-mkhe-border/30 overflow-hidden hover:border-mkhe-primary transition-colors group cursor-pointer">
                    {/* Giả lập ảnh thu nhỏ nếu url là ảnh, hoặc chỉ hiện icon file */}
                    {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={url} alt={`file-${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-mkhe-primary/5 text-mkhe-primary">
                        <FileText className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium text-center px-2">Tài liệu đính kèm</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-mkhe-primary px-3 py-1 rounded-full shadow-lg">Xem chi tiết</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-mkhe-text/50 italic">Không có file đính kèm nào được tải lên từ phía bạn.</p>
            )}
          </div>

          {/* Báo giá và Nút Chốt đơn */}
          <div className="bg-mkhe-primary/5 border border-mkhe-primary/20 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-mkhe-text mb-2 text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-mkhe-primary" /> Báo giá & Hợp đồng (Từ MKHE)
            </h3>
            
            {order.quotePdfUrl ? (
              <div className="mt-4">
                <p className="text-sm text-mkhe-text/70 mb-5">
                  Đội ngũ MKHE đã gửi báo giá chính thức cho yêu cầu của bạn. Vui lòng xem kỹ thông tin và nhấn <strong>"Xác nhận chốt đơn"</strong> nếu bạn đồng ý tiến hành.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <a href={order.quotePdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold bg-mkhe-bg text-mkhe-primary border-2 border-mkhe-primary px-6 py-3 rounded-lg justify-center hover:bg-mkhe-primary/10 transition-colors w-full sm:w-auto">
                    <Download className="w-5 h-5" /> TẢI BÁO GIÁ / HỢP ĐỒNG
                  </a>
                  
                  {order.status === "NEGOTIATING" && (
                    <button
                      onClick={handleConfirmOrder}
                      disabled={isConfirming}
                      className="flex-1 w-full sm:w-auto px-6 py-3 bg-mkhe-primary text-white rounded-lg font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base cursor-pointer"
                    >
                      {isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                      XÁC NHẬN CHỐT ĐƠN
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-2 p-4 bg-mkhe-bg rounded-lg text-center border border-dashed border-mkhe-primary/30">
                <p className="text-sm text-mkhe-text/60">
                  MKHE đang trong quá trình khảo sát và lập báo giá. File báo giá chính thức sẽ hiển thị tại đây khi hoàn tất.
                </p>
              </div>
            )}
          </div>
          
        </div>

        {/* Cột phải: Thông tin liên hệ + Note */}
        <div className="space-y-6">
          {/* Contact Box */}
          <div className="bg-mkhe-bg border border-mkhe-border/20 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-mkhe-text mb-4 text-base flex items-center gap-2">
              <User className="w-5 h-5 text-mkhe-primary" /> Thông tin liên hệ
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mkhe-primary/10 flex items-center justify-center text-mkhe-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-mkhe-text/50">Trưởng nhóm B2B</p>
                  <p className="font-bold text-mkhe-text text-sm">Anh Bảo</p>
                </div>
              </div>
              <div className="space-y-2 mt-4 pt-4 border-t border-mkhe-border/10">
                <a href="tel:0901234567" className="flex items-center gap-3 text-sm font-medium text-mkhe-text hover:text-mkhe-primary transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-mkhe-bg border border-mkhe-border/30 flex items-center justify-center">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </div>
                  0901 234 567
                </a>
                <a href="mailto:b2b@mkhe.vn" className="flex items-center gap-3 text-sm font-medium text-mkhe-text hover:text-mkhe-primary transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-mkhe-bg border border-mkhe-border/30 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  b2b@mkhe.vn
                </a>
              </div>
              <p className="text-[11px] text-mkhe-text/50 italic mt-3 leading-relaxed">
                Quý đối tác vui lòng liên hệ trực tiếp qua SĐT hoặc Email trên để trao đổi chi tiết về thiết kế, giá cả và hợp đồng.
              </p>
            </div>
          </div>

          {/* Details Box */}
          <div className="bg-mkhe-bg border border-mkhe-border/20 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-mkhe-text mb-4 text-base">Ghi chú & Yêu cầu</h3>
            <div className="space-y-4">
               <div>
                 <p className="text-xs text-mkhe-text/50 mb-1">Quy cách đóng gói</p>
                 <p className="font-medium text-sm px-3 py-1.5 bg-mkhe-primary/5 rounded border border-mkhe-primary/10 inline-block">{order.packagingRequirement || "Tiêu chuẩn MKHE"}</p>
               </div>
               <div>
                 <p className="text-xs text-mkhe-text/50 mb-1">Ghi chú bổ sung</p>
                 <div className="text-sm bg-mkhe-bg border border-mkhe-border/20 rounded-lg p-3 whitespace-pre-wrap min-h-[80px]">
                   {order.note || <span className="text-mkhe-text/40 italic">Không có ghi chú thêm.</span>}
                 </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default B2BOrderDetails;
