import React from "react";
import { UploadCloud, ImageIcon, Trash2, RotateCcw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isVideoMedia } from "@/utils/validators";

const ImageGalleryUploader = ({
  maxImages = 10,
  keptImages = [],
  newImagePreviews = [],
  deletedImages = [],
  isDragging,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputClick,
  onFileInputChange,
  onSetActiveLightboxUrl,
  onMarkImageForDeletion,
  onUndoDeleteImage,
  onRemoveNewImage
}) => {
  const { t } = useTranslation("product");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-4 h-4 text-mkhe-primary" />
        <label className="text-xs font-bold text-mkhe-text/70 uppercase">
          {t("modal.gallery_label", { defaultValue: "BỘ SƯU TẬP ẢNH" })} (
          {keptImages.length + newImagePreviews.length}/{maxImages})
        </label>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onFileInputClick}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 origin-center ${
          isDragging
            ? "border-mkhe-primary bg-mkhe-primary/10 scale-100 shadow-lg"
            : "border-[var(--color-mkhe-border)]/50 hover:border-mkhe-primary hover:bg-mkhe-primary/5 scale-[0.98]"
        }`}
      >
        <div className="pointer-events-none flex flex-col items-center">
          <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? "text-mkhe-primary" : "text-mkhe-text/40"}`} />
          <p className="text-sm text-center font-semibold text-mkhe-text/80">
            {t("modal.drag_drop_text", { defaultValue: "Kéo thả ảnh / video vào đây" })}
          </p>
          <p className="text-xs text-mkhe-text/50 mt-1">
            {t("modal.click_to_select", { defaultValue: "Hoặc click để chọn file từ thiết bị" })}
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileInputChange}
          accept="image/*,video/*"
          multiple
          className="hidden"
        />
      </div>

      {/* 1. ẢNH ĐANG GIỮ LẠI (KEPT IMAGES) */}
      {keptImages.length > 0 && (
        <div className="mt-6">
          <p className="text-[10px] font-bold text-mkhe-text/50 uppercase mb-3">
            {t("modal.current_images", { defaultValue: "ẢNH HIỆN TẠI" })}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {keptImages.map((url, index) => (
              <div
                key={`kept-${index}`}
                className="relative group rounded-xl overflow-hidden border border-[var(--color-mkhe-border)] aspect-square bg-[var(--color-mkhe-border)]/5 flex items-center justify-center cursor-pointer hover:border-mkhe-primary transition-colors"
                onClick={() => onSetActiveLightboxUrl(url)}
              >
                {isVideoMedia(url) ? (
                  <video src={url} className="w-full h-full object-cover" muted />
                ) : (
                  <img
                    src={url}
                    alt={`kept-${index}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkImageForDeletion(url);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10 cursor-pointer shadow-md"
                  title={t("modal.mark_for_deletion", { defaultValue: "Xóa ảnh" })}
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
            {t("modal.new_images", { defaultValue: "ẢNH MỚI THÊM" })}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {newImagePreviews.map((url, index) => (
              <div
                key={`new-${index}`}
                className="relative group rounded-lg overflow-hidden border border-mkhe-primary/50 aspect-square cursor-pointer transition-colors"
                onClick={() => onSetActiveLightboxUrl(url.url)}
              >
                {url.type && url.type.startsWith("video/") ? (
                  <video src={url.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img
                    src={url.url}
                    alt={`new-${index}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveNewImage(index);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10 cursor-pointer shadow-md"
                  title={t("modal.delete_image", { defaultValue: "Xóa" })}
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-mkhe-primary/90 py-0.5 text-center">
                  <span className="text-[9px] text-white font-bold uppercase">
                    {t("modal.new_badge", { defaultValue: "Mới" })}
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
            {t("modal.marked_for_deletion", { defaultValue: "ĐÃ ĐÁNH DẤU XÓA" })}
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
                  loading="lazy"
                  className="w-full h-full object-cover grayscale opacity-40 blur-[1px]"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                  <Trash2 className="w-6 h-6 text-red-500 mb-1" />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUndoDeleteImage(url);
                  }}
                  className="absolute top-1 right-1 p-1.5 bg-mkhe-primary text-white rounded-full hover:scale-110 transition-transform z-10 cursor-pointer shadow-lg"
                  title={t("modal.restore_image", { defaultValue: "Hoàn tác" })}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryUploader;
