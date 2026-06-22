import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle, QrCode } from "lucide-react";

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // VietQR generation logic (MB Bank, example account "0987654321", account name "MKHE HERITAGE")
  const BANK_BIN = "970422"; // MBBank
  const ACCOUNT_NO = "0987654321"; 
  const ACCOUNT_NAME = "MKHE HERITAGE";
  const AMOUNT = order.totalAmount;
  const CONTENT = order.orderCode;
  
  const qrUrl = `https://img.vietqr.io/image/${BANK_BIN}-${ACCOUNT_NO}-compact2.png?amount=${AMOUNT}&addInfo=${CONTENT}&accountName=${ACCOUNT_NAME}`;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
        <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-4xl font-serif text-mkhe-primary mb-4">Đặt hàng thành công!</h1>
        <p className="text-gray-600 text-lg mb-8 max-w-xl">
          Cám ơn bạn đã mua sắm tại MKHE Heritage. Mã đơn hàng của bạn là <strong className="text-mkhe-text">{order.orderCode}</strong>.
          Hóa đơn và chi tiết đơn hàng đã được gửi vào email của bạn.
        </p>

        {order.paymentMethod === "BANK_TRANSFER" && (
          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 w-full max-w-md mb-8">
            <div className="flex items-center justify-center gap-2 mb-4 text-mkhe-primary font-medium">
              <QrCode className="w-6 h-6" />
              <span>Quét mã QR để thanh toán</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
              <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain mx-auto" />
            </div>
            <div className="text-left text-sm text-gray-700 space-y-2 bg-white p-4 rounded-lg">
              <p>Ngân hàng: <strong>MBBank</strong></p>
              <p>Số tài khoản: <strong>{ACCOUNT_NO}</strong></p>
              <p>Chủ tài khoản: <strong>{ACCOUNT_NAME}</strong></p>
              <p>Số tiền: <strong className="text-mkhe-primary text-base">{formatMoney(AMOUNT)}</strong></p>
              <p>Nội dung CK: <strong className="text-blue-600 text-base">{CONTENT}</strong></p>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              Vui lòng chuyển khoản đúng nội dung để hệ thống duyệt đơn tự động.
            </p>
          </div>
        )}

        {order.paymentMethod === "COD" && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 w-full max-w-md mb-8">
            <p className="text-gray-700 font-medium mb-2">Phương thức thanh toán: COD</p>
            <p className="text-sm text-gray-500">Bạn sẽ thanh toán số tiền <strong className="text-mkhe-primary">{formatMoney(order.totalAmount)}</strong> khi nhận được hàng.</p>
          </div>
        )}

        <div className="flex gap-4">
          <Link 
            to="/shop" 
            className="bg-mkhe-primary text-white px-8 py-3 rounded-md hover:brightness-90 transition-colors uppercase tracking-widest text-sm font-medium"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
