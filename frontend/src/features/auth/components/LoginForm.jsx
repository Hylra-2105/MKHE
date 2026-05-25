import { auth, googleProvider, facebookProvider } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";
import FacebookIcon from "@/components/ui/icons/FacebookIcon";

const SOCIAL_ACTIONS = [
  {
    id: "google",
    icon: <GoogleIcon />,
    labelKey: "google",
    provider: googleProvider,
  },
  {
    id: "facebook",
    icon: <FacebookIcon />,
    labelKey: "facebook",
    provider: facebookProvider,
  },
];

export default function LoginForm() {
  const { t } = useTranslation("login");
  const navigate = useNavigate();

  const { loginAction, socialLoginAction, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSocialLogin = async (provider) => {
    try {
      // 1. Mở Popup xác thực
      const result = await signInWithPopup(auth, provider);

      if (!result || !result.user) {
        throw new Error("Không lấy được thông tin từ nhà cung cấp");
      }

      const user = result.user;

      // 2. Chuẩn bị dữ liệu (xử lý trường hợp Facebook không có email)
      const socialData = {
        email: user.email || `${user.uid}@facebook.com`,
        name: user.displayName || "User",
        avatar: user.photoURL || "",
        providerId: user.providerData[0]?.providerId || "unknown",
      };

      // 3. Gọi Backend
      const res = await socialLoginAction(socialData);

      // 4. Xử lý kết quả
      if (res && res.success) {
        toast.success(t("msg_login_success"));
        setTimeout(() => {
          navigate("/");
          // Đảm bảo cửa sổ được giải phóng
          if (window.opener) window.close();
        }, 1000);
      } else {
        toast.error(t(res?.message) || t("error_default"));
      }
    } catch (error) {
      console.error("Lỗi đăng nhập Social:", error);
      // Bỏ qua nếu user chủ động đóng popup
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      toast.error(t("error_social_login") || "Đăng nhập có lỗi xảy ra!");
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("saved_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};
    if (!email) newErrors.email = "err_empty_email";
    if (!password) newErrors.password = "err_empty_password";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await loginAction({ email, password }, rememberMe);
    if (result.success) {
      localStorage.setItem("saved_email", email);
      toast.success(t(result.message) || t("msg_login_success"));
      setTimeout(() => navigate("/"), 1000);
    } else {
      const msg = result.message || "";
      if (msg === "ACCOUNT_NOT_FOUND")
        setErrors({ email: "err_account_not_found" });
      else if (msg === "WRONG_PASSWORD")
        setErrors({ password: "err_wrong_password" });
      else if (msg === "ACCOUNT_NOT_VERIFIED") {
        setErrors({ email: "err_account_not_verified" });
        setTimeout(() => navigate("/verify-otp", { state: { email } }), 1500);
      } else {
        toast.error(t(msg) || t("error_default"));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[360px] mx-auto">
      <h1 className="text-3xl font-logo font-bold mb-2 text-gradient-gold">
        {t("title")}
      </h1>
      <p className="text-mkhe-text/60 mb-8 text-sm italic">{t("slogan")}</p>

      <div className="space-y-4 mb-6">
        <div>
          <InputField
            type="email"
            placeholder={t("email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <ErrorText error={errors.email} t={t} />
        </div>
        <div>
          <InputField
            type="password"
            placeholder={t("password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ErrorText error={errors.password} t={t} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <input
            id="rememberMe"
            type="checkbox"
            className="magic-cb-input"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe" className="magic-cb-label text-sm">
            <span></span> {t("remember_me")}
          </label>
        </div>
        <a href="#" className="text-sm text-mkhe-primary hover:underline">
          {t("forgot_password")}
        </a>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("btn_processing") : t("submit_btn")}
      </Button>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-mkhe-border/50"></div>
        <span className="px-4 text-xs text-mkhe-text/50 uppercase tracking-wider">
          {t("or_continue_with")}
        </span>
        <div className="flex-1 border-t border-mkhe-border/50"></div>
      </div>

      <div className="flex gap-4 mb-6">
        {SOCIAL_ACTIONS.map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => handleSocialLogin(btn.provider)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center cursor-pointer gap-2 py-2.5 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 transition-colors"
          >
            {btn.icon}
            <span className="text-sm font-semibold text-mkhe-text">
              {t(btn.labelKey)}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center text-sm mt-4">
        <span className="text-mkhe-text/60">{t("no_account")} </span>
        <Link
          to="/register"
          className="text-mkhe-primary font-bold hover:underline"
        >
          {t("register_now")}
        </Link>
      </div>
    </form>
  );
}
