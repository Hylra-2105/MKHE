import React, { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { X, Package, UploadCloud, ImageIcon, Maximize2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import { productApi } from "@/api/productApi";
import { useTranslation } from "react-i18next";
import { formatNumber, parseNumber } from "@/utils/formatters";
import { draftDB } from "@/utils/db";

const MAX_IMAGES = 10;
const LOCAL_STORAGE_KEY = "mkhe_add_product_draft";
const AUTO_SAVE_DELAY = 5000;

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation("product");
  const [loading, setLoading] = useState(false);
  const autoSaveTimeoutRef = useRef(null);

  // State cho form data
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    categoryMatrix: "B2C_Mass_Premium",
    culturalDNA: "OTHER",
    price: "",
    stock: "",
  });

  // State cho images
  const fileInputRef = useRef(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // State cho lightbox
  const [activeLightboxUrl, setActiveLightboxUrl] = useState(null);

  // ================= LOAD DRAFT TỪ INDEXEDDB =================
  useEffect(() => {
    if (!isOpen) return;

    const loadDraft = async () => {
      try {
        const saved = await draftDB.getItem(LOCAL_STORAGE_KEY);
        if (saved && saved.formData) {
          setFormData(saved.formData);
          setImageFiles(saved.imageFiles || []);

          // Re-generate preview URLs từ File objects
          if (saved.imageFiles && saved.imageFiles.length > 0) {
            const urls = saved.imageFiles.map((file) =>
              URL.createObjectURL(file),
            );
            setPreviewUrls(urls);
          }
        }
      } catch (e) {
        console.error("Lỗi load bản nháp:", e);
      }
    };

    loadDraft();
  }, [isOpen]);

  // ================= CLEANUP OBJECT URLS ON UNMOUNT =================
  useEffect(() => {
    return () => {
      // Revoke all object URLs khi component unmount hoặc modal close
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const categories = [
    { value: "B2B_Luxury", label: t("categories.B2B_Luxury") },
    { value: "B2B_Standard", label: t("categories.B2B_Standard") },
    { value: "B2C_Premium", label: t("categories.B2C_Premium") },
    { value: "B2C_Mass_Premium", label: t("categories.B2C_Mass_Premium") },
  ];

  const culturalDNAs = [
    { value: "CHAM", label: t("culturalDNA.CHAM") },
    { value: "KHMER", label: t("culturalDNA.KHMER") },
    { value: "KINH", label: t("culturalDNA.KINH") },
    { value: "OTHER", label: t("culturalDNA.OTHER") },
  ];

  // ================= AUTO-SAVE LOGIC (DEBOUNCE 5S) =================
  useEffect(() => {
    // Clear timeout cũ nếu có
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set timeout mới để save sau 5s
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        // Lưu form data + imageFiles vào IndexedDB
        await draftDB.setItem(LOCAL_STORAGE_KEY, {
          formData,
          imageFiles, // IndexedDB hỗ trợ File objects trực tiếp
        });
      } catch (e) {
        console.error("Lỗi khi lưu bản nháp:", e);
      }
    }, AUTO_SAVE_DELAY);

    // Cleanup: Clear timeout khi component unmount hoặc dữ liệu thay đổi
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, imageFiles]);

  if (!isOpen) return null;

  // HÀM CẬP NHẬT STATE (Không save ngay, để useEffect debounce xử lý)
  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  // ================= DRAG & DROP LOGIC =================
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

  const handleFileInput = (e) => {
    processFiles(e.target.files);
  };

  const processFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const newPreviews = [];

    if (imageFiles.length + fileArray.length > MAX_IMAGES) {
      toast.error(
        t("messages.max_images_error", {
          max: MAX_IMAGES,
          current: imageFiles.length,
        }),
      );
      return;
    }

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error(t("errors.invalid_file_type", "Định dạng file không hợp lệ! Chỉ chấp nhận ảnh và video."));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("errors.image_too_large", "Kích thước file không được vượt quá 10MB"));
        return;
      }
      validFiles.push(file);
      newPreviews.push({ url: URL.createObjectURL(file), type: file.type });
    });

    setImageFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove) => {
    URL.revokeObjectURL(previewUrls[indexToRemove].url);
    setImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // ================= SUBMIT & ACTIONS =================
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

      if (!response.success || !response.data?._id) {
        throw new Error("No product ID returned");
      }

      const newProductId = response.data._id;

      // Handle image upload separately
      if (imageFiles.length > 0) {
        try {
          const uploadData = new FormData();
          imageFiles.forEach((file) => uploadData.append("images", file));
          await productApi.uploadProductGallery(newProductId, uploadData);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error(
            t(
              "messages.image_upload_error",
              "Tạo sản phẩm thành công nhưng upload ảnh thất bại",
            ),
          );
          // Continue anyway - product is created
        }
      }

      toast.success(t("messages.add_success"));

      // Clear draft and reset form
      try {
        await draftDB.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.error("Error removing draft:", e);
      }

      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg === "SKU_ALREADY_EXISTS") {
        toast.error(t("messages.sku_exists"));
      } else {
        toast.error(t("messages.add_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      categoryMatrix: "B2C_Mass_Premium",
      culturalDNA: "OTHER",
      price: "",
      stock: "",
    });
    setImageFiles([]);
    previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
    setPreviewUrls([]);
  };

  const handleCancel = async () => {
    // Chủ động bấm Cancel -> XÓA SẠCH BẢN NHÁP từ IndexedDB
    resetForm();
    try {
      await draftDB.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Lỗi xóa bản nháp:", e);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-[var(--color-mkhe-bg)] w-full max-w-4xl rounded-2xl shadow-2xl overflow-visible border border-[var(--color-mkhe-border)]/30 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
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

        {/* BODY */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* CỘT TRÁI: UPLOAD ẢNH */}
          <div className="md:w-[40%] bg-mkhe-primary/5 p-6 border-b md:border-b-0 md:border-r border-[var(--color-mkhe-border)]/20 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-mkhe-primary" />
              <label className="text-xs font-bold text-mkhe-text/70 uppercase">
                {t("modal.images_label")} ({previewUrls.length}/{MAX_IMAGES})
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

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-6">
                {previewUrls.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-mkhe-border/30 aspect-square cursor-pointer hover:border-mkhe-primary transition-colors"
                    onClick={() => setActiveLightboxUrl(preview)}
                  >
                    {preview.type.startsWith("video/") ? (
                      <video
                        src={preview.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={preview.url}
                        alt={`preview-${index}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10 cursor-pointer shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <form
              id="add-product-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
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

              <div className="grid grid-cols-12 gap-4">
                <div className="space-y-1 col-span-6">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                    {t("modal.sku")}{" "}
                    <span className="ml-1 text-red-500">*</span>
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
                <div className="space-y-1 col-span-6">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                    {t("modal.category")}{" "}
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Dropdown
                    value={formData.categoryMatrix}
                    options={categories}
                    onChange={(val) => updateField("categoryMatrix", val)}
                    placeholder={t("modal.category")}
                    className="w-full"
                    triggerClassName="p-3.5 rounded-xl text-sm"
                    optionClassName="text-sm truncate"
                  />
                </div>
                <div className="space-y-1 col-span-6">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                    {t("modal.cultural_dna", "Mã gen Văn hóa")}{" "}
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Dropdown
                    value={formData.culturalDNA}
                    options={culturalDNAs}
                    onChange={(val) => updateField("culturalDNA", val)}
                    placeholder="Chọn Mã gen"
                    className="w-full"
                    triggerClassName="p-3.5 rounded-xl text-sm"
                    optionClassName="text-sm truncate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="space-y-1 col-span-6">
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
                      updateField("price", rawValue);
                    }}
                    className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                    placeholder={t("modal.price_placeholder")}
                  />
                </div>
                <div className="space-y-1 col-span-6">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                    {t("modal.stock")}
                  </label>
                  <input
                    type="text"
                    name="stock"
                    value={formatNumber(formData.stock)}
                    onChange={(e) => {
                      const rawValue = parseNumber(e.target.value);
                      updateField("stock", rawValue);
                    }}
                    className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                    placeholder={t("modal.stock_placeholder")}
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
                  rows="4"
                  className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm resize-none"
                  placeholder={t("modal.description_placeholder")}
                />
              </div>
            </form>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="p-5 border-t border-[var(--color-mkhe-border)]/20 flex justify-end items-center gap-3 bg-[var(--color-mkhe-border)]/10 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={handleCancel} // Bấm Hủy là xóa sạch form
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all disabled:opacity-50 text-sm cursor-pointer"
          >
            {t("modal.cancel")}
          </button>
          <Button
            type="submit"
            form="add-product-form"
            disabled={loading}
            className="!w-auto px-8 py-2.5 rounded-xl text-sm whitespace-nowrap"
          >
            {loading ? t("modal.processing") : t("modal.create")}
          </Button>
        </div>
      </div>

      {/* ================= LIGHTBOX (Đã chặn lây lan) ================= */}
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
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-10"
            >
              <X className="w-6 h-6" />
            </button>
            {activeLightboxUrl.type && activeLightboxUrl.type.startsWith("video/") ? (
              <video
                src={activeLightboxUrl.url || activeLightboxUrl}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
              />
            ) : (
              <img
                src={activeLightboxUrl.url || activeLightboxUrl}
                alt="Zoomed Product"
                loading="lazy"
                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductModal;
