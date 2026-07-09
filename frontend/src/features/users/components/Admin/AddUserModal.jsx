import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { X, UserPlus, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import Dropdown from "@/components/ui/Dropdown";
import { userApi } from "@/api/userApi";
import { getPasswordErrorKey } from "@/utils/validators";

const AddUserModal = ({ isOpen, onClose, onRefresh, initialData }) => {
  const { t } = useTranslation("admin");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer",
    companyName: "",
    taxCode: "",
  });
  const [formErrors, setFormErrors] = useState({});

  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        role: initialData.role || "Customer",
        companyName: initialData.companyName || initialData.company || "",
        taxCode: initialData.taxCode || "",
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Customer",
        companyName: "",
        taxCode: "",
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.name) errors.name = t("users.errors.name_required", "Vui lòng điền họ và tên");
    if (!formData.email) errors.email = t("users.errors.email_required", "Vui lòng điền email");
    
    if (formData.role !== "Enterprise") {
      if (!formData.password) errors.password = t("users.errors.pass_required", "Vui lòng điền mật khẩu");
      else {
        const passError = getPasswordErrorKey(formData.password);
        if (passError) errors.password = t(`common:${passError}`);
      }
    } else {
      if (!formData.companyName) errors.companyName = t("users.errors.company_required", "Vui lòng điền tên công ty");
      if (!formData.taxCode) {
        errors.taxCode = t("users.errors.tax_required", "Vui lòng điền mã số thuế");
      } else if (!/^\d{10}(-\d{3})?$/.test(formData.taxCode)) {
        errors.taxCode = t("users.errors.tax_invalid", "Mã số thuế không hợp lệ (10 hoặc 13 số)");
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      let response;
      if (formData.role === "Enterprise") {
        response = await userApi.createB2BAccount(formData);
      } else {
        response = await userApi.createUser(formData);
      }
      if (response.success) {
        toast.success(
          t("messages.create_success", "Tạo tài khoản thành công!"),
        );
        if (onRefresh) onRefresh();
        setFormData({ name: "", email: "", password: "", role: "Customer", companyName: "", taxCode: "" });
        onClose();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      if (errorMsg === "EMAIL_ALREADY_EXISTS") {
        setFormErrors({ email: t("messages.EMAIL_ALREADY_EXISTS", "Email này đã được đăng ký trên hệ thống!") });
      } else {
        toast.error(
          t(`messages.${errorMsg}`, "Có lỗi xảy ra, vui lòng thử lại!"),
        );
      }
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
            <div>
              <InputField
                type="text"
                name="name"
                label={t("users.fullname", "Họ và tên")}
                value={formData.name}
                onChange={handleChange}
                placeholder={t(
                  "users.fullname_placeholder",
                  "VD: Nguyễn Văn A",
                )}
                required
                error={formErrors.name ? formErrors.name : null}
              />
            </div>

            <div>
              <InputField
                type="email"
                name="email"
                label={t("users.email", "Địa chỉ Email")}
                value={formData.email}
                onChange={handleChange}
                placeholder={t("users.email_placeholder", "example@gmail.com")}
                required
                error={formErrors.email ? formErrors.email : null}
              />
            </div>

            {/* Mật khẩu (Ẩn nếu là Enterprise) */}
            {formData.role !== "Enterprise" && (
              <div>
                <InputField
                  type={showPass ? "text" : "password"}
                  name="password"
                  label={t("users.password", "Mật khẩu")}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("users.password_placeholder", "••••••••")}
                  required
                  error={formErrors.password ? formErrors.password : null}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="cursor-pointer flex items-center justify-center p-1"
                    >
                      {showPass ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                />
              </div>
            )}
            
            {/* Các trường cho Enterprise */}
            {formData.role === "Enterprise" && (
              <>
                <div>
                  <InputField
                    type="text"
                    name="companyName"
                    label={t("users.companyName", "Tên Doanh Nghiệp")}
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder={t("users.company_placeholder", "Nhập tên doanh nghiệp")}
                    required
                    error={formErrors.companyName ? formErrors.companyName : null}
                  />
                </div>
                
                <div>
                  <InputField
                    type="text"
                    name="taxCode"
                    label={t("users.taxCode", "Mã Số Thuế")}
                    value={formData.taxCode}
                    onChange={handleChange}
                    placeholder={t("users.taxCode_placeholder", "Nhập mã số thuế")}
                    required
                    error={formErrors.taxCode ? formErrors.taxCode : null}
                  />
                </div>
              </>
            )}

            {/* VAI TRÒ (DROPDOWN) */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("users.role", "Vai trò (Phân quyền)")}{" "}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.role}
                onChange={(val) => setFormData((prev) => ({ ...prev, role: val }))}
                options={[
                  { value: "Customer", label: t("roles.customer", "Khách hàng") },
                  { value: "Staff", label: t("roles.staff", "Staff") },
                  { value: "Enterprise", label: t("roles.enterprise", "Enterprise") },
                ]}
                triggerClassName="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm hover:bg-transparent !p-3.5"
                optionClassName="text-sm"
              />
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
