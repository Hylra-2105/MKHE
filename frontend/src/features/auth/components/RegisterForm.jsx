import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { validateRegistration } from "@/utils/validators";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";

export default function RegisterForm() {
  const { t, i18n } = useTranslation(["register", "common", "login"]);
  const navigate = useNavigate();

  // Auth actions từ store
  const { registerAction, socialLoginAction, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Xử lý đăng nhập Google
  const handleGoogleLogin = async () => {
    if (isSubmitting || isLoading || isGoogleLoading) return;
    setIsGoogleLoading(true);

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

      // Gọi backend API
      const res = await socialLoginAction(socialData);

      if (res && res.success) {
        toast.success(t("msg_login_success", { ns: "login" }));
        navigate("/");
        if (window.opener) window.close();
      } else {
        toast.error(
          t([res?.message, `common:${res?.message}`, "error_default"]),
          { duration: 3000 },
        );
      }
    } catch (error) {
      console.error("Lỗi đăng ký Google:", error);
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      toast.error(t("error_social_login"));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ngăn chặn submit nhiều lần
    if (isSubmitting || isLoading) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Kiểm tra form hợp lệ
      const validationErrors = validateRegistration(
        name,
        email,
        password,
        confirmPassword,
        username,
        phone
      );

      if (validationErrors) {
        setErrors(validationErrors);
        return;
      }

      // Gửi request đăng ký
      const result = await registerAction({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim(),
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
        } else if (msg === "PHONE_ALREADY_EXISTS") {
          setErrors({ phone: "Số điện thoại đã được đăng ký" });
        } else if (msg === "USERNAME_ALREADY_EXISTS") {
          setErrors({ username: "err_username_exists" });
          setSuggestions(result.suggestions || []);
        } else {
          toast.error(
            t([msg, `common:${msg}`, "error_default"]),
            { duration: 3000 },
          );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <h1 className="text-3xl font-logo font-bold mb-2 text-gradient-gold">
        {t("title")}
      </h1>
      <p className="text-mkhe-text/60 mb-8 text-sm italic">{t("subtitle")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <InputField
            type="text"
            label={t("name_placeholder")}
            placeholder={t("name_placeholder")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
            required
            error={errors.name ? t(errors.name) : null}
          />
        </div>

        <div>
          <InputField
            type="text"
            label={t("username")}
            placeholder={t("ph_username")}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors((prev) => ({ ...prev, username: null }));
              setSuggestions([]);
            }}
            required
            error={errors.username ? (t(errors.username) !== errors.username ? t(errors.username) : t("err_invalid_username")) : null}
          />
          {suggestions.length > 0 && (
            <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <p className="text-xs text-rose-500 mb-2 font-medium">{t("username_exists_suggestions")}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <span 
                    key={s} 
                    onClick={() => {
                      setUsername(s);
                      setSuggestions([]);
                      setErrors((prev) => ({ ...prev, username: null }));
                    }}
                    className="text-xs bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/30 px-3 py-1.5 rounded-full cursor-pointer hover:bg-mkhe-primary hover:text-white transition-colors"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <InputField
            type="email"
            label={t("email_placeholder")}
            placeholder={t("email_placeholder")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            required
            error={errors.email ? t(errors.email) : null}
          />
        </div>

        <div>
          <InputField
            type="text"
            label={t("phone")}
            placeholder={t("ph_phone")}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
            }}
            required
            error={errors.phone ? (t(errors.phone) !== errors.phone ? t(errors.phone) : "Số điện thoại không hợp lệ") : null}
          />
        </div>

        <div>
          <InputField
            type={showPassword ? "text" : "password"}
            label={t("password_placeholder")}
            placeholder={t("password_placeholder")}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: null }));
            }}
            required
            error={errors.password ? t(errors.password) : null}
            rightElement={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="!p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            }
          />
        </div>

        <div>
          <InputField
            type={showConfirmPassword ? "text" : "password"}
            label={t("confirm_password_placeholder")}
            placeholder={t("confirm_password_placeholder")}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: null }));
            }}
            required
            error={errors.confirmPassword ? t(errors.confirmPassword) : null}
            rightElement={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="!p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            }
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading || isSubmitting} className="w-full">
        {isLoading || isSubmitting ? t("btn_processing") : t("btn_submit")}
      </Button>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-mkhe-border/50"></div>
        <span className="px-3 text-xs text-mkhe-text/50 uppercase tracking-wider">
          {t("or_continue_with")}
        </span>
        <div className="flex-1 border-t border-mkhe-border/50"></div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={isLoading || isSubmitting || isGoogleLoading}
        isLoading={isGoogleLoading}
      >
        {!isGoogleLoading && <GoogleIcon />}
        <span className="text-sm font-semibold text-mkhe-text">
          {isGoogleLoading ? t("btn_processing") : t("google", { ns: "login" })}
        </span>
      </Button>

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
