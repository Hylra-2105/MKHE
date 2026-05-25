import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { validateRegistration } from "@/utils/validators";
import toast from "react-hot-toast";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";
import FacebookIcon from "@/components/ui/icons/FacebookIcon";

// Đưa mảng dữ liệu ra ngoài để tối ưu hiệu năng
const SOCIAL_ACTIONS = [
  { id: "google", icon: <GoogleIcon />, labelKey: "google" },
  { id: "facebook", icon: <FacebookIcon />, labelKey: "facebook" },
];

export default function RegisterForm() {
  const { t } = useTranslation("register");
  const { registerAction, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Kiểm tra validation
    const validationErrors = validateRegistration(
      email,
      password,
      confirmPassword,
    );

    if (validationErrors) {
      return setErrors(validationErrors);
    }

    // Gọi API thông qua Store
    const result = await registerAction({ email, password });

    if (result.success) {
      toast.success(t("otp_sent"), { duration: 1500 });
      navigate("/verify-otp", { state: { email: email } });
    } else {
      // Bắt lỗi trùng email hiển thị đỏ dưới form thay vì toast (chuẩn hóa giống Login)
      const msg = result.message || "";
      if (msg === "EMAIL_ALREADY_EXISTS") {
        setErrors({ email: "err_email_exists" });
      } else {
        // Bọc msg vào t() để i18n tự dịch các mã lỗi khác (như SERVER_ERROR)
        toast.error(t(msg) || t("error_default"), { duration: 3000 });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[360px] mx-auto">
      <h1 className="text-3xl font-logo font-bold mb-2 text-gradient-gold">
        {t("title")}
      </h1>
      <p className="text-mkhe-text/60 mb-8 text-sm italic">{t("subtitle")}</p>

      <div className="space-y-4 mb-6">
        <div>
          <InputField
            type="email"
            placeholder={t("email_placeholder")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
          />
          <ErrorText error={errors.email} t={t} />
        </div>

        <div>
          <InputField
            type="password"
            placeholder={t("password_placeholder")}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: null }));
            }}
          />
          <ErrorText error={errors.password} t={t} />
        </div>

        <div>
          <InputField
            type="password"
            placeholder={t("confirm_password_placeholder")}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: null }));
            }}
          />
          <ErrorText error={errors.confirmPassword} t={t} />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("btn_processing") : t("btn_submit")}
      </Button>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-mkhe-border/50"></div>
        <span className="px-4 text-xs text-mkhe-text/50 uppercase tracking-wider">
          {t("or_continue_with") || "HOẶC TIẾP TỤC VỚI"}
        </span>
        <div className="flex-1 border-t border-mkhe-border/50"></div>
      </div>

      {/* Render Nút Social bằng vòng lặp .map() */}
      <div className="flex gap-4 mb-6">
        {SOCIAL_ACTIONS.map((btn) => (
          <button
            key={btn.id}
            type="button"
            className="flex-1 flex items-center justify-center cursor-pointer gap-2 py-2.5 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 transition-colors duration-300 active:scale-95"
          >
            {btn.icon}
            <span className="text-sm font-semibold text-mkhe-text">
              {t(btn.labelKey)}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center text-sm mt-4">
        <span className="text-mkhe-text/60">{t("have_account")} </span>
        <Link
          to="/login"
          className="text-mkhe-primary font-bold hover:underline ml-1"
        >
          {t("login_now")}
        </Link>
      </div>
    </form>
  );
}
