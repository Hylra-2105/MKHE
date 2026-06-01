import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Package } from "lucide-react";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import { productApi } from "@/api/productApi";
import { useTranslation } from "react-i18next";
import { formatNumber, parseNumber } from "@/utils/formatters";

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation("product");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    categoryMatrix: "B2C_Mass_Premium",
    price: "",
    stock: "",
  });

  const categories = [
    { value: "B2B_Luxury", label: t("categories.B2B_Luxury") },
    { value: "B2B_Standard", label: t("categories.B2B_Standard") },
    { value: "B2C_Premium", label: t("categories.B2C_Premium") },
    { value: "B2C_Mass_Premium", label: t("categories.B2C_Mass_Premium") },
  ];
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.price) {
      return toast.error(t("messages.fill_required"));
    }

    setLoading(true);
    try {
      const response = await productApi.createProduct({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
      });
      if (response.success) {
        toast.success(t("messages.add_success"));
        if (onSuccess) onSuccess();
        setFormData({
          name: "",
          sku: "",
          description: "",
          categoryMatrix: "B2B_Mass_Premium",
          price: "",
          stock: "",
        });
        onClose();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg === "SKU_ALREADY_EXISTS") {
        toast.error(t("messages.sku_exists"));
      } else {
        toast.error(t("messages.add_error"));
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-lg rounded-2xl shadow-2xl overflow-visible border border-[var(--color-mkhe-border)]/30 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-visible flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between mx-6 pt-6 pb-5 border-b border-[var(--color-mkhe-border)]/50 shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 mb-1 text-mkhe-primary" />
            <h2 className="text-lg font-bold text-gradient-gold">
              {t("modal.add_title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mkhe-primary/10 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-mkhe-text/70" />
          </button>
        </div>

        {/* BODY FORM */}
        <div className="p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tên sản phẩm */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("modal.name")} <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                placeholder={t("modal.name_placeholder")}
              />
            </div>

            {/* Mã SKU và Phân loại */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                  {t("modal.sku")} <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm uppercase"
                  placeholder={t("modal.sku_placeholder")}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                  {t("modal.category")}{" "}
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <Dropdown
                  value={formData.categoryMatrix}
                  options={categories}
                  onChange={(val) =>
                    handleChange({
                      target: { name: "categoryMatrix", value: val },
                    })
                  }
                  placeholder={t("modal.category")}
                  className="w-full"
                  triggerClassName="p-3.5 rounded-xl text-sm"
                  optionClassName="text-sm truncate"
                />
              </div>
            </div>

            {/* Giá bán và Tồn kho */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                  {t("modal.price")}{" "}
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="price"
                  value={formatNumber(formData.price)}
                  onChange={(e) => {
                    const rawValue = parseNumber(e.target.value);
                    handleChange({
                      target: { name: "price", value: rawValue },
                    });
                  }}
                  className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                  placeholder={t("modal.price_placeholder")}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                  {t("modal.stock")}
                </label>
                <input
                  type="text"
                  name="stock"
                  value={formatNumber(formData.stock)}
                  onChange={(e) => {
                    const rawValue = parseNumber(e.target.value);
                    handleChange({
                      target: { name: "stock", value: rawValue },
                    });
                  }}
                  className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                  placeholder={t("modal.stock_placeholder")}
                />
              </div>
            </div>

            {/* Mô tả */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("modal.description")}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm resize-none"
                placeholder={t("modal.description_placeholder")}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-mkhe-border/50 text-mkhe-text rounded-xl hover:bg-mkhe-primary/5 transition-colors font-semibold text-sm cursor-pointer disabled:opacity-50"
              >
                {t("modal.cancel")}
              </button>
              <Button type="submit" disabled={loading} className="flex-1 py-3">
                {loading ? t("modal.saving") : t("modal.save")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
