import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import Button from "@/components/ui/Button";

export default function VerifyOTPForm() {
  const { t } = useTranslation("otp");
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy các hàm từ Store
  const { verifyOTPAction, resendOTPAction, isLoading } = useAuthStore();

  const email = location.state?.email || "";
  const isNewRegister = location.state?.isNewRegister || false;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const hasAutoSentOTPRef = useRef(false); // Dùng ref thay vì state

  const [countdown, setCountdown] = useState(60); // Đếm ngược 60s
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  // Tự động gửi OTP khi người dùng chuyển hướng sang trang này
  useEffect(() => {
    if (email && !hasAutoSentOTPRef.current && !isNewRegister) {
      hasAutoSentOTPRef.current = true;

      const autoSendOTP = async () => {
        setIsResending(true);
        const result = await resendOTPAction(email);
        setIsResending(false);

        if (result.success) {
          toast.success(t("messages.otp_sent_success"), {
            duration: 3000,
          });
          setCountdown(60);
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        } else {
          const errorMsg = result.message || "SERVER_ERROR";
          toast.error(t(errorMsg), { duration: 3000 });

          hasAutoSentOTPRef.current = false;
        }
      };

      autoSendOTP();
    } else if (isNewRegister) {
      hasAutoSentOTPRef.current = true;
    }
  }, [email, resendOTPAction, t, isNewRegister]);

  // verify otp
  const verifyOtpCode = async (otpString) => {
    // Store tự động set isLoading = true
    const result = await verifyOTPAction({ email, otp: otpString });

    if (result.success) {
      setTimeout(() => {
        toast.success(t(result.message) || t("msg_success"), {
          duration: 1500,
        });

        setTimeout(() => navigate("/login"), 500);
      }, 2000);
    } else {
      const errorMsg = result.message || "SERVER_ERROR";
      toast.error(t(errorMsg), { duration: 3000 });

      // Reset input để nhập lại
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }
  };

  // resend otp
  const handleResendOTP = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setOtp(["", "", "", "", "", ""]); // Reset input để chuẩn bị mã mới

    const result = await resendOTPAction(email);

    setIsResending(false);

    if (result.success) {
      toast.success(t(result.message) || t("RESEND_SUCCESS"), {
        duration: 2000,
      });
      setCountdown(60); // Đếm ngược lại
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } else {
      const errorMsg = result.message || "SERVER_ERROR";
      toast.error(t(errorMsg), { duration: 3000 });
    }
  };

  // đủ 6 số otp thì tự submit
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 6 && !isLoading) {
      verifyOtpCode(otpString);
    }
  }, [otp]);

  // CÁC HÀM XỬ LÝ INPUT CỦA NGƯỜI DÙNG
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Tự nhảy sang ô tiếp theo
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (isNaN(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = ["", "", "", "", "", ""];

    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    const nextFocus = digits.length < 6 ? digits.length : 5;
    inputRefs.current[nextFocus].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      toast.error(t("msg_empty"));
      return;
    }
    verifyOtpCode(otpString);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[400px] mx-auto text-center"
    >
      <h1 className="text-3xl font-logo font-bold mb-4 text-mkhe-primary">
        {t("title")}
      </h1>

      <p className="text-mkhe-text/80 mb-8 text-sm">
        {t("description")}
        <br />
        <strong className="text-mkhe-primary">{email}</strong>
      </p>

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

      <Button type="submit" disabled={isLoading || otp.join("").length < 6}>
        {isLoading ? t("btn_verifying") : t("btn_submit")}
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
          {isResending ? t("btn_processing") || "Đang gửi..." : t("resend")}
        </button>

        {countdown > 0 && (
          <span className="text-mkhe-text/60 ml-1">({countdown}s)</span>
        )}
      </div>

      <div className="mt-4">
        <Link
          to="/register"
          className="text-xs text-mkhe-text/50 hover:text-mkhe-primary transition-colors underline"
        >
          {t("back_to_register")}
        </Link>
      </div>
    </form>
  );
}
