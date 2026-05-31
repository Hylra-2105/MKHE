import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { X, UserPlus, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { userApi } from "@/api/userApi";

const AddUserModal = ({ isOpen, onClose, onRefresh }) => {
  const { t } = useTranslation("admin");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      return toast.error(
        t("messages.pass_short", "Mật khẩu phải có ít nhất 6 ký tự"),
      );
    }

    setLoading(true);
    try {
      const response = await userApi.createUser(formData);
      if (response.success) {
        toast.success(
          t("messages.create_success", "Tạo tài khoản thành công!"),
        );
        if (onRefresh) onRefresh();
        setFormData({ name: "", email: "", password: "", role: "Customer" });
        onClose();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      toast.error(
        t(`messages.${errorMsg}`, "Có lỗi xảy ra, vui lòng thử lại!"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      // 🔥 ĐÃ FIX: Gỡ bỏ onClick ở lớp nền đen. Bây giờ click ra ngoài không bị đóng nữa.
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
    >
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-md rounded-2xl shadow-2xl overflow-visible border border-[var(--color-mkhe-border)]/30 animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between mx-6 pt-6 pb-5 border-b border-[var(--color-mkhe-border)]/50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 mb-1 text-mkhe-primary" />
            <h2 className="text-lg font-bold text-gradient-gold">
              {t("users.add_new", "Thêm thành viên mới")}
            </h2>
          </div>
          <button
            onClick={onClose} // Chỉ đóng khi bấm nút X
            className="p-2 hover:bg-mkhe-primary/10 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-mkhe-text/70" />
          </button>
        </div>

        {/* BODY FORM */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tên */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("users.fullname", "Họ và tên")}{" "}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                placeholder={t(
                  "users.fullname_placeholder",
                  "VD: Nguyễn Văn A",
                )}
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("users.email", "Địa chỉ Email")}{" "}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                placeholder={t("users.email_placeholder", "example@gmail.com")}
              />
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("users.password", "Mật khẩu")}{" "}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm pr-12"
                  // 🔥 ĐÃ FIX: Bọc i18n cho các dấu chấm mật khẩu (Tùy chọn, nhưng chuẩn thì cứ bọc)
                  placeholder={t("users.password_placeholder", "••••••••")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-mkhe-text/50 hover:text-mkhe-primary cursor-pointer transition-colors flex items-center justify-center"
                >
                  {showPass ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* VAI TRÒ (RADIO BUTTONS) */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("users.role", "Vai trò (Phân quyền)")}{" "}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {/* Lựa chọn Customer */}
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    formData.role === "Customer"
                      ? "border-mkhe-primary bg-mkhe-primary/10 text-mkhe-primary"
                      : "border-mkhe-border/50 text-mkhe-text hover:border-mkhe-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="Customer"
                    checked={formData.role === "Customer"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.role === "Customer"
                        ? "border-mkhe-primary"
                        : "border-mkhe-text/30"
                    }`}
                  >
                    {formData.role === "Customer" && (
                      <div className="w-2 h-2 rounded-full bg-mkhe-primary" />
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    {t("roles.customer", "Khách hàng")}
                  </span>
                </label>

                {/* Lựa chọn Staff */}
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    formData.role === "Staff"
                      ? "border-mkhe-primary bg-mkhe-primary/10 text-mkhe-primary"
                      : "border-mkhe-border/50 text-mkhe-text hover:border-mkhe-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="Staff"
                    checked={formData.role === "Staff"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.role === "Staff"
                        ? "border-mkhe-primary"
                        : "border-mkhe-text/30"
                    }`}
                  >
                    {formData.role === "Staff" && (
                      <div className="w-2 h-2 rounded-full bg-mkhe-primary" />
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    {t("roles.staff", "Nhân viên (Staff)")}
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5"
            >
              {loading
                ? t("common.saving", "Đang lưu...")
                : t("common.create", "Tạo tài khoản")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
