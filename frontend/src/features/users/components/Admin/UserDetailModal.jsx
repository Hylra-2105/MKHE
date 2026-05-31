import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axiosClient";
import {
  X,
  User,
  MapPin,
  Info,
  Lock,
  Trash2,
  ShieldCheck,
  Edit2,
  Check,
  XCircle,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  getLastNameInitial,
  isValidPhoneInput,
  isVideoUrl,
} from "@/utils/validators";
import useLocations from "@/hooks/useLocations";
import EditableField from "@/features/users/components/Admin/EditableField";

const UserDetailModal = ({ isOpen, onClose, user, onRefresh }) => {
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

  const { countries, availableStates, dialCode } = useLocations(
    isOpen ? editForm?.country || user?.country || "" : "",
  );

  useEffect(() => {
    if (user && isOpen) {
      const initialForm = {
        name: user.name || "",
        phone: user.phone || "",
        country: user.country || "",
        city: user.city || "",
        address: user.address || "",
        bio: user.bio || "",
        isBlocked: user.isBlocked ?? false,
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

  // XỬ LÝ SĐT: Tính toán số SẠCH ngay trước khi render
  let displayPhone = editForm.phone || "";
  if (dialCode) {
    while (displayPhone.startsWith(dialCode)) {
      displayPhone = displayPhone.substring(dialCode.length).trim();
    }
  }
  if (displayPhone.startsWith("0")) {
    displayPhone = displayPhone.substring(1).trim();
  }
  // ==========================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "phone") {
      if (dialCode) {
        while (finalValue.startsWith(dialCode)) {
          finalValue = finalValue.substring(dialCode.length).trim();
        }
      }
      if (finalValue.startsWith("0")) {
        finalValue = finalValue.substring(1).trim();
      }
      if (!isValidPhoneInput(finalValue)) return;
    }

    setEditForm((prev) => {
      const newForm = { ...prev, [name]: finalValue };
      if (name === "country") newForm.city = "";
      return newForm;
    });
  };

  const handleSave = async () => {
    let dataToSave = { ...editForm };

    if (displayPhone && dialCode) {
      dataToSave.phone = `${dialCode}${displayPhone}`;
    } else {
      dataToSave.phone = displayPhone;
    }

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
        errorCode ? t(`messages.${errorCode}`) : t("messages.server_error"),
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
        errorCode ? t(`messages.${errorCode}`) : t("messages.server_error"),
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
        errorCode ? t(`messages.${errorCode}`) : t("messages.server_error"),
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
            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all cursor-pointer"
          >
            <X className="w-6 h-6 text-[var(--color-mkhe-text)]" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            {/* CỘT TRÁI */}
            <div className="md:col-span-4 bg-[var(--color-mkhe-primary)]/5 p-8 border-r border-[var(--color-mkhe-border)]/20 flex flex-col items-center text-center sticky top-0 h-max transition-colors">
              {user.avatar && isVideoUrl(user.avatar) ? (
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
                    className={`h-10 flex items-center justify-center gap-2 px-4 rounded-lg border transition-colors ${user.role === "Admin" ? "bg-red-500/10 border-red-500/20 text-red-600" : "bg-blue-500/10 border-blue-500/20 text-blue-600"}`}
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
                        : "bg-green-500/10 border-green-500/20 text-green-600"
                    }`}
                  >
                    <span className="text-sm font-bold uppercase transition-colors">
                      {editForm.isBlocked
                        ? t("common.blocked")
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
                  <MapPin className="w-4 h-4" /> {t("users.shipping_contact")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <EditableField
                    label={t("users.country")}
                    name="country"
                    value={editForm.country}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    placeholder={t("users.country_placeholder")}
                    options={countries}
                    t={t}
                  />
                  <EditableField
                    label={t("users.city")}
                    name="city"
                    value={editForm.city}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    placeholder={
                      editForm.country
                        ? t("users.city_placeholder")
                        : t("users.city_disabled")
                    }
                    options={availableStates}
                    disabled={
                      isEditing &&
                      (!editForm.country || availableStates.length === 0)
                    }
                    t={t}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                  <EditableField
                    label={t("users.phone")}
                    name="phone"
                    value={displayPhone}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    placeholder={
                      editForm.country
                        ? t("users.phone_placeholder")
                        : t("users.city_disabled")
                    }
                    prefix={dialCode}
                    disabled={isEditing && !editForm.country}
                  />
                </div>
                <EditableField
                  label={t("users.address")}
                  name="address"
                  value={editForm.address}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  placeholder={t("users.address_placeholder")}
                  isTextArea
                  t={t}
                />
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
        <div className="p-5 border-t border-[var(--color-mkhe-border)]/20 flex justify-between items-center bg-[var(--color-mkhe-border)]/20 shrink-0 transition-colors">
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg font-bold text-sm hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 transition-colors" />{" "}
              {t("common.delete_account")}
            </button>
            <button
              onClick={handleBlockButtonClick}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 border border-orange-200 text-orange-500 rounded-lg font-bold text-sm hover:bg-orange-100 hover:border-orange-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4 transition-colors" />{" "}
              {editForm.isBlocked
                ? t("common.unlock_account")
                : t("common.lock_account")}
            </button>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 transition-colors" />{" "}
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 transition-colors" />{" "}
                  {isSaving ? t("common.saving") : t("common.save_info")}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-8 py-2.5 bg-[var(--color-mkhe-primary)] text-white font-bold rounded-lg shadow-lg hover:shadow-[var(--color-mkhe-primary)]/20 transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4 transition-colors" />{" "}
                {t("common.edit")}
              </button>
            )}
          </div>
        </div>

        {/* XÁC NHẬN XÓA TÀI KHOẢN*/}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40  animate-in fade-in duration-200"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="bg-[var(--color-mkhe-bg)] w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-red-500/20 text-center relative transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5 transition-colors" />
              </button>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 mt-2 transition-colors">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-mkhe-text)] mb-2 transition-colors">
                {t("messages.confirm_delete_title")}
              </h3>
              <p className="text-sm text-[var(--color-mkhe-text)]/70 mb-6 leading-relaxed transition-colors">
                {t("messages.confirm_delete")}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-xl hover:bg-[var(--color-mkhe-border)]/50 transition-all cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={executeDelete}
                  className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all cursor-pointer"
                >
                  {t("common.delete_permanently")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* XÁC NHẬN KHÓA TÀI KHOẢN KÈM DROPDOWN LÝ DO  */}
        {showBlockConfirm && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40  animate-in fade-in duration-200"
            onClick={() => setShowBlockConfirm(false)}
          >
            <div
              className="relative bg-[var(--color-mkhe-bg)] w-full max-w-md p-6 rounded-2xl shadow-2xl border border-orange-500/20 transform scale-100 animate-in zoom-in-95 duration-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nút X đóng góc phải */}
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5 transition-colors" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100 mt-2 transition-colors">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-mkhe-text)] mb-2 transition-colors">
                  {t("messages.confirm_lock_title")}
                </h3>
                <p className="text-sm text-[var(--color-mkhe-text)]/70 mb-4 leading-relaxed transition-colors">
                  {t("messages.confirm_lock_desc")}
                </p>
              </div>

              {/* INPUT DROPDOWN CUSTOM XỊN XÒ */}
              <div className="mb-6 relative">
                <label className="text-[10px] uppercase font-bold text-[var(--color-mkhe-text)]/40 block mb-1.5 text-left transition-colors">
                  {t("users.block_reason_label")}
                </label>

                {/* Lớp kính vô hình giúp click ra ngoài để đóng */}
                {isReasonDropdownOpen && (
                  <div
                    className="fixed inset-0 z-[120]"
                    onClick={() => setIsReasonDropdownOpen(false)}
                  />
                )}

                <div className="relative w-full">
                  {/* Nút bấm hiển thị */}
                  <button
                    type="button"
                    onClick={() =>
                      setIsReasonDropdownOpen(!isReasonDropdownOpen)
                    }
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

                  {/* Menu xổ xuống */}
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

              {/* HÀNG BUTTONS */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="px-5 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-xl hover:bg-[var(--color-mkhe-border)]/50 transition-all cursor-pointer text-sm"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => executeBlockToggle(true, blockReason)}
                  className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all cursor-pointer text-sm"
                >
                  {t("common.confirm_lock")}
                </button>
              </div>
            </div>
          </div>
        )}
        {showUnlockConfirm && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40  animate-in fade-in duration-200"
            onClick={() => setShowUnlockConfirm(false)}
          >
            <div
              className="relative bg-[var(--color-mkhe-bg)] w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-green-500/20 text-center transform scale-100 animate-in zoom-in-95 duration-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowUnlockConfirm(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5 transition-colors" />
              </button>

              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 mt-2 transition-colors">
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>

              <h3 className="text-xl font-bold text-[var(--color-mkhe-text)] mb-2 transition-colors">
                {t("messages.confirm_unlock_title")}
              </h3>

              <p className="text-sm text-[var(--color-mkhe-text)]/70 mb-6 leading-relaxed transition-colors">
                {t("messages.confirm_unlock_desc")}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowUnlockConfirm(false)}
                  className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-xl hover:bg-[var(--color-mkhe-border)]/50 transition-all cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => {
                    executeBlockToggle(false, "");
                    setShowUnlockConfirm(false);
                  }}
                  className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all cursor-pointer"
                >
                  {t("common.confirm_unlock")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailModal;
