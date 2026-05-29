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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { getLastNameInitial, isValidPhoneInput } from "@/utils/validators";
import useLocations from "@/hooks/useLocations";
import EditableField from "./EditableField";

const UserDetailModal = ({ isOpen, onClose, user, onRefresh }) => {
  const { t } = useTranslation("admin");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [originalEditForm, setOriginalEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { countries, availableStates, dialCode } = useLocations(
    isOpen ? editForm?.country || user?.country || "" : "",
  );

  useEffect(() => {
    // CHỈ LOAD DỮ LIỆU THÔ VÀO FORM, KHÔNG CẮT GỌT GÌ Ở ĐÂY CẢ
    if (user && isOpen) {
      const initialForm = {
        name: user.name || "",
        phone: user.phone || "",
        country: user.country || "",
        city: user.city || "",
        address: user.address || "",
        bio: user.bio || "",
      };
      setEditForm(initialForm);
      setOriginalEditForm(initialForm);
      setIsEditing(false);
    } else if (!isOpen) {
      setEditForm({});
    }
  }, [user, isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !user) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ==========================================
  // PHÉP MÀU NẰM Ở ĐÂY: Tính toán số SẠCH ngay trước khi vẽ ra giao diện
  let displayPhone = editForm.phone || "";
  if (dialCode) {
    // Dùng đúng mã vùng hiện tại để gọt -> Tuyệt đối an toàn, không ăn phạm số
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
      // Chặn Admin copy/paste kèm mã vùng hoặc số 0
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

    // Ghi đè bằng biến displayPhone đã được gọt siêu sạch ở trên
    if (displayPhone && dialCode) {
      dataToSave.phone = `${dialCode}${displayPhone}`;
    } else {
      dataToSave.phone = displayPhone;
    }

    setIsSaving(true);
    try {
      const response = await axiosClient.put(`/users/${user._id}`, dataToSave);

      if (response.data.success) {
        console.log(t("messages.update_success_log"), response.data);

        // Lưu ngược cái chuỗi đầy đủ (+84...) vào form gốc để load lại
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
      // Dù thành công hay thất bại cũng đóng cái popup hỏi lại
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-300"
    >
      <div className="relative bg-mkhe-bg w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-mkhe-border/30">
        <div className="flex justify-between items-center p-5 border-b border-mkhe-border/20 shrink-0">
          <h2 className="text-xl font-bold text-gradient-gold flex items-center gap-2">
            <Info className="w-5 h-5 text-mkhe-primary" />
            {t("users.detail_title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            <div className="md:col-span-4 bg-mkhe-primary/5 p-8 border-r border-mkhe-border/20 flex flex-col items-center text-center sticky top-0 h-max">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${getLastNameInitial(user.name)}&background=random`
                }
                alt="avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl mb-4"
              />
              <p className="text-xs font-mono text-mkhe-text/40 mb-6 break-all bg-white px-2 py-1 rounded border border-mkhe-border/20">
                ID: {user._id}
              </p>
              <div className="w-full space-y-4 text-left">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mkhe-text/40 block mb-1 text-center">
                    {t("common.role")}
                  </label>
                  <div
                    className={`h-10 flex items-center justify-center gap-2 px-4 rounded-lg border ${user.role === "Admin" ? "bg-red-500/10 border-red-500/20 text-red-600" : "bg-blue-500/10 border-blue-500/20 text-blue-600"}`}
                  >
                    <span className="text-sm font-bold">
                      {t(`roles.${user.role?.toLowerCase()}`)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mkhe-text/40 block mb-1 text-center">
                    {t("common.status")}
                  </label>
                  <div
                    className={`h-10 flex items-center justify-center px-4 rounded-lg border ${user.isBlocked ? "bg-gray-500/10 border-gray-500/20 text-gray-600" : "bg-green-500/10 border-green-500/20 text-green-600"}`}
                  >
                    <span className="text-sm font-bold uppercase">
                      {user.isBlocked
                        ? t("common.blocked")
                        : t("common.active")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-2 flex items-center gap-2">
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
                    <label className="text-[10px] uppercase font-bold text-mkhe-text/40 block mb-1 flex items-center gap-1">
                      {t("users.email_readonly")}
                    </label>
                    <p className="text-mkhe-text font-semibold border-b border-mkhe-border/10 pb-1 h-8 flex items-end opacity-70">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-4 flex items-center gap-2">
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
                    value={displayPhone} // ĐƯA BIẾN SẠCH VÀO HIỂN THỊ THAY VÌ EDITFORM.PHONE
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
                <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-4">
                  {t("users.bio")}
                </h4>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 bg-white border border-mkhe-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-mkhe-primary/20 text-sm"
                    placeholder={t("users.bio_placeholder")}
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl border border-mkhe-border/20 text-sm text-mkhe-text/70 italic leading-relaxed min-h-[80px]">
                    {editForm.bio || t("users.bio_empty")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-mkhe-border/20 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg font-bold text-sm hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> {t("common.delete_account")}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-orange-200 text-orange-500 rounded-lg font-bold text-sm hover:bg-orange-100 hover:border-orange-300 transition-all cursor-pointer">
              <Lock className="w-4 h-4" />{" "}
              {user.isBlocked
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
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> {t("common.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />{" "}
                  {isSaving ? t("common.saving") : t("common.save_info")}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-8 py-2.5 bg-mkhe-primary text-white font-bold rounded-lg shadow-lg hover:shadow-mkhe-primary/20 transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4" /> {t("common.edit")}
              </button>
            )}
          </div>
        </div>
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/20 rounded-2xl animate-in fade-in duration-200">
            <div className="relative bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-red-500/20 text-center transform scale-100 animate-in zoom-in-95 duration-200">
              {/* Nút X góc phải */}
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 mt-2">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>

              <h3 className="text-xl font-bold text-mkhe-text mb-2">
                {t("messages.confirm_delete_title")}
              </h3>

              <p className="text-sm text-mkhe-text/70 mb-6 leading-relaxed">
                {t("messages.confirm_delete")}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
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
      </div>
    </div>
  );
};

export default UserDetailModal;
