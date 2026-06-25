import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, Navigate } from "react-router-dom";
import { Check, QrCode, Copy, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import orderApi from "@/api/orderApi";

export default function CheckoutSuccessPage() {
  const { t } = useTranslation("checkout");
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.orderData || location.state?.order || null);
  const payosData = location.state?.payosData || null;
  const searchParams = new URLSearchParams(location.search);
  const isPayosReturn = searchParams.get("status") || searchParams.get("cancel");

  const [isProcessing, setIsProcessing] = useState(false);

  // Polling logic to check payment status
  useEffect(() => {
    let interval;
    if (order && order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus !== "PAID") {
      interval = setInterval(async () => {
        try {
          const res = await orderApi.getOrderById(order._id);
          if (res.data && res.data.paymentStatus === "PAID") {
            clearInterval(interval); // stop polling immediately
            
            // Show fake processing overlay for better UX
            setIsProcessing(true);
            setTimeout(() => {
              setOrder(res.data);
              setIsProcessing(false);
              toast.success("Thanh toán thành công!");
            }, 2000);
          }
        } catch (error) {
          console.error("Error polling order status:", error);
        }
      }, 3000); // poll every 3s
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [order]);

  if (!order && !isPayosReturn) {
    return <Navigate to="/shop" replace />;
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  // VietQR generation logic
  const BANK_BIN = payosData?.bin || "momo"; 
  const ACCOUNT_NO = payosData?.accountNumber || "0333506604"; 
  const ACCOUNT_NAME = payosData?.accountName || "LE THANH LOI";
  const AMOUNT = payosData?.amount || order?.totalAmount || 0;
  const CONTENT = payosData?.description || order?.orderCode || "";
  
  const qrUrl = `https://img.vietqr.io/image/${BANK_BIN}-${ACCOUNT_NO}-compact2.png?amount=${AMOUNT}&addInfo=${CONTENT}&accountName=${ACCOUNT_NAME}`;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  const isPaid = order?.paymentStatus === "PAID" || (isPayosReturn && searchParams.get("status") === "PAID");

  return (
    <div className="min-h-screen bg-mkhe-bg py-16 px-4 transition-colors duration-300 relative">
      {/* PROCESSING OVERLAY */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-mkhe-input p-8 rounded-2xl flex flex-col items-center shadow-2xl border border-mkhe-border max-w-sm w-full mx-4">
              <Loader2 className="w-12 h-12 text-mkhe-primary animate-spin mb-4" />
              <h3 className="text-xl font-medium text-mkhe-text mb-2 text-center">Đang xử lý giao dịch...</h3>
              <p className="text-sm text-mkhe-text opacity-70 text-center">Vui lòng chờ trong giây lát, hệ thống đang xác nhận khoản thanh toán của bạn.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="container mx-auto max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-mkhe-input p-8 md:p-12 rounded-3xl shadow-lg border border-mkhe-border relative overflow-hidden transition-colors duration-300">
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-mkhe-primary/10 rounded-bl-full -z-10" />

          {/* Header Section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-mkhe-primary/20 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-2 border border-mkhe-primary/40 rounded-full animate-[spin_10s_linear_infinite]" />
              <Check className="w-10 h-10 text-mkhe-primary" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif text-mkhe-text mb-4 transition-colors duration-300">
              {t("success.title")}
            </h1>
            
            <p className="text-mkhe-text opacity-70 text-base max-w-lg leading-relaxed transition-colors duration-300">
              {t("success.thank_you_part1")} <br className="hidden md:block" />
              {t("success.thank_you_part2")}
            </p>
          </motion.div>

          {/* Order Code Badge */}
          {order && (
            <motion.div variants={itemVariants} className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-mkhe-bg border border-mkhe-border rounded-full text-sm transition-colors duration-300">
                <span className="text-mkhe-text opacity-60 uppercase tracking-wider text-xs">Mã đơn hàng</span>
                <span className="font-medium text-mkhe-text tracking-widest">{order.orderCode}</span>
                <button 
                  onClick={() => copyToClipboard(order.orderCode, "Mã đơn hàng")}
                  className="text-mkhe-primary hover:opacity-70 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Payment Details Section */}
          <motion.div variants={itemVariants} className="w-full flex justify-center">
            
            <AnimatePresence mode="wait">
              {!isPaid && order?.paymentMethod === "BANK_TRANSFER" && !isPayosReturn && (
                <motion.div 
                  key="qr-code"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-2xl bg-mkhe-bg border border-mkhe-border rounded-2xl overflow-hidden shadow-sm transition-colors duration-300"
                >
                  <div className="bg-black/5 px-6 py-4 border-b border-mkhe-border flex items-center justify-between transition-colors duration-300">
                    <div className="flex items-center gap-2 text-mkhe-text font-medium">
                      <QrCode className="w-5 h-5 text-mkhe-primary" />
                      <span>{t("success.qr_scan")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 bg-mkhe-primary/20 text-mkhe-primary rounded uppercase tracking-wider">
                        Đang chờ thanh toán...
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="shrink-0 p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition-colors duration-300">
                      <img src={qrUrl} alt="VietQR" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
                    </div>
                    
                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <p className="text-xs text-mkhe-text opacity-60 uppercase tracking-wider mb-1">{t("success.bank")}</p>
                        <p className="font-medium text-mkhe-text">{payosData ? "Chuyển khoản VietQR" : "Ví điện tử MoMo"}</p>
                      </div>
                      
                      {/* Fixed Layout to prevent overlap on long names */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-mkhe-text opacity-60 uppercase tracking-wider mb-1">{t("success.account_no")}</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-mkhe-text">{ACCOUNT_NO}</p>
                            <button onClick={() => copyToClipboard(ACCOUNT_NO, "Số tài khoản")} className="text-mkhe-text opacity-50 hover:opacity-100 hover:text-mkhe-primary transition-colors">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-mkhe-text opacity-60 uppercase tracking-wider mb-1">{t("success.account_name")}</p>
                          <p className="font-medium text-mkhe-text text-sm break-words">{ACCOUNT_NAME}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-mkhe-border transition-colors duration-300">
                        <div className="flex justify-between items-end mb-3">
                          <p className="text-xs text-mkhe-text opacity-60 uppercase tracking-wider">{t("success.amount")}</p>
                          <p className="text-xl font-medium text-mkhe-primary">{formatMoney(AMOUNT)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-mkhe-text opacity-60 uppercase tracking-wider mb-1">{t("success.content")}</p>
                          <div className="flex items-center justify-between p-3 bg-black/5 rounded-lg transition-colors duration-300">
                            <p className="font-medium text-mkhe-primary tracking-wider text-sm break-all">{CONTENT}</p>
                            <button onClick={() => copyToClipboard(CONTENT, "Nội dung")} className="text-mkhe-text opacity-50 hover:opacity-100 hover:text-mkhe-primary transition-colors shrink-0 ml-2">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-mkhe-primary/10 px-6 py-4 text-xs text-mkhe-primary/90 italic text-center transition-colors duration-300">
                    Vui lòng quét QR hoặc chuyển khoản đúng nội dung và số tiền để đơn hàng được duyệt tự động.
                  </div>
                </motion.div>
              )}

              {isPaid && (
                <motion.div 
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="bg-[#e8f5e9] border border-[#a5d6a7] rounded-2xl p-8 w-full max-w-md text-center shadow-lg transition-colors duration-300"
                >
                  <div className="w-16 h-16 bg-[#c8e6c9] text-[#2e7d32] rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-medium text-[#1b5e20] text-xl mb-3">Đã thanh toán thành công!</h3>
                  <p className="text-sm text-[#2e7d32] leading-relaxed">
                    Tuyệt vời! Hệ thống đã xác nhận thanh toán của bạn. Đơn hàng đang được chuẩn bị và sẽ sớm giao đến tay bạn.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {isPayosReturn && searchParams.get("cancel") === "true" && !isPaid && (
              <div className="bg-[#ffebee] border border-[#ef9a9a] rounded-2xl p-8 w-full max-w-md text-center transition-colors duration-300">
                <div className="w-12 h-12 bg-[#ffcdd2] text-[#c62828] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl leading-none">&times;</span>
                </div>
                <h3 className="font-medium text-[#b71c1c] text-lg mb-2">Đã hủy thanh toán!</h3>
                <p className="text-sm text-[#c62828]">Bạn đã hủy giao dịch thanh toán. Đơn hàng vẫn được lưu lại chờ thanh toán. Vui lòng kiểm tra lại trong quản lý đơn hàng.</p>
              </div>
            )}

            {order?.paymentMethod === "COD" && (
              <div className="bg-mkhe-bg border border-mkhe-border rounded-2xl p-8 w-full max-w-md text-center transition-colors duration-300">
                <div className="w-12 h-12 bg-mkhe-primary/20 text-mkhe-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-mkhe-text text-lg mb-2">{t("success.cod_method")}</h3>
                <p className="text-sm text-mkhe-text opacity-70 leading-relaxed">
                  {t("success.cod_note_part1")} <strong className="text-mkhe-primary text-base px-1">{formatMoney(order.totalAmount)}</strong> {t("success.cod_note_part2")}
                </p>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/profile" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-mkhe-border text-mkhe-text font-medium text-sm hover:bg-mkhe-bg transition-colors uppercase tracking-widest text-center"
            >
              Quản lý đơn hàng
            </Link>
            <Link 
              to="/shop" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-mkhe-primary text-white font-medium text-sm hover:brightness-110 transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-mkhe-primary/20"
            >
              {t("success.continue_shopping")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
