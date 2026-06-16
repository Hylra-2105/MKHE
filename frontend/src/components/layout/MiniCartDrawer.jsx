import React from "react";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { formatNumber, getImageUrl } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MiniCartDrawer = () => {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeFromCart, getCartTotal } = useCartStore();
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-mkhe-bg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-mkhe-border/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-mkhe-primary" />
            <h2 className="font-serif text-2xl text-mkhe-text">{t("cart.title", "Giỏ hàng")}</h2>
            <span className="bg-mkhe-primary text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button 
            onClick={() => setCartOpen(false)}
            className="p-2 bg-mkhe-border/10 rounded-full text-mkhe-text hover:bg-mkhe-border/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <ShoppingBag className="w-16 h-16 mb-4 text-mkhe-text/40" />
              <p className="text-lg">{t("cart.empty", "Giỏ hàng của bạn đang trống")}</p>
              <button 
                onClick={() => setCartOpen(false)}
                className="mt-6 px-6 py-2 border border-mkhe-primary text-mkhe-primary rounded-full hover:bg-mkhe-primary hover:text-white transition-colors"
              >
                {t("cart.continue_shopping", "Tiếp tục mua sắm")}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product._id} className="flex gap-4 p-4 bg-mkhe-card rounded-2xl border border-mkhe-border/10 group">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-mkhe-border/5 shrink-0">
                  <img 
                    src={getImageUrl(item.product.images[0])} 
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-sans font-medium text-lg text-mkhe-text line-clamp-2 leading-tight">
                      {item.product.name?.normalize('NFC').replace(/Trắ[\s´́]*c/gi, 'Trắc')}
                    </h3>
                    <button 
                      onClick={() => removeFromCart(item.product._id)}
                      className="p-1.5 text-mkhe-primary/80 hover:text-mkhe-primary hover:bg-mkhe-primary/10 rounded-full transition-colors shrink-0 cursor-pointer"
                      title={t("cart.remove_item", "Xóa sản phẩm")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between mt-2">
                    <p className="text-mkhe-primary font-medium">
                      {formatNumber(item.product.price)} đ
                    </p>
                    
                    <div className="flex items-center gap-3 bg-mkhe-bg rounded-full p-1 border border-mkhe-border/10">
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 rounded-full text-mkhe-text/60 hover:text-mkhe-text hover:bg-mkhe-border/10 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 rounded-full text-mkhe-text/60 hover:text-mkhe-text hover:bg-mkhe-border/10 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-mkhe-card border-t border-mkhe-border/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between mb-6">
              <span className="text-mkhe-text/80 text-lg">{t("cart.total", "Tổng cộng:")}</span>
              <span className="text-2xl font-sans font-semibold text-mkhe-primary">
                {formatNumber(getCartTotal())} đ
              </span>
            </div>
            <button 
              onClick={() => {
                setCartOpen(false);
                navigate("/checkout"); // Có thể làm tính năng thanh toán sau
              }}
              className="w-full py-4 bg-mkhe-primary text-white rounded-full font-medium text-lg shadow-lg shadow-mkhe-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t("cart.checkout", "Thanh toán ngay")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniCartDrawer;
