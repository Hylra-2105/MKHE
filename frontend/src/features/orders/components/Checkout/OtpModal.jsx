import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OtpModal({ user, setOtp, showOtpModal, setShowOtpModal, handleCheckout, handleSendOtp, isSubmitting, otpSending, lastOtpTime }) {
  const { t } = useTranslation("checkout");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [countdown, setCountdown] = useState(60);

  // Reset khi mở modal
  useEffect(() => {
    if (showOtpModal) {
      setOtpArray(["", "", "", "", "", ""]);
      setOtp("");
      
      const elapsed = lastOtpTime ? Date.now() - lastOtpTime : 0;
      let remaining = 60;
      if (elapsed > 0 && elapsed < 60000) {
        remaining = 60 - Math.floor(elapsed / 1000);
      }
      setCountdown(remaining);

      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [showOtpModal, setOtp, lastOtpTime]);

  // Sync với parent
  useEffect(() => {
    setOtp(otpArray.join(""));
  }, [otpArray, setOtp]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0 && showOtpModal) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, showOtpModal]);

  // Tự submit khi đủ 6 ký tự
  useEffect(() => {
    const otpString = otpArray.join("");
    // Tự động gọi handleCheckout khi nhập đủ 6 số
    if (otpString.length === 6) {
      handleCheckout(null, otpString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpArray]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);

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
    setOtpArray(newOtp);

    const nextFocus = digits.length < 6 ? digits.length : 5;
    inputRefs.current[nextFocus].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onResend = () => {
    if (countdown > 0 || otpSending) return;
    setOtpArray(["", "", "", "", "", ""]);
    setCountdown(60);
    handleSendOtp();
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  };
  if (!showOtpModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="bg-mkhe-bg p-8 rounded-xl shadow-xl border border-mkhe-border/20 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200 text-center">
        <h3 className="text-2xl font-serif text-mkhe-primary mb-2">
          {t("otp.title")}
        </h3>
        <p className="text-sm text-mkhe-text/60 mb-6">
          {t("otp.sent_to")} <br />
          <strong className="text-mkhe-primary">{user?.email}</strong>.<br />
          {t("otp.instruction")}
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {otpArray.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-2xl font-bold text-mkhe-text bg-mkhe-input/30 border-2 border-mkhe-border/40 rounded-lg focus:border-mkhe-primary focus:outline-none transition-colors"
            />
          ))}
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setShowOtpModal(false)}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-mkhe-border/10 text-mkhe-text rounded-md hover:bg-mkhe-border/20 transition-colors cursor-pointer"
          >
            {t("otp.cancel")}
          </button>
          <button
            onClick={(e) => handleCheckout(e, otpArray.join(""))}
            disabled={otpArray.join("").length !== 6 || isSubmitting}
            className="flex-1 py-3 bg-mkhe-primary text-white rounded-md hover:bg-mkhe-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("otp.confirm")}
          </button>
        </div>

        <div className="mt-6 text-sm text-mkhe-text/60">
          {t("otp.not_received")}
          <button
            onClick={onResend}
            disabled={countdown > 0 || otpSending}
            className="ml-2 text-mkhe-primary font-medium hover:underline disabled:opacity-50 cursor-pointer"
          >
            {otpSending ? t("otp.sending") : countdown > 0 ? `${t("otp.resend")} (${countdown}s)` : t("otp.resend")}
          </button>
        </div>
      </div>
    </div>
  );
}
