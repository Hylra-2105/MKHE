import { useState } from "react";
import { X, Upload, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import returnApi from "@/api/returnApi";
import InputField from "@/components/ui/InputField";
import TextAreaField from "@/components/ui/TextAreaField";

const ReturnModal = ({ order, onClose, onSuccess }) => {
  const { t } = useTranslation("history");
  const [selectedItems, setSelectedItems] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const handleCheckboxChange = (item) => {
    const remainReturnQuantity = item.remainReturnQuantity ?? item.quantity;
    if (remainReturnQuantity === 0) return;

    setSelectedItems((prev) => {
      const newItems = { ...prev };
      if (newItems[item._id]) {
        delete newItems[item._id];
      } else {
        newItems[item._id] = {
          product: item.product,
          productId: item.product?._id || item.product, // ensure we have ID
          name: item.name,
          quantity: 1,
          maxQuantity: remainReturnQuantity,
          reason: "",
          proofImages: [],
          uploading: false,
          isDragging: false,
        };
      }
      return newItems;
    });
  };

  const handleQuantityChange = (itemId, value) => {
    const qty = parseInt(value, 10);
    if (isNaN(qty)) return;
    
    setSelectedItems((prev) => {
      const max = prev[itemId].maxQuantity;
      const validQty = Math.max(1, Math.min(qty, max));
      return {
        ...prev,
        [itemId]: { ...prev[itemId], quantity: validQty },
      };
    });
  };

  const handleReasonChange = (itemId, value) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], reason: value },
    }));
    if (value.trim()) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`reason_${itemId}`];
        return newErrors;
      });
    }
  };

  const handleDragOver = (itemId, e) => {
    e.preventDefault();
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], isDragging: true },
    }));
  };

  const handleDragLeave = (itemId, e) => {
    e.preventDefault();
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], isDragging: false },
    }));
  };

  const handleDrop = (itemId, e) => {
    e.preventDefault();
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], isDragging: false },
    }));
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(itemId, { target: { files: [file] } });
    }
  };

  const handleImageUpload = async (itemId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], uploading: true },
    }));

    try {
      const response = await returnApi.uploadImage(file);
      if (response.success) {
        setSelectedItems((prev) => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            proofImages: [...prev[itemId].proofImages, response.data.url],
            uploading: false,
          },
        }));
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`images_${itemId}`];
          return newErrors;
        });
      }
    } catch (error) {
      toast.error(t("returns.create.error_upload"));
      setSelectedItems((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], uploading: false },
      }));
    }
  };

  const handleSubmit = async () => {
    const itemsToReturn = Object.values(selectedItems);
    if (itemsToReturn.length === 0) {
      toast.error(t("returns.create.error_select_item"));
      return;
    }

    let hasError = false;
    const newErrors = {};

    for (const [itemId, itemState] of Object.entries(selectedItems)) {
      if (!itemState.reason.trim()) {
        newErrors[`reason_${itemId}`] = t("returns.create.error_reason");
        hasError = true;
      }
      if (itemState.proofImages.length === 0) {
        newErrors[`images_${itemId}`] = t("returns.create.upload_proof") + " !";
        hasError = true;
      }
    }

    if (hasError) {
      setFormErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        orderId: order._id,
        items: itemsToReturn.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          reason: i.reason,
          proofImages: i.proofImages
        })),
      };

      const response = await returnApi.createReturn(payload);
      if (response.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-[var(--color-mkhe-bg)] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--color-mkhe-border)]/20 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-mkhe-border)]/10">
          <h2 className="text-xl font-bold text-[var(--color-mkhe-text)]">
            {t("returns.create.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-mkhe-input)] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-[var(--color-mkhe-text)]/50" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          <p className="text-sm text-[var(--color-mkhe-text)]/70">
            {t("returns.create.desc")}
          </p>

          <div className="space-y-4">
            {order.items.map((item) => {
              const remainReturnQuantity = item.remainReturnQuantity ?? item.quantity;
              const isFullyReturned = remainReturnQuantity === 0;
              const isSelected = !!selectedItems[item._id];
              const itemState = selectedItems[item._id];

              return (
                <div key={item._id} className={`border rounded-xl p-4 transition-all duration-200 ${isFullyReturned ? 'border-[var(--color-mkhe-border)]/5 bg-[var(--color-mkhe-bg)]' : isSelected ? 'border-[var(--color-mkhe-primary)]/50 bg-[var(--color-mkhe-primary)]/5 shadow-sm shadow-[var(--color-mkhe-primary)]/10' : 'border-[var(--color-mkhe-primary)]/20 bg-[var(--color-mkhe-input)]/20 hover:border-[var(--color-mkhe-primary)]/40'}`}>
                  <div 
                    className={`flex items-start gap-4 ${!isFullyReturned ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (!isFullyReturned) handleCheckboxChange(item);
                    }}
                  >
                    <div 
                      className={`h-16 flex items-center relative ${isFullyReturned ? 'opacity-40' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        id={`return-cb-${item._id}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(item)}
                        disabled={isFullyReturned}
                        className="magic-cb-input"
                      />
                      <label htmlFor={`return-cb-${item._id}`} className={`magic-cb-label ${isFullyReturned ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <span></span>
                      </label>
                    </div>
                    <div className={`w-16 h-16 rounded-lg bg-[var(--color-mkhe-bg)] overflow-hidden flex-shrink-0 ${isFullyReturned ? 'grayscale opacity-60' : ''}`}>
                      <img 
                        src={item.image || "https://placehold.co/100x100?text=No+Image"} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className={`flex-1 ${isFullyReturned ? 'opacity-80' : ''}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-[var(--color-mkhe-text)]">{item.name}</h4>
                        {isFullyReturned && (
                          <span className="text-[10px] font-bold bg-red-500/20 text-red-500 px-2.5 py-1 rounded-full whitespace-nowrap border border-red-500/20 shadow-sm shadow-red-500/10">Đã báo lỗi tối đa</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-mkhe-text)]/50 mt-1">Đã mua: {item.quantity}</p>
                      {item.returnedQuantity > 0 && !isFullyReturned && (
                        <p className="text-xs text-amber-500 font-medium mt-0.5">Đã báo lỗi: {item.returnedQuantity} (Còn lại: {remainReturnQuantity})</p>
                      )}
                      <p className="text-sm font-bold text-mkhe-primary mt-1">{formatMoney(item.price)}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-mkhe-border)]/10 space-y-4 animate-in slide-in-from-top-2">
                      <div className="w-48">
                        <InputField 
                          type="number"
                          label={t("returns.create.item_qty")}
                          min="1"
                          max={itemState.maxQuantity}
                          value={itemState.quantity}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <TextAreaField
                          label={t("returns.reason_label")}
                          value={itemState.reason}
                          onChange={(e) => handleReasonChange(item._id, e.target.value)}
                          placeholder={t("returns.create.reason_placeholder")}
                          error={formErrors[`reason_${item._id}`]}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-2">
                          {t("returns.create.upload_proof")} <span className="ml-1 text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {itemState.proofImages.map((img, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[var(--color-mkhe-border)]/20 shadow-sm">
                              {img.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                <video src={img} className="w-full h-full object-cover" autoPlay muted loop />
                              ) : (
                                <img src={img} alt="Proof" className="w-full h-full object-cover" />
                              )}
                              <button 
                                onClick={() => {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    [item._id]: {
                                      ...prev[item._id],
                                      proofImages: prev[item._id].proofImages.filter((_, i) => i !== index)
                                    }
                                  }))
                                }}
                                className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-black/70 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <label 
                            onDragOver={(e) => handleDragOver(item._id, e)}
                            onDragLeave={(e) => handleDragLeave(item._id, e)}
                            onDrop={(e) => handleDrop(item._id, e)}
                            className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                              itemState.isDragging 
                                ? "border-mkhe-primary bg-mkhe-primary/10 scale-105" 
                                : "border-[var(--color-mkhe-border)]/30 hover:border-mkhe-primary hover:bg-[var(--color-mkhe-input)]/50"
                            }`}
                          >
                            {itemState.uploading ? (
                              <Loader2 className="w-5 h-5 text-mkhe-primary animate-spin" />
                            ) : (
                              <>
                                <Upload className={`w-5 h-5 mb-1 ${itemState.isDragging ? "text-mkhe-primary" : "text-[var(--color-mkhe-text)]/40"}`} />
                                <span className="text-[10px] text-[var(--color-mkhe-text)]/50 font-medium text-center px-1 leading-tight">{t("returns.create.upload_proof")}</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*,video/*"
                              className="hidden" 
                              onChange={(e) => handleImageUpload(item._id, e)}
                              disabled={itemState.uploading}
                            />
                          </label>
                        </div>
                        {formErrors[`images_${item._id}`] && (
                          <div className="flex items-center gap-1.5 mt-2 ml-1 text-red-500">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p className="text-xs font-medium">{formErrors[`images_${item._id}`]}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-mkhe-border)]/10 bg-[var(--color-mkhe-input)]/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-xl hover:bg-[var(--color-mkhe-border)]/50 transition-all cursor-pointer"
          >
            {t("returns.create.cancel_btn")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(selectedItems).length === 0}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-mkhe-primary text-white hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-mkhe-primary/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("returns.create.submit_btn")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;
