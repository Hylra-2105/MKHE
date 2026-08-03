import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, FileText, MessageSquare, CheckCircle2, Package, Truck, Flag, UploadCloud, Send, Loader2, Download } from "lucide-react";
import toast from "react-hot-toast";
import { updateB2BOrderStatusApi, uploadB2BQuoteApi, addB2BOrderCommentApi } from "@/api/b2bApi";
import { formatCurrency } from "@/utils/formatters";
import { useAuthStore } from "@/stores/useAuthStore";
import Dropdown from "@/components/ui/Dropdown";
import logo from "@/assets/images/logo-mkhe.png";

const B2B_STEPS = [
  { id: "PENDING_QUOTE", icon: FileText, label: "b2b:status.PENDING_QUOTE" },
  { id: "NEGOTIATING", icon: MessageSquare, label: "b2b:status.NEGOTIATING" },
  { id: "CONFIRMED", icon: CheckCircle2, label: "b2b:status.CONFIRMED" },
  { id: "PRODUCING", icon: Package, label: "b2b:status.PRODUCING" },
  { id: "DELIVERING", icon: Truck, label: "b2b:status.DELIVERING" },
  { id: "COMPLETED", icon: Flag, label: "b2b:status.COMPLETED" },
];

const STATUS_LIST = ["PENDING_QUOTE", "NEGOTIATING", "CONFIRMED", "PRODUCING", "DELIVERING", "COMPLETED", "CANCELLED"];

