const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'pages', 'b2b', 'B2BDashboardPage.jsx');
const featurePath = path.join(__dirname, 'src', 'features', 'b2b', 'components', 'B2BOrderDetails.jsx');
const dashboardPath = path.join(__dirname, 'src', 'features', 'b2b', 'components', 'B2BDashboard.jsx');

const b2bOrderDetailsCode = `import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Download, CheckCircle, Clock, Check, Truck, Settings, Package, Loader2, Send } from "lucide-react";
import { confirmB2BOrderApi, addB2BOrderCommentApi } from "@/api/b2bApi";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { getSocket } from "@/config/socket";
import { formatCurrency } from "@/utils/helpers";

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
  const user = useAuthStore((state) => state.user);
  
  const [commentText, setCommentText] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const commentsEndRef = useRef(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [order?.comments]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on("b2b_new_comment", (data) => {
        if (data.orderId === order._id) {
          onUpdateOrder(data.orderId, {
            ...order,
            comments: [...order.comments, data.comment]
          });
        }
      });
      socket.on("b2b_order_updated", (updatedOrder) => {
        if (updatedOrder._id === order._id) {
          onUpdateOrder(order._id, updatedOrder);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("b2b_new_comment");
        socket.off("b2b_order_updated");
      }
    };
  }, [order, onUpdateOrder]);

  const handleConfirmOrder = async () => {
    if (!window.confirm(t("b2b:confirm_msg"))) return;
    setIsConfirming(true);
    try {
      const res = await confirmB2BOrderApi(order._id);
      if (res.success) {
        toast.success(t("b2b:status.CONFIRMED"));
        onUpdateOrder(order._id, res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSending(true);
    try {
      const res = await addB2BOrderCommentApi(order._id, commentText);
      if (res.success) {
        setCommentText("");
        // Socket will handle appending, but we can append locally just in case
      }
    } catch (error) {
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  };

  const getStepIndex = (status) => {
    return STATUS_STEPS.findIndex((s) => s.id === status);
  };
  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="bg-mkhe-bg rounded-xl border border-mkhe-border/30 overflow-hidden flex flex-col h-full max-h-[800px]">
      <div className="p-4 md:p-6 border-b border-mkhe-border/30 flex justify-between items-center bg-mkhe-primary/5">
        <div>
          <button onClick={onBack} className="text-mkhe-primary text-sm font-bold mb-2 hover:underline">
            ← {t("common:back")}
          </button>
          <h2 className="text-xl font-bold text-mkhe-text">
            {order.productOrService?.name} (x{order.quantity})
          </h2>
          <p className="text-sm text-mkhe-text/70 mt-1">
            Budget: {formatCurrency(order.budget)} • Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
          </p>
        </div>
        {order.status === "NEGOTIATING" && (
          <button
            onClick={handleConfirmOrder}
            disabled={isConfirming}
            className="px-6 py-2 bg-mkhe-primary text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : t("b2b:confirm_order")}
          </button>
        )}
      </div>

      {/* Stepper */}
      <div className="p-6 border-b border-mkhe-border/10 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {STATUS_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStepIndex > index || order.status === "COMPLETED";
            const isCurrent = currentStepIndex === index;
            return (
              <div key={step.id} className="flex flex-col items-center relative flex-1">
                <div className={\`w-10 h-10 rounded-full flex items-center justify-center z-10 \${isCompleted ? 'bg-mkhe-primary text-white' : isCurrent ? 'bg-mkhe-primary/20 border-2 border-mkhe-primary text-mkhe-primary' : 'bg-mkhe-border/20 text-mkhe-text/40'}\`}>
                  <StepIcon className="w-5 h-5" />
                </div>
                <span className={\`text-xs font-bold mt-2 text-center \${isCompleted || isCurrent ? 'text-mkhe-primary' : 'text-mkhe-text/40'}\`}>
                  {t(\`b2b:status.\${step.id}\`)}
                </span>
                {index < STATUS_STEPS.length - 1 && (
                  <div className={\`absolute top-5 left-1/2 w-full h-1 -z-0 \${currentStepIndex > index ? 'bg-mkhe-primary' : 'bg-mkhe-border/20'}\`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Info & Quote */}
        <div className="w-full md:w-1/3 p-6 border-r border-mkhe-border/10 overflow-y-auto">
          <h3 className="font-bold text-mkhe-text mb-4 text-lg">Chi tiết yêu cầu</h3>
          <div className="space-y-4">
             <div>
               <p className="text-sm text-mkhe-text/50">Packaging</p>
               <p className="font-medium">{order.packagingRequirement || "N/A"}</p>
             </div>
             <div>
               <p className="text-sm text-mkhe-text/50">Ghi chú</p>
               <p className="font-medium whitespace-pre-wrap">{order.note || "Không có ghi chú"}</p>
             </div>
             
             {order.quotePdfUrl && (
               <div className="mt-8 p-4 bg-mkhe-primary/5 rounded-xl border border-mkhe-primary/20">
                 <h4 className="font-bold text-mkhe-primary mb-2 flex items-center gap-2">
                   <Package className="w-4 h-4"/> Báo giá chính thức
                 </h4>
                 <a href={order.quotePdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium bg-mkhe-primary text-white px-4 py-2 rounded-lg justify-center hover:opacity-90 transition-opacity">
                   <Download className="w-4 h-4" /> {t("b2b:download_quote")}
                 </a>
               </div>
             )}
          </div>
        </div>

        {/* Chat */}
        <div className="w-full md:w-2/3 flex flex-col h-full min-h-[400px]">
          <div className="p-4 bg-mkhe-primary/5 border-b border-mkhe-border/10">
            <h3 className="font-bold text-mkhe-text flex items-center gap-2">
               Trao đổi & Đàm phán
            </h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--color-mkhe-input)]">
            {order.comments?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-mkhe-text/40 text-sm">
                Bắt đầu trò chuyện với chúng tôi...
              </div>
            ) : (
              order.comments?.map((c, i) => {
                const isMe = c.sender?._id === user?._id || c.sender === user?._id;
                return (
                  <div key={i} className={\`flex gap-3 \${isMe ? 'flex-row-reverse' : ''}\`}>
                    <img src={c.sender?.avatar || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                    <div className={\`max-w-[75%] \${isMe ? 'items-end' : 'items-start'} flex flex-col\`}>
                      <span className="text-xs text-mkhe-text/50 mb-1">
                        {c.sender?.firstName} {c.sender?.lastName} • {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <div className={\`px-4 py-2 rounded-2xl \${isMe ? 'bg-mkhe-primary text-white rounded-tr-none' : 'bg-mkhe-bg border border-mkhe-border/30 text-mkhe-text rounded-tl-none'} shadow-sm text-sm\`}>
                        {c.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={commentsEndRef} />
          </div>
          
          <form onSubmit={handleSendComment} className="p-4 border-t border-mkhe-border/10 bg-mkhe-bg flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t("b2b:chat_placeholder")}
              className="flex-1 bg-[var(--color-mkhe-input)] border border-[var(--color-mkhe-border)]/30 rounded-xl px-4 py-2.5 outline-none focus:border-mkhe-primary text-sm"
            />
            <button
              type="submit"
              disabled={isSending || !commentText.trim()}
              className="w-10 h-10 rounded-xl bg-mkhe-primary text-white flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default B2BOrderDetails;
`;

