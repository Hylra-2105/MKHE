import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { productApi } from "@/api/productApi";

const ProductGalleryUpload = ({
  productId,
  onUploadComplete,
  isDisabled = false,
}) => {
  const { t } = useTranslation("product");
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const processFiles = async (files) => {
    const validFiles = [];

    for (let file of files) {
      const isImage = file.type.startsWith("image/");

      if (!isImage) {
        toast.error(t("errors.invalid_file_type"));
        continue;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error(t("errors.image_too_large"));
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Tạo object URLs để preview
    const newPreviews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    setIsUploadModalOpen(false);

    // Upload files ngay
    await uploadGalleryToServer(validFiles);
  };

  const uploadGalleryToServer = async (files) => {
    if (!productId) {
      toast.error(t("messages.save_product_first"));
      setPreviewUrls([]);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await productApi.uploadProductGallery(
        productId,
        formData,
      );

      if (response.success) {
        toast.success(t("messages.gallery_upload_success"));
        setPreviewUrls([]);
        if (onUploadComplete) {
          onUploadComplete(response.data.images);
        }
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      toast.error(t(errorMsg));
      setPreviewUrls([]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e) => {
    processFiles(e.target.files);
  };

  const removeImage = (index) => {
    // Revoke object URL
    if (previewUrls[index]?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[index].url);
    }

    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviews);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-mkhe-primary" />
        <label className="text-[10px] font-bold text-mkhe-text/50 uppercase">
          {t("modal.gallery")}
        </label>
      </div>

      {/* MODAL KÉO THẢ FILE */}
      <div
        className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ${
          isUploadModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) =>
          e.target === e.currentTarget && setIsUploadModalOpen(false)
        }
      >
        <div
          className={`relative bg-[var(--color-mkhe-bg)] w-full max-w-md rounded-2xl shadow-2xl p-8 border border-[var(--color-mkhe-border)]/30 transform transition-all duration-200 ${
            isUploadModalOpen ? "scale-100" : "scale-95"
          }`}
        >
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="absolute top-4 right-4 p-2 cursor-pointer hover:bg-[var(--color-mkhe-primary)]/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-mkhe-text)]/70" />
          </button>

          <h2 className="text-xl font-bold text-center text-gradient-gold mb-6">
            {t("modal.upload_gallery")}
          </h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-mkhe-primary bg-mkhe-primary/10 scale-[1.02]"
                : "border-[var(--color-mkhe-border)]/50 hover:border-mkhe-primary hover:bg-[var(--color-mkhe-primary)]/5"
            }`}
          >
            <UploadCloud
              className={`w-14 h-14 mb-4 ${
                isDragging
                  ? "text-mkhe-primary"
                  : "text-[var(--color-mkhe-text)]/40"
              }`}
            />
            <p className="text-center font-semibold text-[var(--color-mkhe-text)]">
              {t("profile.drag_drop")}
            </p>
            <p className="text-sm text-[var(--color-mkhe-text)]/50 mt-2">
              {t("profile.click_browse")}
            </p>
            <div className="text-[11px] text-[var(--color-mkhe-text)]/40 mt-6 text-center">
              <p>{t("profile.support_img")}</p>
              <p>Max 10 images, 5MB each</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>
      </div>

      {/* GALLERY PREVIEWS */}
      {previewUrls.length > 0 && (
        <div className="bg-[var(--color-mkhe-input)]/50 rounded-xl p-4 border border-[var(--color-mkhe-border)]/20">
          <div className="grid grid-cols-3 gap-3">
            {previewUrls.map((preview, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-lg aspect-square"
              >
                <img
                  src={preview.url}
                  alt={`preview-${index}`}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isUploading ? "opacity-50 blur-[2px]" : "opacity-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={isUploading}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add More Button */}
            {previewUrls.length < 10 && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                disabled={isUploading || isDisabled}
                className="border-2 border-dashed border-[var(--color-mkhe-border)]/50 rounded-lg aspect-square flex items-center justify-center hover:border-mkhe-primary hover:bg-[var(--color-mkhe-primary)]/5 transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="text-2xl text-[var(--color-mkhe-text)]/40">
                  +
                </span>
              </button>
            )}
          </div>

          {isUploading && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-mkhe-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("modal.uploading")}
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {previewUrls.length === 0 && (
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          disabled={isDisabled || isUploading}
          className="w-full p-3 border-2 border-dashed border-[var(--color-mkhe-border)]/50 rounded-xl text-[var(--color-mkhe-text)]/70 hover:border-mkhe-primary hover:text-mkhe-primary transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm font-medium"
        >
          <UploadCloud className="w-4 h-4" />
          {t("modal.add_gallery")}
        </button>
      )}
    </div>
  );
};

export default ProductGalleryUpload;
