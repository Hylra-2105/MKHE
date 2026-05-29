import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { validateRegistration } from "@/utils/validators";
import toast from "react-hot-toast";

import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";

export default function RegisterForm() {
  const { t, i18n } = useTranslation("register");
  const navigate = useNavigate();

  // LoginAction từ store để xử lý đăng ký bằng Google
  const { registerAction, socialLoginAction, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Đăng ký / Đăng nhập bằng Google
  const handleGoogleLogin = async () => {
    if (isSubmitting || isLoading) return;

    try {
      const result = await signInWithPopup(auth, googleProvider);

      if (!result || !result.user) {
        throw new Error("Không lấy được thông tin từ Google");
      }

      const user = result.user;

      const socialData = {
        email: user.email,
        name: user.displayName || "User",
        avatar: user.photoURL || "",
        providerId: "google",
      };

      // Gọi Backend
      const res = await socialLoginAction(socialData);

      if (res && res.success) {
        toast.success(t("msg_login_success") || "Thành công!");
        setTimeout(() => {
          navigate("/");
          if (window.opener) window.close();
        }, 1000);
      } else {
        toast.error(t(res?.message) || t("error_default"));
      }
    } catch (error) {
      console.error("Lỗi đăng ký Google:", error);
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      toast.error(t("error_social_login") || "Đăng nhập bằng Google thất bại!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || isLoading) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Kiểm tra validation
      const validationErrors = validateRegistration(
        name,
        email,
        password,
        confirmPassword,
      );

      if (validationErrors) {
        setErrors(validationErrors);
        return;
      }

      // Gọi API thông qua Store
      const result = await registerAction({
        name: name.trim(),
        email,
        password,
        language: i18n.language || "vi",
      });

      if (result.success) {
        toast.success(t("otp_sent"), { duration: 1500 });
        navigate("/verify-otp", {
          state: { email: email, isNewRegister: true },
        });
      } else {
        const msg = result.message || "";
        if (msg === "EMAIL_ALREADY_EXISTS") {
          setErrors({ email: "err_email_exists" });
        } else {
          toast.error(t(msg) || t("error_default"), { duration: 3000 });
        }
      }
    } finally {
      setIsSubmitting(false);
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
            type="text"
            placeholder={t("name_placeholder") || "Họ và tên"}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
          />
          <ErrorText error={errors.name} t={t} />
        </div>

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

      <Button type="submit" disabled={isLoading || isSubmitting}>
        {isLoading || isSubmitting ? t("btn_processing") : t("btn_submit")}
      </Button>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-mkhe-border/50"></div>
        <span className="px-3 text-xs text-mkhe-text/50 uppercase tracking-wider">
          {t("or_continue_with") || "HOẶC TIẾP TỤC VỚI"}
        </span>
        <div className="flex-1 border-t border-mkhe-border/50"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading || isSubmitting}
        className="w-full flex items-center justify-center cursor-pointer gap-2 py-2.5 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 transition-colors duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        <span className="text-sm font-semibold text-mkhe-text">
          {t("google") || "Google"}
        </span>
      </button>

      <div className="text-center text-sm mt-3">
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
