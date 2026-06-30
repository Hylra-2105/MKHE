import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";
import { authApi } from "@/api/authApi";

export default function B2BActivationForm() {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState({});

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error(t("messages.err_invalid_session", "Token không hợp lệ."));
      navigate("/login", { replace: true });
    }
  }, [token, navigate, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    if (!password) return setError({ password: "err_empty_pass" });
    if (password.length < 6) return setError({ password: "err_short_pass" });
    if (password !== confirmPassword)
      return setError({ confirmPassword: "err_not_match" });

    try {
      setIsProcessing(true);
      const result = await authApi.activateB2BAccount({ token, password });

      if (result.success) {
        toast.success(t("messages.PASSWORD_RESET_SUCCESS", "Tạo mật khẩu thành công!"), { duration: 1500 });
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "SERVER_ERROR";
      toast.error(t(`messages.${errorMsg}`, "Có lỗi xảy ra, vui lòng thử lại!"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!token) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[360px] mx-auto text-center"
    >
      <h1 className="text-3xl font-logo font-bold mb-2 text-gradient-gold">
        Kích hoạt tài khoản
      </h1>
      <p className="text-mkhe-text/60 mb-8 text-sm italic">
        Vui lòng tạo mật khẩu cho lần đầu đăng nhập.
      </p>

      <div className="space-y-4 mb-6 text-left">
        <div>
          <InputField
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error.password) setError({ ...error, password: null });
            }}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-mkhe-text/50" />
                ) : (
                  <Eye className="w-5 h-5 text-mkhe-text/50" />
                )}
              </button>
            }
          />
          <ErrorText error={error.password ? "Vui lòng kiểm tra lại mật khẩu (Tối thiểu 6 ký tự)" : null} />
        </div>

        <div>
          <InputField
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error.confirmPassword)
                setError({ ...error, confirmPassword: null });
            }}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="cursor-pointer p-1"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-mkhe-text/50" />
                ) : (
                  <Eye className="w-5 h-5 text-mkhe-text/50" />
                )}
              </button>
            }
          />
          <ErrorText error={error.confirmPassword ? "Mật khẩu không khớp" : null} />
        </div>
      </div>

      <Button type="submit" disabled={isProcessing} className="w-full">
        {isProcessing ? "Đang xử lý..." : "Kích hoạt"}
      </Button>
    </form>
  );
}
