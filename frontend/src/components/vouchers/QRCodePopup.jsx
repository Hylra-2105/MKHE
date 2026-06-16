import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

const QRCodePopup = ({ isOpen, onClose, userVoucherId, code }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative bg-white w-full max-w-sm rounded-2xl p-8 flex flex-col items-center shadow-2xl animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <h3 className="text-xl font-serif text-mkhe-text mb-2">Quét mã tại quầy</h3>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Đưa mã QR này cho nhân viên thu ngân để áp dụng ưu đãi
        </p>

        <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-100">
          <QRCodeSVG 
            value={userVoucherId || "invalid"} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="mt-6 px-4 py-2 bg-gray-100 rounded-full">
          <span className="font-mono font-bold tracking-widest text-lg text-mkhe-primary">
            {code || "UNKNOWN"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QRCodePopup;
