import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";

export default function ResetPasswordForm() {
  const { t } = useTranslation("forgot_password");
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPasswordAction, isLoading } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({});

  const [isProcessing, setIsProcessing] = useState(false);

  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  useEffect(() => {
    if (!email || !resetToken) {
      toast.error(t("err_invalid_session"));
      navigate("/forgot-password", { replace: true });
    }
  }, [email, resetToken, navigate, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    if (!password) return setError({ password: "err_empty_pass" });
    if (password.length < 6) return setError({ password: "err_short_pass" });
    if (password !== confirmPassword)
      return setError({ confirmPassword: "err_not_match" });

    const result = await resetPasswordAction(email, resetToken, password);

    if (result.success) {
      setIsProcessing(true); 

      setTimeout(() => {
        toast.success(t("PASSWORD_RESET_SUCCESS"), { duration: 1500 });

        setTimeout(() => navigate("/login"), 500);
      }, 1500);
    } else {
      if (result.message === "INVALID_OR_EXPIRED_SESSION") {
        toast.error(t("err_invalid_session"));
        navigate("/forgot-password");
      } else {
        toast.error(t(result.message) || t("SERVER_ERROR"));
      }
    }
  };

  if (!email || !resetToken) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[360px] mx-auto text-center"
    >
      <h1 className="text-3xl font-logo font-bold mb-2 text-gradient-gold">
        {t("title_reset")}
      </h1>
      <p className="text-mkhe-text/60 mb-8 text-sm italic">
        {t("reset_desc")} {email}
      </p>

      <div className="space-y-4 mb-6 text-left">
        <div>
          <InputField
            type="password"
            placeholder={t("pass_placeholder")}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error.password) setError({ ...error, password: null });
            }}
          />
          <ErrorText error={error.password} t={t} />
        </div>

        <div>
          <InputField
            type="password"
            placeholder={t("confirm_placeholder")}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error.confirmPassword)
                setError({ ...error, confirmPassword: null });
            }}
          />
          <ErrorText error={error.confirmPassword} t={t} />
        </div>
      </div>

      <Button type="submit" disabled={isLoading || isProcessing}>
        {isLoading || isProcessing ? t("btn_updating") : t("btn_reset")}
      </Button>

      <div className="mt-8">
        <Link
          to="/login"
          className="text-sm text-mkhe-text/60 hover:text-mkhe-primary transition-colors hover:underline"
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
