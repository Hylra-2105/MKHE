import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { User, MapPin, Edit2, Check, XCircle } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { userApi } from "@/api/userApi";
import useLocations from "@/hooks/useLocations";
import { isValidPhoneInput } from "@/utils/validators";
import EditableField from "@/features/users/components/Admin/EditableField";

const GeneralInfoTab = ({ user, isAdminView = false }) => {
  const { t } = useTranslation("admin");
  const { setUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [originalEditForm, setOriginalEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const { countries, availableStates, dialCode } = useLocations(
    editForm?.country || user?.country || "",
  );

  useEffect(() => {
    if (user) {
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
    }
  }, [user]);

  // XỬ LÝ SĐT
  let displayPhone = editForm.phone || "";
  if (dialCode) {
    while (displayPhone.startsWith(dialCode)) {
      displayPhone = displayPhone.substring(dialCode.length).trim();
    }
  }
  if (displayPhone.startsWith("0")) {
    displayPhone = displayPhone.substring(1).trim();
  }

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
      // Gọi userApi thay vì raw axios
      const response = await userApi.updateProfile(dataToSave);

      if (response.success) {
        // Cập nhật Zustand Store bằng dữ liệu Backend trả về
        setUser(response.data);
        setOriginalEditForm({ ...editForm, phone: response.data.phone });

        setIsEditing(false);
        toast.success(t("messages.update_success", { ns: "user" }));
      }
    } catch (error) {
      console.error("Lỗi update profile:", error);
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      toast.error(t(errorMsg, "Cập nhật thất bại!"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(originalEditForm);
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
        {/* THÔNG TIN CƠ BẢN */}
        <div>
          <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />{" "}
            {t("users.basic_info", "BASIC INFORMATION")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <EditableField
              label={t("users.fullname", "FULL NAME")}
              name="name"
              value={editForm.name}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
            <div>
              <label className="text-[10px] uppercase font-bold text-mkhe-text/40 block mb-1 flex items-center gap-1">
                {t("users.email_readonly", "EMAIL ADDRESS (READ-ONLY)")}
              </label>
              <p className="text-[var(--color-mkhe-text)] font-semibold border-b border-[var(--color-mkhe-border)]/10 pb-1 h-8 flex items-end opacity-70">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* ĐỊA CHỈ GIAO HÀNG */}
        <div>
          <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />{" "}
            {t("users.shipping_contact", "SHIPPING & CONTACT")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
            <EditableField
              label={t("users.country", "COUNTRY")}
              name="country"
              value={editForm.country}
              isEditing={isEditing}
              onChange={handleInputChange}
              placeholder={t("users.country_placeholder", "Select Country")}
              options={countries}
              t={t}
            />
            <EditableField
              label={t("users.city", "STATE/PROVINCE")}
              name="city"
              value={editForm.city}
              isEditing={isEditing}
              onChange={handleInputChange}
              placeholder={
                editForm.country
                  ? t("users.city_placeholder", "Select State/Province")
                  : t("users.city_disabled", "Please select a country first")
              }
              options={availableStates}
              disabled={
                isEditing && (!editForm.country || availableStates.length === 0)
              }
              t={t}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
            <EditableField
              label={t("users.phone", "PHONE NUMBER")}
              name="phone"
              value={displayPhone}
              isEditing={isEditing}
              onChange={handleInputChange}
              placeholder={
                editForm.country
                  ? t("users.phone_placeholder", "Phone Number")
                  : t("users.city_disabled", "Please select a country first")
              }
              prefix={dialCode}
              disabled={isEditing && !editForm.country}
            />
          </div>
          <EditableField
            label={t("users.address", "DETAILED ADDRESS")}
            name="address"
            value={editForm.address}
            isEditing={isEditing}
            onChange={handleInputChange}
            placeholder={t(
              "users.address_placeholder",
              "House number, street name...",
            )}
            isTextArea
            t={t}
          />
        </div>

        {/* BIO */}
        <div>
          <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-4">
            {t("users.bio", "BIOGRAPHY / NOTES")}
          </h4>
          {isEditing ? (
            <textarea
              name="bio"
              value={editForm.bio}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 bg-[var(--color-mkhe-bg)] text-[var(--color-mkhe-text)] border border-[var(--color-mkhe-primary)]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-mkhe-primary)]/20 text-sm transition-colors"
              // 🔥 FIX 1: Phân biệt Placeholder lúc đang Edit
              placeholder={
                isAdminView
                  ? t(
                      "users.bio_admin_placeholder",
                      "Thêm ghi chú về khách hàng này (Chỉ admin xem)...",
                    )
                  : t(
                      "users.bio_user_placeholder",
                      "Giới thiệu bản thân hoặc ghi chú cá nhân của bạn...",
                    )
              }
            />
          ) : (
            <div className="p-4 bg-[var(--color-mkhe-input)]/50 rounded-xl border border-[var(--color-mkhe-border)]/90 text-sm text-[var(--color-mkhe-text)]/70 italic leading-relaxed min-h-[80px] transition-colors">
              {/* 🔥 FIX 2: Phân biệt Text lúc chưa có dữ liệu (View mode) */}
              {editForm.bio ||
                (isAdminView
                  ? t(
                      "users.bio_empty_admin",
                      "Chưa có ghi chú nội bộ nào cho khách hàng này.",
                    )
                  : t(
                      "users.bio_empty_user",
                      "Bạn chưa cập nhật tiểu sử hoặc ghi chú cá nhân.",
                    ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex flex-col">
        <div className="mx-10 border-t border-[var(--color-mkhe-border)] opacity-90 transition-colors" />

        <div className="p-4 flex justify-end items-center bg-[var(--color-mkhe-input)]/30 shrink-0 rounded-br-2xl transition-colors">
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/60 transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> {t("common.cancel", "Cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-mkhe-primary)] text-white font-bold rounded-lg shadow-lg hover:shadow-[var(--color-mkhe-primary)]/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />{" "}
                  {isSaving
                    ? t("common.saving", "Saving...")
                    : t("common.save_info", "Save Information")}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-8 py-2.5 bg-[var(--color-mkhe-primary)] text-white font-bold rounded-lg shadow-lg hover:shadow-[var(--color-mkhe-primary)]/30 transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4" /> {t("common.edit", "Edit")}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneralInfoTab;
