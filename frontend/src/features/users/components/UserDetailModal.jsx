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

const UserDetailModal = ({ isOpen, onClose, user }) => {
  const { t } = useTranslation("admin");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const { countries, availableStates, dialCode } = useLocations(
    isOpen ? editForm.country : "",
  );

  // HÀM HELPER: Gọt sạch mã vùng khỏi số điện thoại
  const cleanPhoneNumber = (phone) => {
    let cleaned = phone || "";
    if (dialCode) {
      // Gọt bỏ tất cả dialCode ở đầu (chống lặp)
      while (cleaned.startsWith(dialCode)) {
        cleaned = cleaned.substring(dialCode.length).trim();
      }
      // Gọt bỏ số 0 đầu
      if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1).trim();
      }
    }
    return cleaned;
  };

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        phone: cleanPhoneNumber(user.phone),
        country: user.country || "",
        city: user.city || "",
        address: user.address || "",
        bio: user.bio || "",
      });
      setIsEditing(false);
    }
  }, [user, isOpen, dialCode]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" && !isValidPhoneInput(value)) return;

    setEditForm((prev) => {
      const newForm = { ...prev, [name]: value };
      if (name === "country") newForm.city = "";
      return newForm;
    });
  };

  const handleSave = async () => {
    let dataToSave = { ...editForm };
    let cleanPhone = dataToSave.phone || "";

    // Chuẩn hóa số điện thoại "Vô đối":
    if (cleanPhone && dialCode) {
      cleanPhone = cleanPhone.trim();

      // Chống copy/paste lặp mã vùng từ Admin
      while (cleanPhone.startsWith(dialCode)) {
        cleanPhone = cleanPhone.substring(dialCode.length).trim();
      }
      // Gọt số 0 đầu tiên
      if (cleanPhone.startsWith("0")) {
        cleanPhone = cleanPhone.substring(1).trim();
      }

      dataToSave.phone = `${dialCode}${cleanPhone}`;
    }
    try {
      // Dùng axiosClient đã cấu hình sẵn interceptor và token
      const response = await axiosClient.put(`/users/${user._id}`, dataToSave);

      // Nếu API trả về code thành công
      if (response.data.success) {
        console.log(t("messages.update_success_log"), response.data);

        // Ép giao diện cập nhật ngay lập tức
        setEditForm({ ...editForm, phone: cleanPhone });
        setIsEditing(false);

        // CỰC KỲ QUAN TRỌNG: Gọi hàm fetchUsers() từ props ở đây để load lại bảng!

        // SỬ DỤNG TOAST THAY CHO ALERT
        toast.success(t("messages.update_success"));
      }
    } catch (error) {
      console.error(t("messages.update_error_log"), error);

      const errorCode = error.response?.data?.message;
      const errorMsg = errorCode
        ? t(`messages.${errorCode}`)
        : t("messages.server_error");

      // SỬ DỤNG TOAST ERROR THAY CHO ALERT
      toast.error(errorMsg);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        phone: cleanPhoneNumber(user.phone),
        country: user.country || "",
        city: user.city || "",
        address: user.address || "",
        bio: user.bio || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-300"
    >
      <div className="bg-mkhe-bg w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-mkhe-border/30">
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-mkhe-border/20 shrink-0">
          <h2 className="text-xl font-bold text-gradient-gold flex items-center gap-2">
            <Info className="w-5 h-5 text-mkhe-primary" />
            {t("users.detail_title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            {/* CỘT TRÁI */}
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

            {/* CỘT PHẢI */}
            <div className="md:col-span-8 p-6 space-y-4">
              {/* THÔNG TIN CƠ BẢN */}
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

              {/* GIAO NHẬN */}
              <div>
                <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {t("users.shipping_contact")}
                </h4>

                {/* Hàng 1: Quốc gia & Tỉnh/Thành */}
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

                {/* Hàng 2: Số điện thoại (Chỉ chiếm 1/2 chiều rộng) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                  <EditableField
                    label={t("users.phone")}
                    name="phone"
                    value={editForm.phone}
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

                {/* Hàng 3: Địa chỉ chi tiết */}
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

              {/* BIO */}
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
                    {editForm.bio || t("users.bio_empty")}{" "}
                    {/* <--- ĐỔI user.bio THÀNH editForm.bio Ở ĐÂY NÈ CHA */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-mkhe-border/20 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-600 hover:text-white transition-all cursor-pointer">
              <Trash2 className="w-4 h-4" /> {t("common.delete_account")}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg font-bold text-sm hover:bg-orange-600 hover:text-white transition-all cursor-pointer">
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
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> {t("common.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" /> {t("common.save_info")}
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
      </div>
    </div>
  );
};

export default UserDetailModal;
