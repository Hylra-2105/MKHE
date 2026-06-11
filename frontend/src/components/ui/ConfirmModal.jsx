import React from "react";
import { X, CheckCircle, AlertCircle, Trash2, ShieldCheck } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  loadingText = null,
  cancelText = "Cancel",
  loading = false,
  isDanger = false,
  icon = "check", // 'check', 'trash', 'shield', 'alert'
  children = null, // Custom content (e.g., dropdown)
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (icon) {
      case "trash":
        return <Trash2 className="w-8 h-8 text-red-500" />;
      case "shield":
        return <ShieldCheck className="w-8 h-8 text-green-500" />;
      case "alert":
        return <AlertCircle className="w-8 h-8 text-amber-500" />;
      case "check":
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  const getIconBgColor = () => {
    switch (icon) {
      case "trash":
        return "bg-red-50 border border-red-100";
      case "shield":
        return "bg-green-50 border border-green-100";
      case "alert":
        return "bg-amber-50 border border-amber-100";
      case "check":
      default:
        return "bg-green-50 border border-green-100";
    }
  };

  const getButtonColor = () => {
    if (isDanger) {
      return "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30";
    }
    switch (icon) {
      case "trash":
        return "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30";
      case "shield":
        return "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30";
      case "alert":
        return "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30";
      case "check":
      default:
        return "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className={`bg-[var(--color-mkhe-bg)] w-full ${children ? "max-w-md" : "max-w-sm"} p-6 rounded-2xl shadow-2xl border border-[var(--color-mkhe-border)]/20 text-center relative transition-colors animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 text-[var(--color-mkhe-text)]/50 hover:text-[var(--color-mkhe-text)] hover:bg-[var(--color-mkhe-border)]/20 rounded-full transition-all cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5 transition-colors" />
        </button>

        {/* ICON */}
        <div
          className={`w-16 h-16 ${getIconBgColor()} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors`}
        >
          {getIcon()}
        </div>

        {/* TITLE */}
        <h3 className="text-xl font-bold text-[var(--color-mkhe-text)] mb-2 transition-colors">
          {title}
        </h3>

        {/* MESSAGE */}
        <p className="text-sm text-[var(--color-mkhe-text)]/70 mb-6 leading-relaxed transition-colors">
          {message}
        </p>

        {/* CUSTOM CONTENT (e.g., dropdown) */}
        {children && <div className="mb-6">{children}</div>}

        {/* BUTTONS */}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-xl hover:bg-[var(--color-mkhe-border)]/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center ${getButtonColor()}`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin"></div>
            )}
            {loading && loadingText ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
