import { X, Package, CheckCircle2, Clock, XCircle, AlertCircle, MessageSquare, HelpCircle, ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const UserReturnDetailModal = ({ returnRequest, onClose }) => {
  const { t } = useTranslation("history");
  if (!returnRequest) return null;

  const isRejected = returnRequest.status === "REJECTED";
  const RETURN_STEPS = ["PENDING", "APPROVED"];
  const currentStepIndex = returnRequest.status === "APPROVED" ? 1 : 0;

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--color-mkhe-bg)] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--color-mkhe-border)]/20 animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-mkhe-border)]/30">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-mkhe-text)] flex items-center gap-2">
              <Package className="w-6 h-6 text-mkhe-primary" />
              {t("returns.detail_title", { defaultValue: "Chi tiết Đổi/Trả" })}
            </h2>
            <p className="text-sm text-[var(--color-mkhe-text)]/50 mt-1">
              {t("returns.order_code", { defaultValue: "Mã đơn" })}: <span className="font-semibold text-[var(--color-mkhe-text)]">{returnRequest.order?.orderCode}</span>
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
            <h3 className="font-bold text-[var(--color-mkhe-text)] mb-4">{t("returns.detail_status", { defaultValue: "Trạng thái" })}</h3>
            {isRejected ? (
              <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl flex items-center gap-3 font-semibold">
                <XCircle className="w-6 h-6" />
                {t("returns.status.REJECTED", { defaultValue: "Đã từ chối" })}
              </div>
            ) : (
              <div className="relative z-0 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full max-w-xl mx-auto mt-2 sm:mt-6 mb-4 sm:mb-2 gap-8 sm:gap-0 px-4 sm:px-0">
                {/* Horizontal progress bar for desktop */}
                <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--color-mkhe-border)]/20 -z-10 rounded-full"></div>
                <div 
                  className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-mkhe-primary -z-10 rounded-full transition-all duration-500"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (RETURN_STEPS.length - 1)) * 100}%` }}
                ></div>

                {/* Vertical progress bar for mobile */}
                <div className="sm:hidden absolute left-[32px] top-4 bottom-4 w-1 -translate-x-1/2 -z-10">
                  <div className="absolute inset-0 bg-[var(--color-mkhe-border)]/20 rounded-full"></div>
                  <div 
                    className="absolute top-0 left-0 w-full bg-mkhe-primary rounded-full transition-all duration-500"
                    style={{ height: `${(Math.max(0, currentStepIndex) / (RETURN_STEPS.length - 1)) * 100}%` }}
                  ></div>
                </div>

                {RETURN_STEPS.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  const labels = [t("returns.status.PENDING", { defaultValue: "Chờ xử lý" }), t("returns.status.APPROVED", { defaultValue: "Đã duyệt" })];
                  
                  return (
                    <div key={step} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 relative">
                      <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${
                        isActive 
                          ? "bg-mkhe-primary text-white shadow-md shadow-mkhe-primary/30" 
                          : "bg-[var(--color-mkhe-input)] text-[var(--color-mkhe-text)]/40 border border-[var(--color-mkhe-border)]/20"
                      }`}>
                        {isActive ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>
                      <span className={`text-sm sm:text-xs sm:absolute sm:top-10 whitespace-nowrap font-medium ${
                        isActive ? "text-mkhe-primary" : "text-[var(--color-mkhe-text)]/40"
                      }`}>
                        {labels[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {returnRequest.adminNote && (
              <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-600">
                <MessageSquare className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">
                    {t("returns.admin_note")}:
                  </p>
                  <p className="text-sm italic">
                    "{returnRequest.adminNote}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-bold text-[var(--color-mkhe-text)] mb-4">{t("returns.items_title")}</h3>
            <div className="space-y-4">
              {returnRequest.items.map((item, index) => (
                <div key={index} className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--color-mkhe-input)]/20 border border-[var(--color-mkhe-primary)]/30 hover:border-mkhe-primary/60 transition-colors group">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-[var(--color-mkhe-bg)] rounded-lg overflow-hidden border border-[var(--color-mkhe-border)]/10 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-mkhe-text)]/20">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col py-1">
                      <p className="font-semibold text-[var(--color-mkhe-text)] text-sm sm:text-base line-clamp-2">{item.name}</p>
                      <div className="mt-auto flex justify-between items-end">
                        <p className="text-sm text-[var(--color-mkhe-text)]/60">
                          {t("returns.return_quantity")}: <span className="font-medium text-[var(--color-mkhe-text)]">{item.quantity}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Reason */}
                    <div className="bg-[var(--color-mkhe-input)]/40 p-4 rounded-xl border border-[var(--color-mkhe-primary)]/30">
                      <h4 className="text-xs font-bold text-[var(--color-mkhe-text)]/70 flex items-center gap-1.5 mb-2">
                        <HelpCircle className="w-4 h-4 text-mkhe-primary" />
                        {t("returns.reason_label")}
                      </h4>
                      <p className="text-sm text-[var(--color-mkhe-text)]/90 italic">{item.reason}</p>
                    </div>
                    
                    {/* Proof Images */}
                    {item.proofImages && item.proofImages.length > 0 && (
                      <div className="bg-[var(--color-mkhe-input)]/40 p-4 rounded-xl border border-[var(--color-mkhe-primary)]/30">
                        <h4 className="text-xs font-bold text-[var(--color-mkhe-text)]/70 flex items-center gap-1.5 mb-2">
                          <ImageIcon className="w-4 h-4 text-mkhe-primary" />
                          {t("returns.create.upload_proof", { defaultValue: "Hình ảnh/Video" })}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.proofImages.map((img, i) => {
                            const isVideo = img.endsWith('.mp4') || img.endsWith('.webm') || img.endsWith('.mov');
                            return isVideo ? (
                              <video 
                                key={i} 
                                src={img} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                ref={(el) => { if (el) el.play().catch(e => console.log('Autoplay blocked:', e)); }}
                                className="w-14 h-14 rounded-lg object-cover border border-[var(--color-mkhe-border)]/20 bg-black/5 pointer-events-none" 
                              />
                            ) : (
                              <img key={i} src={img} alt={`Proof ${i}`} className="w-14 h-14 rounded-lg object-cover border border-[var(--color-mkhe-border)]/20 bg-black/5" />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserReturnDetailModal;
