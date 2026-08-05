import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { getPasswordErrorKey } from "@/utils/validators";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

export default function ResetPasswordForm() {
  const { t } = useTranslation(["forgot_password", "common"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPasswordAction, isLoading } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    const passError = getPasswordErrorKey(password);
    if (passError) return setError({ password: passError });
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
        toast.error(
          t([result.message, `common:${result.message}`, "common:SERVER_ERROR"])
        );
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
            type={showPassword ? "text" : "password"}
            label={t("pass_placeholder")}
            placeholder={t("pass_placeholder")}
            value={password}
            onChange={(e) => {
              if (error.password) setError({ ...error, password: null });
              setPassword(e.target.value);
            }}
            required
            error={error.password ? t(`common:${error.password}`) : null}
            rightElement={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="!p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            }
          />
        </div>

        <div>
          <InputField
            type={showConfirmPassword ? "text" : "password"}
            label={t("confirm_placeholder")}
            placeholder={t("confirm_placeholder")}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error.confirmPassword)
                setError({ ...error, confirmPassword: null });
            }}
            required
            error={error.confirmPassword ? t(error.confirmPassword) : null}
            rightElement={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="!p-1"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            }
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading || isProcessing} className="w-full">
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
