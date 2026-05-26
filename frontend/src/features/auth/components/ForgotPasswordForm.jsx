import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";

export default function ForgotPasswordForm() {
  const { t } = useTranslation("forgot_password");
  const navigate = useNavigate();
  const { forgotPasswordAction, verifyResetOtpAction, isLoading } =
    useAuthStore();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Thêm state này để ép giữ hiệu ứng loading cho mượt
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0 && step === 2) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, step]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!email) return setError(t("err_empty_email"));

    const result = await forgotPasswordAction(email);

    if (result.success) {
      setIsProcessing(true); // Giữ nút ở trạng thái "Đang gửi..."

      // Tạo độ trễ 1s trước khi nhảy sang form OTP
      setTimeout(() => {
        toast.success(t("OTP_SENT"));
        setStep(2);
        setCountdown(60);
        setIsProcessing(false);
        setTimeout(() => {
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }, 100);
      }, 1000);
    } else {
      setError(t(result.message) || t("SERVER_ERROR"));
    }
  };

  const verifyOtpCode = async (otpString) => {
    const result = await verifyResetOtpAction(email, otpString);

    if (result.success) {
      setIsProcessing(true); // Giữ nút ở trạng thái "Đang xác thực..."

      // Fake độ trễ 1.5 giây để UX mượt mà
      setTimeout(() => {
        toast.success(t("OTP_VERIFIED"), { duration: 1500 });

        // Chờ toast hiện 0.5s rồi mới văng sang trang đổi mật khẩu
        setTimeout(() => {
          navigate("/reset-password", {
            state: { email: email, resetToken: result.resetToken },
          });
        }, 500);
      }, 1500);
    } else {
      toast.error(t(result.message) || t("SERVER_ERROR"));
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }
  };

  useEffect(() => {
    const otpString = otp.join("");
    // Chặn gọi API nếu đang trong quá trình fake loading
    if (otpString.length === 6 && !isLoading && !isProcessing) {
      verifyOtpCode(otpString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (isNaN(pastedData)) return;
    const digits = pastedData.slice(0, 6).split("");
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((digit, i) => (newOtp[i] = digit));
    setOtp(newOtp);
    const nextFocus = digits.length < 6 ? digits.length : 5;
    inputRefs.current[nextFocus].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setOtp(["", "", "", "", "", ""]);

    const result = await forgotPasswordAction(email);
    setIsResending(false);

    if (result.success) {
      toast.success(t("RESEND_SUCCESS"), { duration: 2000 });
      setCountdown(60);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } else {
      toast.error(t(result.message) || t("SERVER_ERROR"));
    }
  };

  const handleSubmitOTP = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) return;
    verifyOtpCode(otpString);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      <h1 className="text-3xl font-logo font-bold mb-4 text-gradient-gold">
        {t("title")}
      </h1>

      {step === 1 ? (
        <>
          <p className="text-mkhe-text/60 mb-8 text-sm italic">
            {t("email_desc")}
          </p>
          <form onSubmit={handleSendOtp} className="space-y-6 text-left">
            <div>
              <InputField
                type="email"
                placeholder={t("email_placeholder")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
              />
              <ErrorText error={error} t={t} />
            </div>
            {/* Sử dụng isProcessing để giữ nút loading */}
            <Button type="submit" disabled={isLoading || isProcessing}>
              {isLoading || isProcessing ? t("btn_sending") : t("btn_send_otp")}
            </Button>
          </form>
        </>
      ) : (
        <>
          <p className="text-mkhe-text/80 mb-8 text-sm">
            {t("otp_desc")}
            <br />
            <strong className="text-mkhe-primary">{email}</strong>
          </p>
          <form onSubmit={handleSubmitOTP} className="space-y-6">
            <div className="flex justify-center gap-2 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold text-mkhe-text bg-transparent border-2 border-mkhe-border rounded-lg focus:border-mkhe-primary focus:outline-none transition-colors"
                />
              ))}
            </div>

            {/* Sử dụng isProcessing để giữ nút loading */}
            <Button
              type="submit"
              disabled={isLoading || isProcessing || otp.join("").length < 6}
            >
              {(isLoading && !isResending) || isProcessing
                ? t("btn_verifying")
                : t("btn_verify_otp")}
            </Button>

            <div className="text-center text-sm mt-6">
              <span className="text-mkhe-text/60">{t("not_received")} </span>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isResending}
                className={`font-bold ml-1 transition-colors ${
                  countdown > 0 || isResending
                    ? "text-mkhe-text/40 cursor-not-allowed"
                    : "text-mkhe-primary hover:underline cursor-pointer"
                }`}
              >
                {isResending ? t("btn_sending") : t("resend")}
              </button>

              {countdown > 0 && (
                <span className="text-mkhe-text/60 ml-1">({countdown}s)</span>
              )}
            </div>
          </form>
        </>
      )}

      <div className="mt-8">
        <Link
          to="/login"
          className="text-sm text-mkhe-text/60 hover:text-mkhe-primary transition-colors hover:underline"
        >
          {t("back_to_login")}
        </Link>
      </div>
    </div>
  );
}