const b2bDashboardCode = `import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getMyB2BOrdersApi } from "@/api/b2bApi";
import B2BOrderDetails from "./B2BOrderDetails";
import { Loader2, PackageSearch } from "lucide-react";

const B2BDashboard = () => {
  const { t } = useTranslation(["b2b", "common"]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getMyB2BOrdersApi();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = (orderId, updatedData) => {
    setOrders(prev => prev.map(o => o._id === orderId ? updatedData : o));
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder(updatedData);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-mkhe-primary" /></div>;
  }

  if (selectedOrder) {
    return (
      <B2BOrderDetails 
        order={selectedOrder} 
        onBack={() => setSelectedOrder(null)} 
        onUpdateOrder={handleUpdateOrder} 
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="bg-mkhe-bg rounded-xl border border-mkhe-border/30 p-12 flex flex-col items-center justify-center text-center">
          <PackageSearch className="w-12 h-12 text-mkhe-text/20 mb-4" />
          <h3 className="text-lg font-bold text-mkhe-text mb-2">{t("b2b:no_orders")}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div 
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="bg-mkhe-bg rounded-xl border border-mkhe-border/30 p-5 shadow-sm hover:shadow-md hover:border-mkhe-primary/50 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-mkhe-primary group-hover:w-2 transition-all"></div>
              
              <div className="flex justify-between items-start mb-4 ml-2">
                <h3 className="font-bold text-mkhe-text text-lg line-clamp-2 pr-2">
                  {order.productOrService?.name}
                </h3>
                <span className="px-3 py-1 bg-mkhe-primary/10 text-mkhe-primary rounded-full text-xs font-bold whitespace-nowrap">
                  {t(\`b2b:status.\${order.status}\`)}
                </span>
              </div>
              
              <div className="mt-auto ml-2 space-y-2 text-sm text-mkhe-text/70">
                <p>Số lượng: <span className="font-medium text-mkhe-text">{order.quantity}</span></p>
                <p>Delivery: <span className="font-medium text-mkhe-text">{new Date(order.deliveryDate).toLocaleDateString()}</span></p>
                <p>Cập nhật: {new Date(order.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default B2BDashboard;
`;

const pageCode = `import React from "react";
import B2BDashboard from "../../features/b2b/components/B2BDashboard";
import { useTranslation } from "react-i18next";
import { Briefcase } from "lucide-react";

const B2BDashboardPage = () => {
  const { t } = useTranslation(["b2b"]);

  return (
    <div className="min-h-screen bg-[var(--color-mkhe-bg)] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-mkhe-primary/10 flex items-center justify-center text-mkhe-primary">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-logo text-gradient-gold tracking-wider uppercase">
              {t("b2b:title")}
            </h1>
            <p className="text-mkhe-text/60 text-sm mt-1">
              Quản lý tiến độ và thương lượng hợp đồng B2B
            </p>
          </div>
        </div>

        <B2BDashboard />

      </div>
    </div>
  );
};

export default B2BDashboardPage;
`;

fs.writeFileSync(featurePath, b2bOrderDetailsCode);
fs.writeFileSync(dashboardPath, b2bDashboardCode);
fs.writeFileSync(pagePath, pageCode);

console.log("Created B2B Dashboard components and page.");
