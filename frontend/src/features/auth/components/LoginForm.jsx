import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";

export default function LoginForm() {
  const { t } = useTranslation(["login", "common"]);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect");

  const { loginAction, socialLoginAction, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem("saved_email");
  });
  const [errors, setErrors] = useState({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Hàm Google Login
  const handleGoogleLogin = async () => {
    if (isLoading || isGoogleLoading) return;
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

      const res = await socialLoginAction(socialData);

      if (res && res.success) {
        toast.success(t("msg_login_success"), { duration: 3000 });
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          const userRole = useAuthStore.getState().user?.role;
          if (userRole === "Admin") {
            navigate("/admin/users");
          } else if (userRole === "Staff") {
            navigate("/admin/products");
          } else {
            navigate("/home");
          }
        }
      } else {
        const msg = res?.message || "";
        if (msg === "ACCOUNT_BLOCKED") {
          toast.error(t("err_account_blocked"), { duration: 4000 });
        } else {
          toast.error(
            t([msg, `common:${msg}`, "error_default"]),
            { duration: 3000 },
          );
        }
      }
    } catch (error) {
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return; // Người dùng tự đóng popup
      }
      toast.error(t("error_social_login"));
    } finally {
      setIsGoogleLoading(false);
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
      if (rememberMe) {
        localStorage.setItem("saved_email", email);
      } else {
        localStorage.removeItem("saved_email");
      }
      toast.success(t(result.message) || t("msg_login_success"), {
        duration: 3000,
      });
      
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        const userRole = useAuthStore.getState().user?.role;
        if (userRole === "Admin") {
          navigate("/admin/users");
        } else if (userRole === "Staff") {
          navigate("/admin/products");
        } else {
          navigate("/home");
        }
      }
    } else {
      const msg = result.message || "";
      if (msg === "ACCOUNT_NOT_FOUND")
        setErrors({ email: "err_account_not_found" });
      else if (msg === "WRONG_PASSWORD")
        setErrors({ password: "err_wrong_password" });
      else if (msg === "ACCOUNT_NOT_VERIFIED") {
        setErrors({ email: "err_account_not_verified" });
        setTimeout(() => navigate("/verify-otp", { state: { email } }), 1500);
      } else if (msg === "ACCOUNT_BLOCKED") {
        setErrors({ email: "err_account_blocked" });
      } else {
        toast.error(t([msg, `common:${msg}`, "error_default"]), {
          duration: 3000,
        });
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
            type={showPassword ? "text" : "password"}
            placeholder={t("password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
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
        <Link
          to="/forgot-password"
          className="text-sm text-mkhe-primary hover:underline"
        >
          {t("forgot_password")}
        </Link>
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

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
        className="w-full flex items-center justify-center cursor-pointer gap-2 py-2.5 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {(isLoading || isGoogleLoading) ? (
          <span className="w-5 h-5 border-2 border-mkhe-text border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <GoogleIcon />
        )}
        <span className="text-sm font-semibold text-mkhe-text">
          {(isLoading || isGoogleLoading) ? t("btn_processing") : t("google")}
        </span>
      </button>

      <div className="text-center text-sm mt-6">
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
