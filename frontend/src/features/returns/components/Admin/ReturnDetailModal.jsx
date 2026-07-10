import { useState, useRef, useMemo } from "react";
import { X, Loader2, MessageSquare, Image as ImageIcon, Play } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import returnApi from "@/api/returnApi";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";

const ReturnDetailModal = ({ returnRequest, onClose, onSuccess }) => {
  const { t } = useTranslation("admin");
  const adminNoteRef = useRef(returnRequest.adminNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmData, setConfirmData] = useState(null); // { status, actionName }
  const [previewMedia, setPreviewMedia] = useState(null);

  const isVideo = (url) => {
    return url && url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  const handleAction = async (status) => {
    const currentNote = adminNoteRef.current;
    if (!currentNote.trim()) {
      toast.error(t("returns.error_empty_note"), { icon: '⚠️' });
      return;
    }
    
    setIsSubmitting(true);
    setConfirmData(null);

    const updatePromise = returnApi.updateReturnStatus(returnRequest._id, {
      status,
      adminNote: currentNote
    });

    toast.promise(updatePromise, {
      loading: "Đang xử lý...", // Internal toast message
      success: t("returns.update_success"),
      error: (err) => err.response?.data?.message || "Có lỗi xảy ra"
    });

    try {
      const res = await updatePromise;
      if (res.success) {
        onSuccess();
      }
    } catch (error) {
      // Error handled by toast.promise
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = returnRequest.status === "PENDING";

  const modalContent = useMemo(() => {
    return (
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col lg:flex-row gap-6">
        
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="font-bold text-[var(--color-mkhe-text)] mb-3">{t("returns.items_title")}</h3>
            <div className="space-y-4">
              {returnRequest.items.map(item => (
                <div key={item._id} className="border border-[var(--color-mkhe-primary)]/20 shadow-sm shadow-[var(--color-mkhe-primary)]/5 rounded-xl p-4 bg-[var(--color-mkhe-input)]/20">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-[var(--color-mkhe-bg)] overflow-hidden flex-shrink-0 border border-[var(--color-mkhe-border)]/20">
                      <img 
                        src={item.image || item.product?.image || null} 
                        alt={item.name || item.product?.name} 
                        className="w-full h-full object-cover bg-gray-200"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-[var(--color-mkhe-text)]">{item.name}</h4>
                      <p className="text-xs text-[var(--color-mkhe-text)]/50 mt-1">{t("returns.return_quantity")}: <span className="font-bold text-[var(--color-mkhe-text)]">{item.quantity}</span></p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> {t("returns.reason_label")}:
                    </p>
                    <div className="w-full px-4 py-3 bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/20 rounded-xl text-sm text-[var(--color-mkhe-text)]/80 italic whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar break-all">
                      {item.reason}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" /> {t("returns.proof_images")}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.proofImages.map((img, i) => (
                        <div 
                          key={i} 
                          className="w-16 h-16 rounded-lg border border-[var(--color-mkhe-border)]/20 overflow-hidden cursor-pointer hover:border-[var(--color-mkhe-primary)] transition-colors relative group bg-black/10 flex items-center justify-center"
                          onClick={() => setPreviewMedia(img)}
                        >
                          {isVideo(img) ? (
                            <>
                              <video src={img} className="w-full h-full object-cover opacity-80" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-6 h-6 text-white drop-shadow-md" />
                              </div>
                            </>
                          ) : (
                            <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-[var(--color-mkhe-input)]/30 p-5 rounded-2xl border border-[var(--color-mkhe-primary)]/20 shadow-sm shadow-[var(--color-mkhe-primary)]/5">
            <h3 className="font-bold text-[var(--color-mkhe-text)] mb-3">{t("returns.customer")}</h3>
            <p className="text-sm text-[var(--color-mkhe-text)]/80 mb-2 font-medium">Họ tên: {returnRequest.user?.name}</p>
            <p className="text-sm text-[var(--color-mkhe-text)]/80">Email: {returnRequest.user?.email}</p>
          </div>
          
          <div className="bg-[var(--color-mkhe-input)]/30 p-5 rounded-2xl border border-[var(--color-mkhe-primary)]/20 shadow-sm shadow-[var(--color-mkhe-primary)]/5">
            <h3 className="font-bold text-[var(--color-mkhe-text)] mb-3">
              {t("returns.admin_note")} {isPending && <span className="text-rose-500">*</span>}
            </h3>
            <textarea
              defaultValue={returnRequest.adminNote || ""}
              onChange={(e) => { adminNoteRef.current = e.target.value; }}
              readOnly={!isPending}
              placeholder={t("returns.admin_note_placeholder")}
              className={`w-full px-4 py-3 mt-2 bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/20 rounded-xl text-sm text-[var(--color-mkhe-text)] focus:outline-none focus:border-mkhe-primary resize-none h-32 ${!isPending ? "opacity-70 cursor-not-allowed" : ""}`}
            ></textarea>
          </div>
        </div>
      </div>
    );
  }, [returnRequest, isPending, t]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-[var(--color-mkhe-bg)] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-[var(--color-mkhe-border)]/20 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-mkhe-border)]/10">
          <h2 className="text-xl font-bold text-[var(--color-mkhe-text)]">
            {t("returns.detail_title")} - {returnRequest.order?.orderCode}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-mkhe-input)] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-[var(--color-mkhe-text)]/50" />
          </button>
        </div>

        {/* Content */}
        {modalContent}

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-mkhe-border)]/10 bg-[var(--color-mkhe-input)]/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all disabled:opacity-50 text-sm cursor-pointer"
          >
            {t("returns.close_btn")}
          </button>
          
          {isPending && (
            <>
              <button
                onClick={() => {
                  const currentNote = adminNoteRef.current;
                  if (!currentNote.trim()) {
                    toast.error(t("returns.error_empty_note"), { icon: '⚠️' });
                    return;
                  }
                  setConfirmData({ status: "REJECTED", actionName: t("returns.reject_btn") });
                }}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg font-bold text-sm bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {t("returns.reject_btn")}
              </button>
              <Button
                onClick={() => {
                  const currentNote = adminNoteRef.current;
                  if (!currentNote.trim()) {
                    toast.error(t("returns.error_empty_note"), { icon: '⚠️' });
                    return;
                  }
                  setConfirmData({ status: "APPROVED", actionName: t("returns.approve_btn") });
                }}
                disabled={isSubmitting}
                className="!w-auto px-8 py-2.5 rounded-xl text-sm cursor-pointer"
              >
                {t("returns.approve_btn")}
              </Button>
            </>
          )}
        </div>
      </div>

      {previewMedia && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewMedia(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 cursor-pointer p-2 bg-black/50 rounded-full transition-colors">
            <X className="w-8 h-8" />
          </button>
          {isVideo(previewMedia) ? (
            <video src={previewMedia} controls autoPlay className="max-w-4xl max-h-[80vh] w-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={previewMedia} alt="Preview" className="max-w-4xl max-h-[80vh] w-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmData}
        onConfirm={() => handleAction(confirmData.status)}
        onCancel={() => setConfirmData(null)}
        title={confirmData?.actionName}
        message={`Bạn có chắc chắn muốn ${confirmData?.actionName?.toLowerCase()} yêu cầu đổi trả này?`}
        confirmText={confirmData?.actionName}
        cancelText={t("returns.close_btn")}
        icon={confirmData?.status === "APPROVED" ? "check" : "alert"}
        isDanger={confirmData?.status === "REJECTED"}
      />
    </div>
  );
};

export default ReturnDetailModal;
