import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axiosClient";
import {
  X,
  User,
  MapPin,
  Info,
  Lock,
  Unlock,
  Trash2,
  ShieldCheck,
  Edit2,
  Check,
  XCircle,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import Button from '@/components/ui/Button';
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  getLastNameInitial,
  isValidPhoneInput,
  isVideoMedia,
} from "@/utils/validators";
import EditableField from "@/features/users/components/Admin/EditableField";

const UserDetailModal = ({ isOpen, onClose, user, onRefresh, lockOnly = false, viewOnly = false }) => {
  const { t } = useTranslation("admin");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [originalEditForm, setOriginalEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Trạng thái bật/tắt các Popup con
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isReasonDropdownOpen, setIsReasonDropdownOpen] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);

  // Lý do khóa mặc định (sẽ lấy từ key i18n đầu tiên)
  const [blockReason, setBlockReason] = useState("spam_comments");

  useEffect(() => {
    if (user && isOpen) {
      const defaultAddr = user.addresses?.find((a) => a.isDefault);
      const initialForm = {
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        isBlocked: user.isBlocked ?? false,
        defaultAddressText: defaultAddr?.addressText || "",
        defaultAddressName: defaultAddr?.receiverName || "",
        defaultAddressPhone: defaultAddr?.receiverPhone || "",
      };
      setEditForm(initialForm);
      setOriginalEditForm(initialForm);
      setIsEditing(false);
    } else if (!isOpen) {
      setEditForm({});
      setShowBlockConfirm(false);
      setShowDeleteConfirm(false);
    }
  }, [user, isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (showBlockConfirm) {
      setBlockReason("spam_comments");
      setIsReasonDropdownOpen(false);
    }
  }, [showBlockConfirm]);

  if (!isOpen || !user) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Không format prefix nữa
  let displayPhone = editForm.phone || "";
  const hasChanges = JSON.stringify(editForm) !== JSON.stringify(originalEditForm);
  // ==========================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "phone") {
      if (!isValidPhoneInput(finalValue)) return;
    }

    setEditForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = async () => {
    let dataToSave = {
      name: editForm.name,
      phone: editForm.phone,
      bio: editForm.bio,
      isBlocked: editForm.isBlocked,
      blockReason: editForm.blockReason,
    };

    setIsSaving(true);
    try {
      const response = await axiosClient.put(`/users/${user._id}`, dataToSave);

      if (response.data.success) {
        const savedForm = { ...editForm, phone: dataToSave.phone };
        setEditForm(savedForm);
        setOriginalEditForm(savedForm);

        setIsEditing(false);
        setIsSaving(false);
        toast.success(t("messages.update_success"));

        if (onRefresh) onRefresh();
      }
    } catch (error) {
      setIsSaving(false);
      console.error(t("messages.update_error_log"), error);
      const errorCode = error.response?.data?.message;
      toast.error(
        errorCode
          ? t(`messages.${errorCode}`) || t(errorCode, { ns: "common" })
          : t("messages.server_error") || t("SERVER_ERROR", { ns: "common" }),
      );
    }
  };

  const handleCancel = () => {
    setEditForm(originalEditForm);
    setIsEditing(false);
  };

  // Hàm thực thi XÓA vĩnh viễn
  const executeDelete = async () => {
    try {
      const response = await axiosClient.delete(`/users/${user._id}`);
      if (response.data.success) {
        toast.success(t("messages.delete_success"));
        if (onRefresh) onRefresh();
        onClose();
      }
    } catch (error) {
      console.error(t("messages.update_error_log"), error);
      const errorCode = error.response?.data?.message;
      toast.error(
        errorCode
          ? t(`messages.${errorCode}`) || t(errorCode, { ns: "common" })
          : t("messages.server_error") || t("SERVER_ERROR", { ns: "common" }),
      );
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Hàm điều hướng khi bấm nút Khóa/Mở khóa ở Footer
  const handleBlockButtonClick = () => {
    if (editForm.isBlocked) {
      setShowUnlockConfirm(true);
    } else {
      setShowBlockConfirm(true);
    }
  };

  // Hàm thực thi KHÓA (Gửi kèm lý do lên API) hoặc MỞ KHÓA
  const executeBlockToggle = async (status, reason) => {
    setIsSaving(true);
    try {
      const response = await axiosClient.put(`/users/${user._id}`, {
        isBlocked: status,
        blockReason: reason,
      });

      if (response.data.success) {
        toast.success(
          status ? t("messages.lock_success") : t("messages.unlock_success"),
        );

        const updatedForm = { ...editForm, isBlocked: status };
        setEditForm(updatedForm);
        setOriginalEditForm(updatedForm);

        if (onRefresh) onRefresh();

        // Đóng modal sau 1 giây
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Block Toggle Error:", error);
      const errorCode = error.response?.data?.message;
      toast.error(
        errorCode
          ? t(`messages.${errorCode}`) || t(errorCode, { ns: "common" })
          : t("messages.server_error") || t("SERVER_ERROR", { ns: "common" }),
      );
    } finally {
      setIsSaving(false);
      setShowBlockConfirm(false);
      setShowUnlockConfirm(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-300"
    >
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-[var(--color-mkhe-border)]/30 transition-colors">
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-[var(--color-mkhe-border)]/20 shrink-0 transition-colors">
          <h2 className="text-xl font-bold text-gradient-gold flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--color-mkhe-primary)]" />
            {t("users.detail_title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-mkhe-border)]/20 rounded-full transition-all cursor-pointer text-[var(--color-mkhe-text)]/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            {/* CỘT TRÁI */}
            <div className="md:col-span-4 bg-[var(--color-mkhe-primary)]/5 p-8 border-r border-[var(--color-mkhe-border)]/20 flex flex-col items-center text-center sticky top-0 h-max transition-colors">
              {user.avatar && isVideoMedia(user.avatar) ? (
                <video
                  src={user.avatar}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-32 h-32 rounded-full object-cover border-4 border-[var(--color-mkhe-input)] shadow-xl mb-4 transition-colors"
                />
              ) : (
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${getLastNameInitial(user.name)}&background=random`
                  }
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[var(--color-mkhe-input)] shadow-xl mb-4 transition-colors"
                />
              )}

              <p className="text-xs font-mono text-[var(--color-mkhe-text)]/40 mb-6 break-all bg-[var(--color-mkhe-input)] px-2 py-1 rounded border border-[var(--color-mkhe-border)]/20 transition-colors">
                ID: {user._id}
              </p>
              <div className="w-full space-y-4 text-left">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--color-mkhe-text)]/40 block mb-1 text-center transition-colors">
                    {t("common.role")}
                  </label>
                  <div
                    className={`h-10 flex items-center justify-center gap-2 px-4 rounded-lg border transition-colors ${user.role === "Admin" ? "bg-rose-500/10 border-rose-500/20 text-rose-600" : "bg-blue-500/10 border-blue-500/20 text-blue-600"}`}
                  >
                    <span className="text-sm font-bold transition-colors">
                      {t(`roles.${user.role?.toLowerCase()}`)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--color-mkhe-text)]/40 block mb-1 text-center transition-colors">
                    {t("common.status")}
                  </label>
                  <div
                    className={`h-10 flex items-center justify-center px-4 rounded-lg border transition-colors ${
                      editForm.isBlocked
                        ? "bg-orange-500/10 border-orange-500/20 text-orange-600"
                        : (user.role === "Enterprise" && user.resetPasswordToken) || user.isVerified === false
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    }`}
                  >
                    <span className="text-sm font-bold uppercase transition-colors">
                      {editForm.isBlocked
                        ? t("common.blocked")
                        : (user.role === "Enterprise" && user.resetPasswordToken) || user.isVerified === false
                        ? t("table.status_pending", "Chờ kích hoạt")
                        : t("common.active")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="md:col-span-8 p-6 space-y-2">
              <div>
                <h4 className="text-sm font-bold text-[var(--color-mkhe-primary)] uppercase tracking-widest mb-2 flex items-center gap-2 transition-colors">
                  <User className="w-4 h-4" /> {t("users.basic_info")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <EditableField
                    label={t("users.fullname")}
                    name="name"
                    value={editForm.name}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                  />
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--color-mkhe-text)]/40 block mb-1 flex items-center gap-1 transition-colors">
                      {t("users.email_readonly")}
                    </label>
                    <p className="text-[var(--color-mkhe-text)] font-semibold border-b border-[var(--color-mkhe-border)]/10 pb-1 h-8 flex items-end opacity-70 transition-colors">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--color-mkhe-primary)] uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors">
                  <MapPin className="w-4 h-4" /> {t("users.contact", { defaultValue: "LIÊN HỆ" })}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                  <EditableField
                    label={t("users.phone")}
                    name="phone"
                    value={editForm.phone}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    placeholder={t("users.phone_placeholder")}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--color-mkhe-primary)] uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors">
                  <MapPin className="w-4 h-4" /> 
                  {t("users.default_address", { defaultValue: "ĐỊA CHỈ MẶC ĐỊNH" })}
                  {user?.addresses && Math.max(0, user.addresses.length - (user.addresses.find(a => a.isDefault) ? 1 : 0)) > 0 && (
                    <span className="text-[var(--color-mkhe-text)]/50 font-medium normal-case text-xs lowercase ml-1">
                      {t("users.other_addresses", { count: Math.max(0, user.addresses.length - (user.addresses.find(a => a.isDefault) ? 1 : 0)), defaultValue: "(+{{count}} địa chỉ khác)" })}
                    </span>
                  )}
                </h4>
                <div className="mb-5">
                  <div className={`p-4 bg-[var(--color-mkhe-bg)] rounded-xl border border-[var(--color-mkhe-border)]/20 text-sm text-[var(--color-mkhe-text)]/80 leading-relaxed transition-colors ${isEditing ? 'opacity-70' : ''}`}>
                    {user?.addresses?.find(a => a.isDefault) ? (
                      user.addresses.find(a => a.isDefault).addressText
                    ) : (
                      <span className="italic opacity-50">{t("users.address_empty", { defaultValue: "Chưa cập nhật" })}</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--color-mkhe-primary)] uppercase tracking-widest mb-4 transition-colors">
                  {t("users.bio")}
                </h4>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 bg-[var(--color-mkhe-bg)] text-[var(--color-mkhe-text)] border border-[var(--color-mkhe-primary)]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-mkhe-primary)]/20 text-sm transition-colors"
                    placeholder={t("users.bio_placeholder")}
                  />
                ) : (
                  <div className="p-4 bg-[var(--color-mkhe-bg)] rounded-xl border border-[var(--color-mkhe-border)]/20 text-sm text-[var(--color-mkhe-text)]/70 italic leading-relaxed min-h-[80px] transition-colors">
                    {editForm.bio || t("users.bio_empty")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        {!viewOnly && (
          <div className="p-5 border-t border-[var(--color-mkhe-border)]/20 flex justify-between items-center bg-[var(--color-mkhe-border)]/20 shrink-0 transition-colors">
          <div className="flex gap-3">
            {!lockOnly && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-lg font-bold text-sm hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4 transition-colors" />{" "}
                {t("common.delete_account")}
              </button>
            )}
            {editForm.isBlocked ? (
              <button
                onClick={handleBlockButtonClick}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg font-bold text-sm hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Unlock className="w-4 h-4 transition-colors" />{" "}
                {t("common.unlock_account")}
              </button>
            ) : (
              <button
                onClick={handleBlockButtonClick}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-lg font-bold text-sm hover:bg-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4 transition-colors" />{" "}
                {t("common.lock_account")}
              </button>
            )}
          </div>
          {!lockOnly && (
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all disabled:opacity-50 text-sm cursor-pointer"
                  >
                    {t("common.cancel", { defaultValue: "Hủy" })}
                  </button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="!w-auto px-8 py-2.5 rounded-xl text-sm"
                  >
                    {isSaving ? t("common.saving") : t("common.save_info")}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="!w-auto px-8 py-2.5 rounded-xl text-sm"
                >
                  {t("common.edit")}
                </Button>
              )}
            </div>
          )}
        </div>
        )}

        {/* XÁC NHẬN XÓA TÀI KHOẢN */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onConfirm={executeDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          title={t("messages.confirm_delete_title")}
          message={t("messages.confirm_delete")}
          confirmText={t("common.delete_permanently")}
          cancelText={t("common.cancel")}
          icon="trash"
          isDanger={true}
        />

        {/* XÁC NHẬN KHÓA TÀI KHOẢN KÈM DROPDOWN LÝ DO */}
        <ConfirmModal
          isOpen={showBlockConfirm}
          onConfirm={() => executeBlockToggle(true, blockReason)}
          onCancel={() => setShowBlockConfirm(false)}
          title={t("messages.confirm_lock_title")}
          message={t("messages.confirm_lock_desc")}
          confirmText={t("common.confirm_lock")}
          cancelText={t("common.cancel")}
          icon="alert"
          loading={isSaving}
          children={
            <div className="mb-6 relative">
              <label className="text-[10px] uppercase font-bold text-[var(--color-mkhe-text)]/40 block mb-1.5 text-left transition-colors">
                {t("users.block_reason_label")}
              </label>

              {isReasonDropdownOpen && (
                <div
                  className="fixed inset-0 z-[120]"
                  onClick={() => setIsReasonDropdownOpen(false)}
                />
              )}

              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setIsReasonDropdownOpen(!isReasonDropdownOpen)}
                  className="w-full p-3 bg-[var(--color-mkhe-input)] text-[var(--color-mkhe-text)] border border-[var(--color-mkhe-border)]/50 cursor-pointer rounded-xl focus:outline-none focus:border-[var(--color-mkhe-primary)]/50 text-sm font-medium flex justify-between items-center shadow-sm relative z-[121] transition-all"
                >
                  <span className="truncate pr-4">
                    {t(`reasons.${blockReason}`)}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--color-mkhe-primary)] shrink-0 transition-transform duration-300 ${
                      isReasonDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isReasonDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--color-mkhe-input)] text-[var(--color-mkhe-text)] border border-[var(--color-mkhe-border)]/50 rounded-xl shadow-xl py-2 z-[122] max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200 transition-colors">
                    {[
                      "spam_comments",
                      "boom_orders",
                      "fake_info",
                      "policy_violation",
                      "fraud_activity",
                    ].map((reasonKey) => (
                      <button
                        key={reasonKey}
                        type="button"
                        onClick={() => {
                          setBlockReason(reasonKey);
                          setIsReasonDropdownOpen(false);
                        }}
                        className={`w-[calc(100%-16px)] mx-2 px-3 py-2.5 cursor-pointer rounded-lg text-sm text-left flex justify-between items-center transition-colors ${
                          blockReason === reasonKey
                            ? "bg-[var(--color-mkhe-primary)]/10 text-[var(--color-mkhe-primary)] font-bold"
                            : "text-[var(--color-mkhe-text)]/80 hover:bg-[var(--color-mkhe-border)]/30 hover:text-[var(--color-mkhe-text)]"
                        }`}
                      >
                        <span className="truncate pr-2">
                          {t(`reasons.${reasonKey}`)}
                        </span>
                        {blockReason === reasonKey && (
                          <Check className="w-4 h-4 shrink-0 text-[var(--color-mkhe-primary)] transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          }
        />
        {/* XÁC NHẬN MỞ KHÓA TÀI KHOẢN */}
        <ConfirmModal
          isOpen={showUnlockConfirm}
          onConfirm={() => {
            executeBlockToggle(false, "");
            setShowUnlockConfirm(false);
          }}
          onCancel={() => setShowUnlockConfirm(false)}
          title={t("messages.confirm_unlock_title")}
          message={t("messages.confirm_unlock_desc")}
          confirmText={t("common.confirm_unlock")}
          cancelText={t("common.cancel")}
          icon="shield"
          loading={isSaving}
        />
      </div>
    </div>
  );
};

export default UserDetailModal;
