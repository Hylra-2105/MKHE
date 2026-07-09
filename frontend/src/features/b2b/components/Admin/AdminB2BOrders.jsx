import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getAllB2BOrdersApi, updateB2BOrderStatusApi, uploadB2BQuoteApi, addB2BOrderCommentApi } from "@/api/b2bApi";
import { Loader2, UploadCloud, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { formatCurrency } from "@/utils/formatters";

const STATUS_LIST = ["PENDING_QUOTE", "NEGOTIATING", "CONFIRMED", "PRODUCING", "DELIVERING", "COMPLETED", "CANCELLED"];

const AdminB2BOrders = () => {
  const { t } = useTranslation(["b2b", "common"]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const commentsEndRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const socket = useSocketStore((state) => state.socket);
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getAllB2BOrdersApi();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("admin_b2b_new_comment", (data) => {
        setOrders(prev => prev.map(o => {
          if (o._id === data.orderId) {
            return { ...o, comments: [...o.comments, data.comment] };
          }
          return o;
        }));
        if (selectedOrder && selectedOrder._id === data.orderId) {
          setSelectedOrder(prev => ({ ...prev, comments: [...prev.comments, data.comment] }));
          setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      });
      socket.on("admin_b2b_order_updated", (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        if (selectedOrder && selectedOrder._id === updatedOrder._id) {
          setSelectedOrder(updatedOrder);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("admin_b2b_new_comment");
        socket.off("admin_b2b_order_updated");
      }
    };
  }, [socket, selectedOrder]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!window.confirm(t("b2b:confirm_msg"))) return;
    try {
      const res = await updateB2BOrderStatusApi(selectedOrder._id, newStatus);
      if (res.success) {
        toast.success(t("b2b:status." + newStatus));
        // Socket should handle the update, but update locally anyway
        setOrders(prev => prev.map(o => o._id === selectedOrder._id ? res.data : o));
        setSelectedOrder(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile) return toast.error(t("b2b:pdf_required"));
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("quotePdf", pdfFile);
      const res = await uploadB2BQuoteApi(selectedOrder._id, formData);
      if (res.success) {
        toast.success("Báo giá đã được gửi");
        setPdfFile(null);
        setOrders(prev => prev.map(o => o._id === selectedOrder._id ? res.data : o));
        setSelectedOrder(res.data);
      }
    } catch (error) {
      toast.error("Upload error");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSending(true);
    try {
      await addB2BOrderCommentApi(selectedOrder._id, commentText);
      setCommentText("");
    } catch (error) {
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="flex gap-6 h-[800px]">
      {/* Left: Orders List */}
      <div className="w-1/3 bg-mkhe-bg border border-mkhe-border/30 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b bg-mkhe-primary/5 font-bold text-mkhe-text">Danh sách B2B Orders</div>
        <div className="flex-1 overflow-y-auto">
          {orders.map(o => (
            <div 
              key={o._id} 
              onClick={() => setSelectedOrder(o)}
              className={`p-4 border-b cursor-pointer transition-colors ${selectedOrder?._id === o._id ? 'bg-mkhe-primary/10 border-mkhe-primary/30' : 'hover:bg-mkhe-primary/5'}`}
            >
              <h4 className="font-bold text-mkhe-text truncate">{o.companyName}</h4>
              <p className="text-sm text-mkhe-text/60 truncate">{o.productOrService?.name}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs font-medium px-2 py-1 bg-mkhe-primary/10 rounded-full text-mkhe-text/80">
                  {t(`b2b:status.${o.status}`)}
                </span>
                <span className="text-xs text-mkhe-text/40">{new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Order Details */}
      <div className="w-2/3 bg-mkhe-bg border border-mkhe-border/30 rounded-xl shadow-sm flex flex-col">
        {selectedOrder ? (
          <>
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-mkhe-text">{selectedOrder.companyName}</h2>
                <p className="text-mkhe-text/60 text-sm">{selectedOrder.productOrService?.name} (x{selectedOrder.quantity})</p>
                <div className="mt-2 text-sm text-mkhe-text/80">
                  <p>Budget: {formatCurrency(selectedOrder.budget)}</p>
                  <p>Delivery: {new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>
                  <p>Note: {selectedOrder.note || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <select 
                  value={selectedOrder.status}
                  onChange={handleStatusChange}
                  className="px-3 py-2 border rounded-lg text-sm bg-mkhe-primary/5 outline-none focus:border-mkhe-primary"
                >
                  {STATUS_LIST.map(s => <option key={s} value={s}>{t(`b2b:status.${s}`)}</option>)}
                </select>

                {!selectedOrder.quotePdfUrl && (
                  <div className="flex gap-2 items-center mt-2">
                    <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} className="text-xs" />
                    <button 
                      onClick={handleUploadPdf}
                      disabled={uploadingPdf}
                      className="px-3 py-1.5 bg-mkhe-primary text-white text-xs rounded-lg flex items-center gap-1 disabled:opacity-50"
                    >
                      {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Upload
                    </button>
                  </div>
                )}
                {selectedOrder.quotePdfUrl && (
                  <a href={selectedOrder.quotePdfUrl} target="_blank" rel="noreferrer" className="text-mkhe-primary text-sm hover:underline mt-2 flex items-center gap-1">
                    Xem PDF Báo giá
                  </a>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1 bg-mkhe-primary/5 p-4 overflow-y-auto space-y-4">
              {selectedOrder.comments?.map((c, i) => {
                const isMe = c.sender?._id === user?._id || c.sender === user?._id;
                return (
                  <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img src={c.sender?.avatar || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <span className="text-xs text-mkhe-text/60 mb-1">
                        {c.sender?.firstName} {c.sender?.lastName}
                      </span>
                      <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-mkhe-primary text-white rounded-tr-none' : 'bg-mkhe-bg border text-mkhe-text rounded-tl-none'} shadow-sm text-sm`}>
                        {c.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>
            
            <form onSubmit={handleSendComment} className="p-4 border-t bg-mkhe-bg flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("b2b:chat_placeholder")}
                className="flex-1 border border-mkhe-border/50 rounded-xl px-4 py-2.5 outline-none focus:border-mkhe-primary text-sm"
              />
              <button
                type="submit"
                disabled={isSending || !commentText.trim()}
                className="w-10 h-10 rounded-xl bg-mkhe-primary text-white flex items-center justify-center disabled:opacity-50"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-mkhe-text/40">
            Chọn một đơn hàng để xem chi tiết
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminB2BOrders;
