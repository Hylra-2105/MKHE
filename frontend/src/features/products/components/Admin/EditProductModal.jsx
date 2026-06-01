import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X,
  Edit3,
  Trash2,
  UploadCloud,
  ImageIcon,
  RotateCcw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Dropdown from "@/components/ui/Dropdown";
import { productApi } from "@/api/productApi";
import { useTranslation } from "react-i18next";
import { formatNumber, parseNumber } from "@/utils/formatters";

const MAX_IMAGES = 10;

const EditProductModal = ({ isOpen, onClose, onSuccess, product }) => {
  const { t } = useTranslation("product");
  const [loading, setLoading] = useState(false);
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

  // --- STATE FOR IMAGES ---
  const fileInputRef = useRef(null);
  const [keptImages, setKeptImages] = useState([]); // Ảnh cũ giữ lại
  const [deletedImages, setDeletedImages] = useState([]); // Ảnh cũ đánh dấu xóa
  const [newImageFiles, setNewImageFiles] = useState([]); // Ảnh mới từ máy (File)
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Link preview ảnh mới

  const [isDragging, setIsDragging] = useState(false);
  const [activeLightboxUrl, setActiveLightboxUrl] = useState(null);

  const categories = [
    { value: "B2B_Luxury", label: t("categories.B2B_Luxury") },
    { value: "B2B_Standard", label: t("categories.B2B_Standard") },
    { value: "B2C_Premium", label: t("categories.B2C_Premium") },
    { value: "B2C_Mass_Premium", label: t("categories.B2C_Mass_Premium") },
  ];

  const statuses = [
    { value: "DRAFT", label: t("statuses.DRAFT") },
    { value: "PUBLISHED", label: t("statuses.PUBLISHED") },
    { value: "OUT_OF_STOCK", label: t("statuses.OUT_OF_STOCK") },
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
      // Load ảnh có sẵn
      setKeptImages(product.images || []);
      setDeletedImages([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setShowDeleteConfirm(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= QUẢN LÝ ẢNH =================
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };
  const handleFileInput = (e) => processFiles(e.target.files);

  const processFiles = (files) => {
    const fileArray = Array.from(files);
    // Tính tổng số ảnh sẽ tồn tại (giữ lại + mới thêm)
    const totalImages =
      keptImages.length + newImagePreviews.length + fileArray.length;

    if (totalImages > MAX_IMAGES) {
      toast.error(
        t("messages.max_images_error", {
          max: MAX_IMAGES,
          current: keptImages.length + newImagePreviews.length,
        }),
      );
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/"))
        return toast.error(t("messages.invalid_file_type"));
      if (file.size > 5 * 1024 * 1024)
        return toast.error(t("messages.image_too_large"));

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setNewImageFiles((prev) => [...prev, ...validFiles]);
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 1. Đánh dấu xóa ảnh cũ
  const markImageForDeletion = (imageUrl) => {
    setKeptImages((prev) => prev.filter((img) => img !== imageUrl));
    setDeletedImages((prev) => [...prev, imageUrl]);
  };

  // 2. Hoàn tác xóa ảnh cũ
  const undoDeleteImage = (imageUrl) => {
    setDeletedImages((prev) => prev.filter((img) => img !== imageUrl));
    setKeptImages((prev) => [...prev, imageUrl]);
  };

  // 3. Xóa ảnh mới vừa chọn
  const removeNewImage = (indexToRemove) => {
    URL.revokeObjectURL(newImagePreviews[indexToRemove]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // ================= SUBMIT =================
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

      if (!response.success) {
        throw new Error("Product update failed");
      }

      // 2. UPLOAD ẢNH MỚI NẾU CÓ
      if (newImageFiles.length > 0) {
        const uploadData = new FormData();
        newImageFiles.forEach((file) => uploadData.append("images", file));

        try {
          const uploadResponse = await productApi.uploadProductGallery(
            product._id,
            uploadData,
          );
          if (!uploadResponse.success) {
            throw new Error("Image upload failed");
          }
        } catch (uploadError) {
          console.error("[EditProduct] Upload error:", uploadError);
          toast.error(t("messages.gallery_upload_error"));
          throw uploadError;
        }
      }

      // 3. GỌI API XÓA ẢNH CŨ NẾU CÓ ĐÁNH DẤU XÓA
      if (deletedImages.length > 0) {
        try {
          const deleteResponse = await productApi.deleteProductImages(
            product._id,
            deletedImages,
          );
          if (!deleteResponse.success) {
            throw new Error("Image deletion failed");
          }
        } catch (deleteError) {
          console.error("[EditProduct] Delete error:", deleteError);
          toast.error(t("messages.gallery_delete_error"));
          throw deleteError;
        }
      }

      toast.success(t("messages.update_success"));
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setDeletedImages([]);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("[EditProduct] Submit error:", error);
      const errorMsg = error.response?.data?.message;
      if (errorMsg === "SKU_ALREADY_EXISTS") {
        toast.error(t("messages.sku_exists"));
      } else if (error.message?.includes("Image")) {
        // Already handled above
      } else {
        toast.error(t("messages.update_error"));
      }
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

  const handleCancel = () => {
    // Reset all image states when canceling
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setDeletedImages([]);
    setKeptImages(product.images || []);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-5xl rounded-2xl shadow-2xl overflow-visible border border-[var(--color-mkhe-border)]/30 flex flex-col max-h-[90vh]">
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

        {/* BODY */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* CỘT TRÁI: QUẢN LÝ ẢNH */}
          <div className="md:w-[40%] bg-mkhe-primary/5 p-6 border-b md:border-b-0 md:border-r border-[var(--color-mkhe-border)]/20 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-mkhe-primary" />
              <label className="text-xs font-bold text-mkhe-text/70 uppercase">
                {t("modal.gallery_label")} (
                {keptImages.length + newImagePreviews.length}/{MAX_IMAGES})
              </label>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-mkhe-primary bg-mkhe-primary/10 scale-[1.02]"
                  : "border-[var(--color-mkhe-border)]/50 hover:border-mkhe-primary hover:bg-mkhe-primary/5"
              }`}
            >
              <UploadCloud
                className={`w-10 h-10 mb-3 ${isDragging ? "text-mkhe-primary" : "text-mkhe-text/40"}`}
              />
              <p className="text-sm text-center font-semibold text-mkhe-text/80">
                {t("modal.drag_drop_text")}
              </p>
              <p className="text-xs text-mkhe-text/50 mt-1">
                {t("modal.click_to_select")}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
            </div>

            {/* 1. ẢNH ĐANG GIỮ LẠI (KEPT IMAGES) */}
            {keptImages.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-bold text-mkhe-text/50 uppercase mb-3">
                  {t("modal.current_images")}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {keptImages.map((url, index) => (
                    <div
                      key={`kept-${index}`}
                      className="relative group rounded-lg overflow-hidden border border-mkhe-border/30 aspect-square cursor-pointer hover:border-mkhe-primary transition-colors"
                      onClick={() => setActiveLightboxUrl(url)}
                    >
                      <img
                        src={url}
                        alt={`kept-${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markImageForDeletion(url);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10 cursor-pointer shadow-md"
                        title={t("modal.mark_for_deletion")}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. ẢNH MỚI UPLOAD (NEW IMAGES) */}
            {newImagePreviews.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-bold text-mkhe-primary uppercase mb-3">
                  {t("modal.new_images")}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {newImagePreviews.map((url, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative group rounded-lg overflow-hidden border border-mkhe-primary/50 aspect-square cursor-pointer transition-colors"
                      onClick={() => setActiveLightboxUrl(url)}
                    >
                      <img
                        src={url}
                        alt={`new-${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNewImage(index);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10 cursor-pointer shadow-md"
                        title={t("modal.delete_image")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-mkhe-primary/90 py-0.5 text-center">
                        <span className="text-[9px] text-white font-bold uppercase">
                          {t("modal.new_badge")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ẢNH ĐÁNH DẤU XÓA (DELETED IMAGES) */}
            {deletedImages.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-bold text-red-500 uppercase mb-3">
                  {t("modal.marked_for_deletion")}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {deletedImages.map((url, index) => (
                    <div
                      key={`deleted-${index}`}
                      className="relative rounded-lg overflow-hidden border-2 border-red-500/50 aspect-square"
                    >
                      <img
                        src={url}
                        alt={`deleted-${index}`}
                        className="w-full h-full object-cover grayscale opacity-40 blur-[1px]"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                        <Trash2 className="w-6 h-6 text-red-500 mb-1" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          undoDeleteImage(url);
                        }}
                        className="absolute top-1 right-1 p-1.5 bg-mkhe-primary text-white rounded-full hover:scale-110 transition-transform z-10 cursor-pointer shadow-lg"
                        title={t("modal.restore_image")}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <form
              id="edit-product-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="space-y-1 col-span-7">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                    {t("modal.name")}{" "}
                    <span className="ml-1 text-red-500">*</span>
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
                    triggerClassName="p-3.5 rounded-xl text-sm"
                    optionClassName="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                    {t("modal.sku")}{" "}
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
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
        </div>

        {/* FOOTER BUTTONS */}
        <div className="p-5 border-t border-[var(--color-mkhe-border)]/20 flex justify-between items-center bg-[var(--color-mkhe-border)]/10 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg font-bold text-sm hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> {t("table.delete")}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2.5 bg-transparent text-mkhe-text font-bold rounded-xl hover:bg-mkhe-border/20 transition-colors disabled:opacity-50 text-sm cursor-pointer"
            >
              {t("modal.cancel")}
            </button>
            <Button
              type="submit"
              form="edit-product-form"
              disabled={loading}
              className="!w-auto px-8 py-2.5 rounded-xl text-sm whitespace-nowrap"
            >
              {loading ? t("modal.processing") : t("modal.save")}
            </Button>
          </div>
        </div>

        {/* ================= LIGHTBOX ================= */}
        {activeLightboxUrl && (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setActiveLightboxUrl(null);
            }}
          >
            <div
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveLightboxUrl(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={activeLightboxUrl}
                alt="Zoomed Product"
                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        )}

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
