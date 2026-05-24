// frontend/src/features/auth/components/RegisterForm.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { validateRegistration } from "@/utils/validators";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";
import FacebookIcon from "@/components/ui/icons/FacebookIcon";

// Component phụ hiển thị lỗi có icon chữ i
const ErrorText = ({ errorKey, t }) => {
  if (!errorKey) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs font-medium px-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
          clipRule="evenodd"
        />
      </svg>
      <span>{t(errorKey)}</span>
    </div>
  );
};

export default function RegisterForm() {
  const { t } = useTranslation("register");
  const { registerAction, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Tách riêng: 1 state cho lỗi form (inline), 1 state cho thông báo server (thành công/lỗi mạng)
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerMessage({ type: "", text: "" });

    // 1. Kiểm tra validation phía frontend
    const validationErrors = validateRegistration(
      email,
      password,
      confirmPassword,
    );

    // Nếu object validationErrors có dữ liệu, set state và dừng gọi API
    if (validationErrors) {
      return setErrors(validationErrors);
    }

    // 2. Nếu không có lỗi form, tiến hành gọi API
    const result = await registerAction({ email, password });

    if (result.success) {
      setServerMessage({ type: "success", text: result.message });
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } else {
      setServerMessage({ type: "error", text: result.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[360px] mx-auto">
      <h1 className="text-3xl font-logo font-bold mb-2 text-mkhe-primary">
        {t("title")}
      </h1>
      <p className="text-mkhe-text/60 mb-8 text-sm italic">{t("subtitle")}</p>

      {/* Thông báo chung từ Server (chỉ hiện khi Đăng ký thành công hoặc Backend báo lỗi) */}
      {serverMessage.text && (
        <div
          className={`p-3 mb-6 rounded border text-sm ${
            serverMessage.type === "success"
              ? "bg-green-500/10 border-green-500/50 text-green-600"
              : "bg-red-500/10 border-red-500/50 text-red-600"
          }`}
        >
          {serverMessage.text}
        </div>
      )}

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
          <ErrorText errorKey={errors.email} t={t} />
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
          <ErrorText errorKey={errors.password} t={t} />
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
          <ErrorText errorKey={errors.confirmPassword} t={t} />
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

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          className="flex-1 flex items-center justify-center cursor-pointer gap-2 py-2.5 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 transition-colors duration-300"
        >
          <GoogleIcon />
          <span className="text-sm font-semibold text-mkhe-text">Google</span>
        </button>

        <button
          type="button"
          className="flex-1 flex items-center justify-center cursor-pointer gap-2 py-2.5 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 transition-colors duration-300"
        >
          <FacebookIcon />
          <span className="text-sm font-semibold text-mkhe-text">Facebook</span>
        </button>
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
