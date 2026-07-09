import React, { useEffect, useState } from "react";
import { X, ShoppingCart, Plus, Minus, Trash2, Loader2, Ticket, Check } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { formatNumber, getImageUrl, DEFAULT_FALLBACK_IMAGE } from "@/utils/formatters";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import VoucherSelectorDrawer from "@/features/vouchers/components/VoucherSelectorDrawer";
import { useVoucherStore } from "@/stores/useVoucherStore";
import { checkVoucherEligibility } from "@/utils/voucherHelpers";

const MiniCartDrawer = () => {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeFromCart, getCartTotal, getDiscountedTotal, loadingItems, selectedItems, toggleSelectItem, selectAllItems, removeMultipleFromCart, selectedVoucher, setSelectedVoucher } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(["cart"]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isVoucherSelectorOpen, setIsVoucherSelectorOpen] = useState(false);
  const { walletVouchers, fetchWalletVouchers, isLoadingWallet } = useVoucherStore();

  useEffect(() => {
    if (isCartOpen) {
      fetchWalletVouchers();
    }
  }, [isCartOpen, fetchWalletVouchers]);

  useEffect(() => {
    if (selectedVoucher) {
      const eligibility = checkVoucherEligibility(selectedVoucher, items.filter((item) => selectedItems.includes(item.product._id)), getCartTotal());
      if (!eligibility.isEligible) {
        setSelectedVoucher(null);
      }
    }
  }, [selectedVoucher, items, selectedItems, getCartTotal, setSelectedVoucher]);

  useEffect(() => {
    if (!isCartOpen) {
      setIsEditMode(false);
      setItemToDelete(null);
      document.body.style.overflow = '';
    } else {
      if (window.innerWidth < 640) {
        document.body.style.overflow = 'hidden';
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const handleRemove = (productId) => {
    setItemToDelete(productId);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Dropdown / Modal */}
      <div className="mini-cart-drawer fixed inset-0 sm:inset-auto sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-4 w-full sm:w-[460px] h-[100dvh] sm:h-auto sm:max-h-[calc(100vh-100px)] z-[110] bg-mkhe-bg border-0 sm:border border-mkhe-border sm:rounded-xl shadow-2xl flex flex-col animate-in fade-in sm:zoom-in-95 duration-200 overflow-hidden origin-top-right font-sans text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-mkhe-border/10">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-mkhe-primary" />
            <h3 className="font-bold text-2xl text-mkhe-text">{t("title", "Giỏ hàng")}</h3>
            <span className="bg-mkhe-primary text-[#1a110a] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={() => {
                  setIsEditMode(!isEditMode);
                  selectAllItems(false);
                }}
                className="text-sm font-medium text-mkhe-primary hover:underline px-3 cursor-pointer"
              >
                {isEditMode ? t("done", "Hoàn tất") : t("edit", "Sửa")}
              </button>
            )}
            <button 
              onClick={() => setCartOpen(false)}
              className="p-2 hover:bg-mkhe-border/10 rounded-full transition-colors text-mkhe-text/60 hover:text-mkhe-text cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar overflow-x-hidden">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <ShoppingCart className="w-16 h-16 mb-4 text-mkhe-text/40" />
              <p className="text-lg">{t("empty", "Giỏ hàng của bạn đang trống")}</p>
              <button 
                onClick={() => setCartOpen(false)}
                className="mt-6 px-8 py-3 bg-mkhe-text text-mkhe-bg font-bold uppercase tracking-wider text-sm rounded-full hover:opacity-80 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                {t("continue_shopping", "Tiếp tục mua sắm")}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedItems.length === items.length}
                      onChange={(e) => selectAllItems(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded border-2 border-mkhe-text/40 bg-mkhe-bg peer-checked:bg-mkhe-primary peer-checked:border-mkhe-primary flex items-center justify-center transition-colors">
                      {items.length > 0 && selectedItems.length === items.length && (
                        <Check className="w-3.5 h-3.5 text-[#1a110a]" strokeWidth={4} />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-mkhe-text/80 group-hover:text-mkhe-text transition-colors">
                    {t("select_all", "Chọn tất cả")} ({items.length})
                  </span>
                </label>
              </div>
              
              {items.map((item) => {
                const isLoading = loadingItems.includes(item.product._id);
                const isSelected = selectedItems.includes(item.product._id);
                
                return (
                  <div key={item.product._id} className={`flex gap-3 sm:gap-4 p-3 sm:p-4 bg-mkhe-card rounded-2xl border transition-all ${isSelected ? 'border-mkhe-primary/50 bg-mkhe-primary/5' : 'border-mkhe-border/10'} ${isLoading ? "opacity-80" : ""}`}>
                    {/* Checkbox */}
                    <div className="flex items-center shrink-0">
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.product._id)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded border-2 border-mkhe-text/40 bg-mkhe-bg peer-checked:bg-mkhe-primary peer-checked:border-mkhe-primary flex items-center justify-center transition-colors group-hover:border-mkhe-primary/70">
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#1a110a]" strokeWidth={4} />
                          )}
                        </div>
                      </label>
                    </div>

                    <Link to={`/shop/${item.product._id}`} onClick={() => setCartOpen(false)} className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-mkhe-border/5 shrink-0 relative block">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.product.images[0])}
                          alt={item.product.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_FALLBACK_IMAGE;
                          }}
                        />
                      ) : (
                        <img
                          src={DEFAULT_FALLBACK_IMAGE}
                          alt={item.product.name}
                          className="w-full h-full object-cover opacity-80 transition-transform hover:scale-105 duration-300"
                        />
                      )}
                    </Link>
                  
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/shop/${item.product._id}`} onClick={() => setCartOpen(false)} className="font-sans font-medium text-base sm:text-lg text-mkhe-text line-clamp-2 leading-tight hover:text-mkhe-primary transition-colors">
                        {item.product.name?.normalize('NFC').replace(/Trắ[\s´́]*c/gi, 'Trắc')}
                      </Link>
                      <button 
                        onClick={() => handleRemove(item.product._id)}
                        disabled={isLoading}
                        className="p-1.5 text-mkhe-primary/80 hover:text-mkhe-primary hover:bg-mkhe-primary/10 rounded-full transition-colors shrink-0 cursor-pointer disabled:opacity-30"
                        title={t("remove_item", "Xóa sản phẩm")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-2 gap-2 sm:gap-0">
                      <div className="flex flex-col">
                        <p className="text-mkhe-primary font-medium whitespace-nowrap text-sm sm:text-base">
                          {formatNumber(
                            item.product.salePrice > 0 && item.product.saleStartDate && item.product.saleEndDate && new Date(item.product.saleStartDate) <= new Date() && new Date(item.product.saleEndDate) >= new Date()
                            ? item.product.salePrice 
                            : item.product.price
                          )} đ
                        </p>
                        {item.product.salePrice > 0 && item.product.saleStartDate && item.product.saleEndDate && new Date(item.product.saleStartDate) <= new Date() && new Date(item.product.saleEndDate) >= new Date() && (
                          <p className="text-xs text-mkhe-text/50 line-through whitespace-nowrap">
                            {formatNumber(item.product.price)} đ
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-3 bg-mkhe-bg rounded-full p-1 border border-mkhe-border/10 self-start sm:self-auto">
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isLoading}
                          className="p-1 rounded-full text-mkhe-text/60 cursor-pointer hover:text-mkhe-text hover:bg-mkhe-border/10 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className="w-6 text-center text-sm font-medium flex justify-center items-center">
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-mkhe-primary/60" /> : item.quantity}
                        </span>
                        
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || isLoading}
                          className="p-1 rounded-full text-mkhe-text/60 cursor-pointer hover:text-mkhe-text hover:bg-mkhe-border/10 disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </>
          )}
        </div>

        {/* Custom Confirm Modal */}
        {itemToDelete && (
          <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-mkhe-bg w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-mkhe-border/10">
              <h3 className="text-xl font-serif text-mkhe-text mb-2 text-center">
                {t("delete", "Xóa")}
              </h3>
              <p className="text-mkhe-text/80 mb-6 text-center text-sm">
                {itemToDelete === 'multiple' 
                  ? t("remove_multiple_confirm", { count: selectedItems.length, defaultValue: "Bạn có chắc muốn xóa sản phẩm đã chọn khỏi giỏ?" })
                  : t("remove_confirm", "Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ?")}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-mkhe-border/20 font-medium text-mkhe-text hover:bg-mkhe-border/10 transition-colors cursor-pointer"
                >
                  {t("cancel", "Hủy")}
                </button>
                <button 
                  onClick={() => {
                    if (itemToDelete === 'multiple') {
                      removeMultipleFromCart(selectedItems);
                      setIsEditMode(false);
                    } else {
                      removeFromCart(itemToDelete);
                    }
                    setItemToDelete(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 font-medium text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors cursor-pointer"
                >
                  {t("delete", "Xóa")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-mkhe-card border-t border-mkhe-border/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col gap-4 relative z-10">
            {isEditMode ? (
              <button 
                onClick={() => setItemToDelete('multiple')}
                disabled={selectedItems.length === 0}
                className="w-full py-4 bg-red-500 cursor-pointer text-white rounded-full font-medium text-lg shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
              >
                {t("delete_selected", { count: selectedItems.length, defaultValue: "Xóa sản phẩm" })}
              </button>
            ) : (
              <>
                {/* Voucher Selector Trigger */}
                <div 
                  onClick={() => setIsVoucherSelectorOpen(true)}
                  className="w-full flex items-center justify-between p-3 border hover:border-mkhe-primary/50 border-mkhe-border/30 rounded-xl bg-mkhe-bg/50 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Ticket className={`w-5 h-5 ${selectedVoucher ? "text-mkhe-primary" : "text-mkhe-text/50"}`} />
                    <span className={`font-medium ${selectedVoucher ? "text-mkhe-primary" : "text-mkhe-text/50"}`}>
                      {selectedVoucher ? `${t("voucher.selected", { defaultValue: "Đã chọn:" })} ${selectedVoucher.code}` : t("voucher.select_placeholder", { defaultValue: "🎟️ Chọn Mã Ưu Đãi" })}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-mkhe-primary group-hover:underline">
                    {selectedVoucher ? t("voucher.change", { defaultValue: "Thay đổi" }) : t("voucher.select", { defaultValue: "Chọn mã" })}
                  </span>
                </div>

                <div className="flex flex-col gap-1 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-mkhe-text/60 text-sm">{t("subtotal", { defaultValue: "Tạm tính:" })}</span>
                    <span className="font-sans font-medium text-mkhe-text/80">
                      {formatNumber(getCartTotal())} đ
                    </span>
                  </div>
                  {selectedVoucher && (
                    <div className="flex items-center justify-between text-mkhe-primary">
                      <span className="text-sm">{t("discount", { defaultValue: "Giảm giá:" })}</span>
                      <span className="font-sans font-medium">
                        -{formatNumber(getCartTotal() - getDiscountedTotal())} đ
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-mkhe-border/10 mt-1">
                    <span className="text-mkhe-text">{t("total", "Tổng cộng:")}</span>
                    <span className="text-mkhe-primary">
                      {formatNumber(getDiscountedTotal())} đ
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/checkout");
                  }}
                  disabled={selectedItems.length === 0}
                  className="w-full py-4 bg-mkhe-primary cursor-pointer text-white rounded-full font-medium text-lg shadow-lg shadow-mkhe-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  {t("checkout", "Thanh toán ngay")} {selectedItems.length > 0 && `(${selectedItems.length})`}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <VoucherSelectorDrawer 
        isOpen={isVoucherSelectorOpen}
        onClose={() => setIsVoucherSelectorOpen(false)}
        cartItems={items.filter(i => selectedItems.includes(i.product._id))}
        cartTotal={getCartTotal()}
        selectedVoucherId={selectedVoucher?._id}
        onSelectVoucher={(voucher) => {
          setSelectedVoucher(voucher);
          setIsVoucherSelectorOpen(false); // Đóng ngăn chọn mã sau khi chọn
        }}
        displayMode="dropdown"
      />
    </>
  );
};

export default MiniCartDrawer;
