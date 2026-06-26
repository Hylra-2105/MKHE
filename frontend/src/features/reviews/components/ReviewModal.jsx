import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Star, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { reviewApi } from "@/api/reviewApi";
import { getImageUrl } from "@/utils/formatters";
import imageCompression from "browser-image-compression";

const ReviewModal = ({ isOpen, onClose, orderId, item, onSuccess }) => {
  const { t } = useTranslation(["common", "reviews"]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen || !item) return null;

  const processFiles = async (files) => {
    if (!files.length) return;

    if (images.length + files.length > 5) {
      toast.error(t("reviews:max_images_error"));
      return;
    }

    setIsUploading(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            return await imageCompression(file, options);
          } catch (error) {
            console.error("Compression error:", error);
            return file;
          }
        })
      );

      const uploadPromises = compressedFiles.map(file => reviewApi.uploadImage(file));
      const responses = await Promise.all(uploadPromises);
      // The backend wraps the response data in a 'data' field, and axios wraps the body in 'data'
      const newImages = responses.map(res => res.data?.data?.url).filter(Boolean);
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      toast.error(t("reviews:upload_error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      processFiles(files);
      e.dataTransfer.clearData();
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast.error(t("reviews:rating_required"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await reviewApi.createReview({
        product: item.product._id || item.product,
        order: orderId,
        rating,
        comment,
        images
      });
      if (response && response.data?.success) {
        toast.success(t("reviews:create_success"));
        onSuccess();
        onClose();
      }
    } catch (error) {
      const msg = error.response?.data?.message === "ALREADY_REVIEWED" 
        ? t("reviews:already_reviewed")
        : t("reviews:create_error");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--color-mkhe-bg)] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--color-mkhe-border)]/20 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-mkhe-border)]/10">
          <h2 className="text-xl font-bold text-[var(--color-mkhe-text)]">
            {t("reviews:write_review")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-mkhe-input)] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-[var(--color-mkhe-text)]/50" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Product Info Thumbnail */}
          <div className="flex items-center gap-4 p-4 bg-[var(--color-mkhe-input)]/30 rounded-xl mb-6">
            <div className="w-16 h-16 rounded-lg bg-[var(--color-mkhe-bg)] overflow-hidden flex-shrink-0">
              <img 
                src={getImageUrl(item.image)} 
                alt={item.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[var(--color-mkhe-text)] line-clamp-2">
                {item.name}
              </h4>
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="text-sm font-medium text-[var(--color-mkhe-text)]/70 mb-2">
              {t("reviews:how_would_you_rate")}
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star 
                    className={`w-10 h-10 ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-[var(--color-mkhe-input)] text-[var(--color-mkhe-border)]/50"}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--color-mkhe-text)]/80 mb-2">
              {t("reviews:comment_label")}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl bg-[var(--color-mkhe-input)]/50 border border-[var(--color-mkhe-border)]/30 p-4 text-[var(--color-mkhe-text)] focus:outline-none focus:border-mkhe-primary/50 min-h-[100px] resize-y"
              placeholder={t("reviews:comment_placeholder")}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-mkhe-text)]/80 mb-2">
              {t("reviews:upload_images")}
            </label>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, index) => (
                <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--color-mkhe-border)]/20 group">
                  <img src={img} alt="Review" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label 
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? 'border-mkhe-primary bg-mkhe-primary/10 text-mkhe-primary' : 'border-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)]/50 hover:bg-[var(--color-mkhe-input)]/50 hover:text-mkhe-primary hover:border-mkhe-primary/40'}`}
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-center leading-tight">
                        {isDragging ? t("reviews:drop_here") : t("reviews:add_photo")}
                      </span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[var(--color-mkhe-border)]/10 bg-[var(--color-mkhe-input)]/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-transparent border border-[var(--color-mkhe-border)]/30 hover:bg-[var(--color-mkhe-input)] transition-colors"
          >
            {t("common:cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-mkhe-primary text-white hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("reviews:submit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