const B2BOrderDetailModal = ({ isOpen, onClose, order, onOrderUpdated }) => {
  const { t } = useTranslation(["b2b", "common"]);
  const { user } = useAuthStore();
  
  const [pdfFile, setPdfFile] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status === "PENDING" ? "PENDING_QUOTE" : order.status);
    }
    if (order?.comments && chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [order]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const executeStatusChange = async () => {
    if (!selectedStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await updateB2BOrderStatusApi(order._id, selectedStatus);
      if (res.success) {
        toast.success(t("b2b:admin.modal.update_status_success", { defaultValue: "Đã cập nhật trạng thái thành công" }));
        onOrderUpdated(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("b2b:admin.modal.error_updating_status"));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile) return toast.error(t("b2b:pdf_required"));
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("quotePdf", pdfFile);
      const res = await uploadB2BQuoteApi(order._id, formData);
      if (res.success) {
        if (adminNote.trim()) {
          await addB2BOrderCommentApi(order._id, `[SYSTEM_QUOTE_NOTE]: ${adminNote}`);
        }
        toast.success(t("b2b:admin.modal.upload_success"));
        setPdfFile(null);
        setAdminNote("");
        onOrderUpdated(res.data);
      }
    } catch (error) {
      toast.error(t("b2b:admin.modal.upload_error"));
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSending(true);
    try {
      await addB2BOrderCommentApi(order._id, commentText);
      setCommentText("");
    } catch (error) {
      toast.error(t("b2b:admin.modal.error_sending_msg"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose} />
      
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[var(--color-mkhe-border)]/30 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--color-mkhe-border)]/20">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 mb-1 text-[var(--color-mkhe-primary)]" />
            <h2 className="text-lg font-bold text-gradient-gold">
              {t("b2b:admin.modal.request_details")} - {order.companyName}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-mkhe-primary)]/10 rounded-full cursor-pointer transition-colors">
            <X className="w-5 h-5 text-[var(--color-mkhe-text)]/70" />
          </button>
        </div>

        {/* BODY (SPLIT 2 COLUMNS) */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* LEFT: DETAILS & STATUS (w-1/2) */}
          <div className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-[var(--color-mkhe-border)]/20 custom-scrollbar flex flex-col gap-6">
            
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-mkhe-primary)]/5 rounded-xl p-4 border border-[var(--color-mkhe-primary)]/20">
                <span className="text-[10px] uppercase text-[var(--color-mkhe-text)]/50 font-bold tracking-wider block mb-1">{t("b2b:admin.modal.product_service")}</span>
                <div className="font-bold text-[var(--color-mkhe-text)] text-sm">{order.productOrService?.name || "N/A"}</div>
              </div>
              <div className="bg-[var(--color-mkhe-primary)]/5 rounded-xl p-4 border border-[var(--color-mkhe-primary)]/20">
                <span className="text-[10px] uppercase text-[var(--color-mkhe-text)]/50 font-bold tracking-wider block mb-1">{t("b2b:admin.modal.quantity")}</span>
                <div className="font-bold text-[var(--color-mkhe-text)] text-sm">x{order.quantity}</div>
              </div>
              <div className="bg-[var(--color-mkhe-primary)]/5 rounded-xl p-4 border border-[var(--color-mkhe-primary)]/20">
                <span className="text-[10px] uppercase text-[var(--color-mkhe-text)]/50 font-bold tracking-wider block mb-1">{t("b2b:admin.modal.budget")}</span>
                <div className="font-bold text-orange-500 text-sm">{formatCurrency(order.budget)}</div>
              </div>
              <div className="bg-[var(--color-mkhe-primary)]/5 rounded-xl p-4 border border-[var(--color-mkhe-primary)]/20">
                <span className="text-[10px] uppercase text-[var(--color-mkhe-text)]/50 font-bold tracking-wider block mb-1">{t("b2b:admin.modal.delivery_date")}</span>
                <div className="font-bold text-[var(--color-mkhe-text)] text-sm">{new Date(order.deliveryDate).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>

            {order.note && (
              <div className="bg-[var(--color-mkhe-border)]/5 rounded-xl p-4 border border-[var(--color-mkhe-border)]/20 italic text-sm text-[var(--color-mkhe-text)]/80">
                <span className="font-bold not-italic block mb-1 text-[var(--color-mkhe-primary)] text-xs">{t("b2b:admin.modal.guest_note")}</span>
                "{order.note}"
              </div>
            )}

            {/* Trạng thái nhanh */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-[var(--color-mkhe-primary)]/10 rounded-xl border border-[var(--color-mkhe-primary)]/20">
              <span className="text-sm font-bold">{t("b2b:admin.modal.change_status")}</span>
              <div className="flex items-center gap-2">
                <Dropdown 
                  value={selectedStatus}
                  onChange={(val) => setSelectedStatus(val)}
                  options={STATUS_LIST.map(s => ({ value: s, label: t(`b2b:status.${s}`) }))}
                  triggerClassName="w-44 bg-[var(--color-mkhe-bg)] border-[var(--color-mkhe-primary)]/50 py-2 h-9"
                />
                {selectedStatus !== (order.status === "PENDING" ? "PENDING_QUOTE" : order.status) && (
                  <button 
                    onClick={executeStatusChange}
                    disabled={isUpdatingStatus}
                    className="h-9 px-4 rounded bg-[var(--color-mkhe-primary)] text-white text-xs font-bold hover:bg-opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px] cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common:save", { defaultValue: "Lưu" })}
                  </button>
                )}
              </div>
            </div>

            {/* Mini Stepper */}
            <div className="bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/50 rounded-xl p-5 relative">
              <div className="absolute left-[30px] top-5 bottom-5 w-0.5 bg-[var(--color-mkhe-border)]/50 z-0" />
              <div className="flex flex-col gap-6 relative z-10">
                {B2B_STEPS.map((step, idx) => {
                  const normalizedStatus = order.status === "PENDING" ? "PENDING_QUOTE" : order.status;
                  const currentIndex = B2B_STEPS.findIndex(s => s.id === normalizedStatus);
                  const isCompleted = idx < currentIndex;
                  const isCurrent = idx === currentIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0
                        ${isCompleted ? 'bg-[var(--color-mkhe-primary)] border-[var(--color-mkhe-primary)] text-white' : ''}
                        ${isCurrent ? 'bg-[var(--color-mkhe-bg)] border-[var(--color-mkhe-primary)] text-[var(--color-mkhe-primary)] shadow-[0_0_10px_rgba(var(--color-mkhe-primary-rgb),0.3)]' : ''}
                        ${!isCompleted && !isCurrent ? 'bg-[var(--color-mkhe-bg)] border-[var(--color-mkhe-border)]/70 text-[var(--color-mkhe-text)]/50' : ''}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${isCompleted || isCurrent ? 'text-[var(--color-mkhe-text)]' : 'text-[var(--color-mkhe-text)]/50'}`}>
                          {t(step.label)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Document / Quote Upload (Only if Pending Quote) */}
            {(order.status === 'PENDING_QUOTE' || order.status === 'PENDING') && !order.quotePdfUrl && (
              <div className="bg-orange-500/5 border border-orange-500/30 rounded-xl p-5">
                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {t("b2b:admin.modal.quote_pdf")}
                </h4>
                <div className="flex flex-col gap-4">
                  <label 
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center
                      ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-[var(--color-mkhe-border)]/40 hover:border-orange-500 hover:bg-orange-500/5'}
                    `}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
                        setPdfFile(file);
                      } else {
                        toast.error(t("b2b:pdf_required"));
                      }
                    }}
                  >
                    <input type="file" accept=".pdf" className="hidden" onChange={e => setPdfFile(e.target.files[0])} />
                    <UploadCloud className={`w-6 h-6 mb-2 transition-colors ${pdfFile || isDragging ? 'text-orange-500' : 'text-[var(--color-mkhe-text)]/40'}`} />
                    <span className="text-xs font-medium transition-colors">
                      {pdfFile ? pdfFile.name : (isDragging ? t("b2b:admin.modal.drop_here", { defaultValue: "Thả file vào đây..." }) : t("b2b:admin.modal.click_to_select_pdf"))}
                    </span>
                    {!pdfFile && (
                      <span className="text-[10px] text-[var(--color-mkhe-text)]/50 mt-1 block transition-opacity">
                        {t("b2b:admin.modal.or_drag_drop", { defaultValue: "Hoặc kéo thả file PDF vào đây" })}
                      </span>
                    )}
                  </label>
                  <textarea 
                    className="w-full bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/30 rounded-xl p-3 outline-none focus:border-orange-500 text-xs resize-none h-16 custom-scrollbar"
                    placeholder={t("b2b:admin.modal.note_placeholder")}
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                  />
                  <button onClick={handleUploadPdf} disabled={!pdfFile || uploadingPdf} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-600 text-white rounded-xl py-2.5 font-bold text-sm hover:shadow-lg disabled:opacity-50 transition-all">
                    {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {t("b2b:admin.modal.send_quote")}
                  </button>
                </div>
              </div>
            )}

            {order.quotePdfUrl && (
              <div className="bg-[var(--color-mkhe-primary)]/10 border border-[var(--color-mkhe-primary)]/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[var(--color-mkhe-primary)]" />
                  <div>
                    <h4 className="font-bold text-sm">{t("b2b:admin.modal.quote_contract_file")}</h4>
                    <p className="text-xs text-[var(--color-mkhe-text)]/60">{t("b2b:admin.modal.sent_to_customer")}</p>
                  </div>
                </div>
                <a href={order.quotePdfUrl} target="_blank" rel="noreferrer" className="p-2 bg-[var(--color-mkhe-primary)] text-white rounded-lg hover:bg-opacity-80 transition-colors">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* RIGHT: CHAT (w-1/2) */}
          <div className="w-full lg:w-1/2 flex flex-col bg-[var(--color-mkhe-bg)] relative">
            <div className="p-4 border-b border-[var(--color-mkhe-border)]/20 bg-gradient-to-r from-transparent to-[var(--color-mkhe-primary)]/5 flex items-center justify-center">
               <h3 className="font-bold text-[var(--color-mkhe-text)] flex items-center gap-2 text-sm uppercase tracking-widest"><MessageSquare className="w-4 h-4"/> {t("b2b:admin.modal.negotiation")}</h3>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
              {order.comments.map((c, i) => {
                const isMe = c.sender?.role === 'Admin' || c.sender?.role === 'Staff';
                const isSystem = c.text.startsWith('[SYSTEM_QUOTE_NOTE]:');
                const displayText = isSystem ? c.text.replace('[SYSTEM_QUOTE_NOTE]:', '').trim() : c.text;

                return (
                  <div key={c._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] ${isMe ? 'flex-row' : 'flex-row'} items-end gap-2`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-mkhe-border)]/20 flex items-center justify-center shrink-0 overflow-hidden mb-1">
                          {c.sender?.avatar ? (
                            <img src={c.sender.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs text-[var(--color-mkhe-primary)]">{c.sender?.name?.charAt(0) || 'K'}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-1">
                        {!isSystem && !isMe && (
                          <span className="text-[10px] text-[var(--color-mkhe-text)]/50 px-1 text-left">
                            {c.sender?.name ? c.sender.name : 'Khách hàng'}
                          </span>
                        )}
                        <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm
                          ${isSystem 
                            ? 'bg-gradient-to-r from-orange-500/10 to-[var(--color-mkhe-primary)]/10 border border-[var(--color-mkhe-primary)]/30 text-[var(--color-mkhe-text)] italic'
                            : isMe 
                              ? 'bg-[var(--color-mkhe-primary)] text-white' 
                              : 'bg-[var(--color-mkhe-border)]/10 border border-[var(--color-mkhe-border)]/20 text-[var(--color-mkhe-text)]'}
                        `}>
                          {isSystem && <div className="text-[10px] font-bold text-[var(--color-mkhe-primary)] mb-1 not-italic flex items-center gap-1"><FileText className="w-3 h-3"/> {t("b2b:admin.modal.admin_quote_note")}</div>}
                          <div className="leading-relaxed whitespace-pre-wrap break-words">{displayText}</div>
                        </div>
                      </div>

                      {isMe && (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-mkhe-border)]/20 flex items-center justify-center shrink-0 overflow-hidden mb-1">
                          <img src={logo} alt="MKHE Logo" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendComment} className="p-4 border-t border-[var(--color-mkhe-border)]/20 bg-[var(--color-mkhe-bg)] flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("b2b:admin.modal.chat_placeholder")}
                className="flex-1 bg-transparent border border-[var(--color-mkhe-border)]/40 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--color-mkhe-primary)] text-sm"
              />
              <button
                type="submit"
                disabled={isSending || !commentText.trim()}
                className="w-11 h-11 rounded-xl bg-[var(--color-mkhe-primary)] text-white flex items-center justify-center disabled:opacity-50 hover:bg-opacity-80 transition-colors shrink-0"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default B2BOrderDetailModal;
