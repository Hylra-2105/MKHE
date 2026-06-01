import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Edit3, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Dropdown from "@/components/ui/Dropdown";
import { productApi } from "@/api/productApi";
import { useTranslation } from "react-i18next";
import { formatNumber, parseNumber } from "@/utils/formatters";

const EditProductModal = ({ isOpen, onClose, onSuccess, product }) => {
  const { t } = useTranslation("product");
  const [loading, setLoading] = useState(false);

  // State quản lý confirm Modal xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    categoryMatrix: "B2B_Luxury",
    price: "",
    stock: "",
    status: "DRAFT",
  });

  const categories = [
    { value: "B2B_Luxury", label: t("categories.B2B_Luxury") },
    { value: "B2B_Standard", label: t("categories.B2B_Standard") },
    { value: "B2C_Premium", label: t("categories.B2C_Premium") },
    { value: "B2C_Mass_Premium", label: t("categories.B2C_Mass_Premium") },
  ];

  const statuses = [
    {
      value: "DRAFT",
      label: t("statuses.DRAFT"),
      color: "text-gray-500",
    },
    {
      value: "PUBLISHED",
      label: t("statuses.PUBLISHED"),
      color: "text-green-700",
    },
    {
      value: "OUT_OF_STOCK",
      label: t("statuses.OUT_OF_STOCK"),
      color: "text-red-700",
    },
  ];

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        categoryMatrix: product.categoryMatrix || "B2B_Luxury",
        price: product.price || "",
        stock: product.stock || "",
        status: product.status || "DRAFT",
      });
      setShowDeleteConfirm(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

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
      const response = await productApi.updateProduct(product._id, {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
      });
      console.log("Update response:", response);
      if (response.success) {
        toast.success(t("messages.update_success"));
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg === "SKU_ALREADY_EXISTS") {
        toast.error(t("messages.sku_exists"));
      } else {
        toast.error(t("messages.update_error"));
      }
      console.error("Edit product error:", error);
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    setLoading(true);
    try {
      const res = await productApi.deleteProduct(product._id);
      if (res.success) {
        toast.success(t("messages.delete_success"));
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(t("messages.delete_error"));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-visible border border-[var(--color-mkhe-border)]/30 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-visible flex flex-col transition-colors">
        {/* HEADER */}
        <div className="flex items-center justify-between mx-6 pt-6 pb-5 border-b border-[var(--color-mkhe-border)]/50 shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 mb-1 text-mkhe-primary" />
            <h2 className="text-lg font-bold text-gradient-gold">
              {t("modal.edit_title")} - {product.sku}
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
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <form
            id="edit-product-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="space-y-1 col-span-7">
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
                />
              </div>

              <div className="space-y-1 col-span-5">
                <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                  {t("modal.status")}
                </label>
                <Dropdown
                  value={formData.status}
                  options={statuses}
                  onChange={(val) =>
                    handleChange({ target: { name: "status", value: val } })
                  }
                  placeholder={t("modal.status")}
                  className="w-full"
                  triggerClassName="p-3.5 rounded-xl text-sm font-semibold"
                  optionClassName="text-sm"
                />
              </div>
            </div>

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
                  disabled
                  className="w-full p-3.5 bg-mkhe-text/5 border border-mkhe-border/50 text-mkhe-text/50 rounded-xl focus:outline-none transition-colors text-sm uppercase cursor-not-allowed"
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
                  dropdownClassName="w-max min-w-full"
                  optionClassName="text-sm whitespace-nowrap"
                />
              </div>
            </div>

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
                />
              </div>
            </div>

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
              />
            </div>
          </form>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="p-5 border-t border-[var(--color-mkhe-border)]/20 flex justify-between items-center bg-[var(--color-mkhe-border)]/10 shrink-0 rounded-b-2xl transition-colors">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg font-bold text-sm hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 transition-colors" />{" "}
              {t("table.delete")}
            </button>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {t("modal.cancel")}
            </button>
            <Button
              type="submit"
              form="edit-product-form"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg shadow-lg text-sm"
            >
              {loading ? t("modal.saving") : t("modal.save")}
            </Button>
          </div>
        </div>

        {/* POPUP XÁC NHẬN XÓA */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onConfirm={executeDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          title={t("messages.delete_confirm_title")}
          message={t("messages.delete_confirm_desc")}
          confirmText={t("modal.confirm_delete")}
          loadingText={t("modal.deleting")}
          cancelText={t("modal.cancel")}
          loading={loading}
          icon="trash"
          isDanger={true}
        />
      </div>
    </div>
  );
};

export default EditProductModal;
