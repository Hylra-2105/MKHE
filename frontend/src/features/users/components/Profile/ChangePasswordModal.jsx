import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { X, Eye, EyeOff, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { maskEmail } from "@/utils/validators";
import { getPasswordErrorKey } from "@/utils/validators";
import { authApi } from "@/api/authApi";

const ChangePasswordModal = ({ isOpen, onClose, userEmail }) => {
  const { t, i18n } = useTranslation(["user", "common"]);
  const currentLang = i18n.language;

  const [step, setStep] = useState("verify");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [newPass, setNewPass] = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [timer, setTimer] = useState(0);
  const [hasSentOTP, setHasSentOTP] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

  // Khôi phục trạng thái OTP từ localStorage khi reload trang
  useEffect(() => {
    const expiresAt = localStorage.getItem("mkhe_otp_expires_at");
    const savedStep = localStorage.getItem("mkhe_otp_step");
    const savedHasSent = localStorage.getItem("mkhe_otp_has_sent");
    const updateExpiresAt = localStorage.getItem("mkhe_otp_update_expires_at");

    // Nếu đang ở bước update, kiểm tra xem đã hết 1 phút chưa
    if (savedStep === "update") {
      if (updateExpiresAt && Date.now() < parseInt(updateExpiresAt)) {
        setStep("update");
        setHasSentOTP(true);
        return;
      } else {
        // Hết hạn 1 phút => reset
        localStorage.removeItem("mkhe_otp_step");
        localStorage.removeItem("mkhe_otp_update_expires_at");
      }
    }

    if (expiresAt) {
      const remaining = Math.ceil((parseInt(expiresAt) - Date.now()) / 1000);
      if (remaining > 0) {
        setTimer(remaining);
        setStep(localStorage.getItem("mkhe_otp_step") || "verify");
        setHasSentOTP(savedHasSent === "true");
        return;
      }
    }

    // Giữ trạng thái form nếu đã gửi OTP nhưng hết thời gian đếm ngược
    if (savedHasSent === "true") {
      setHasSentOTP(true);
      setStep(savedStep || "verify");
      setTimer(0);
    }
  }, []);

  // Đếm ngược thời gian chờ OTP
  useEffect(() => {
    let interval;
    if (timer > 0 && step === "verify") {
      interval = setInterval(() => {
        setTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // Tự động xác thực khi nhập đủ 6 số OTP
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 6 && !loading && step === "verify") {
      executeVerifyOTP(otpString);
    }
  }, [otp]);

  // Gửi OTP khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const expiresAt = localStorage.getItem("mkhe_otp_expires_at");
      const savedStep = localStorage.getItem("mkhe_otp_step");
      const remaining = expiresAt
        ? Math.ceil((parseInt(expiresAt) - Date.now()) / 1000)
        : 0;

      // Giữ form cập nhật mật khẩu nếu đã xác thực thành công (trong vòng 1 phút)
      const updateExpiresAt = localStorage.getItem("mkhe_otp_update_expires_at");
      if (savedStep === "update") {
        if (updateExpiresAt && Date.now() < parseInt(updateExpiresAt)) {
          setStep("update");
          return;
        } else {
          // Nếu đã hết hạn 1 phút, xóa trạng thái
          localStorage.removeItem("mkhe_otp_step");
          localStorage.removeItem("mkhe_otp_update_expires_at");
        }
      }

      // Giữ form nếu đang trong thời gian chờ
      if (remaining > 0) {
        setTimer(remaining);
        return;
      }

      // Gửi OTP khi hết thời gian chờ hoặc lần đầu mở
      const sendInitialOtp = async () => {
        try {
          setErrorMsg("");
          await authApi.sendChangePasswordOtp({ language: currentLang });
          toast.success(t("messages.otp_sent_success"));

          // Lưu thời gian khóa gửi lại OTP vào localStorage
          const lockUntil = Date.now() + 60000;
          localStorage.setItem("mkhe_otp_expires_at", lockUntil.toString());
          localStorage.setItem("mkhe_otp_has_sent", "true");
          localStorage.setItem("mkhe_otp_step", "verify");

          setTimer(60);
          setHasSentOTP(true);
          setStep("verify");
        } catch (error) {
          const msg = error.response?.data?.message || "SERVER_ERROR";
          // Try user namespace first, fallback to common namespace
          let translated = t(msg);
          if (translated === msg) translated = t(msg, { ns: "common" });
          setErrorMsg(translated);
        }
      };
      sendInitialOtp();
    }
  }, [isOpen, currentLang, t]);

  // Ẩn modal nếu chưa từng mở
  if (!isOpen && !hasSentOTP) return null;

  const maskedEmail = maskEmail(userEmail);

  const handleClose = () => {
    setErrorMsg("");
    onClose();
  };

  // Xử lý nhập OTP
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    setErrorMsg("");

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (isNaN(pastedData)) return;
    setErrorMsg("");

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


  const executeVerifyOTP = async (otpString) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await authApi.verifyChangePasswordOtp({
        otp: otpString,
      });

      if (response.success) {
        setStep("update");
        localStorage.setItem("mkhe_otp_step", "update"); // Lưu trạng thái để không mất form khi reload
        localStorage.setItem("mkhe_otp_update_expires_at", (Date.now() + 60000).toString()); // Lưu thời hạn 1 phút
        toast.success(t("otp.verified"));
      }
    } catch (error) {
      const msg = error.response?.data?.message || "SERVER_ERROR";
      setErrorMsg(t(msg));
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return setErrorMsg(t("otp.invalid_length"));
    executeVerifyOTP(otpString);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setErrors({});
    const passError = getPasswordErrorKey(newPass.password);
    if (passError) return setErrors({ password: t(`common:${passError}`) });
    if (newPass.password !== newPass.confirm)
      return setErrors({ confirm: t("errors.pass_mismatch") });

    setLoading(true);
    try {
      const response = await authApi.changePasswordWithOtp({
        otp: otp.join(""),
        newPassword: newPass.password,
      });

      if (response.success) {
        toast.success(t("messages.change_pass_success"));

        // Xóa trạng thái OTP sau khi đổi mật khẩu thành công
        localStorage.removeItem("mkhe_otp_expires_at");
        localStorage.removeItem("mkhe_otp_has_sent");
        localStorage.removeItem("mkhe_otp_step");
        localStorage.removeItem("mkhe_otp_update_expires_at");

        setStep("verify");
        setHasSentOTP(false);
        setTimer(0);
        setOtp(["", "", "", "", "", ""]);
        setNewPass({ password: "", confirm: "" });
        onClose();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "SERVER_ERROR";
      let translated = t(msg);
      if (translated === msg) translated = t(msg, { ns: "common" });
      
      if (msg === "PASSWORD_MUST_BE_DIFFERENT") {
        setErrors({ password: translated });
      } else {
        setErrorMsg(translated);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setErrorMsg("");
      await authApi.sendChangePasswordOtp({ language: currentLang });

      const lockUntil = Date.now() + 60000;
      localStorage.setItem("mkhe_otp_expires_at", lockUntil.toString());

      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
      toast.success(t("messages.otp_sent_success"));
    } catch (error) {
      const msg = error.response?.data?.message || "SERVER_ERROR";
      let translated = t(msg);
      if (translated === msg) translated = t(msg, { ns: "common" });
      setErrorMsg(translated);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`relative bg-[var(--color-mkhe-bg)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-mkhe-border)]/30 transform transition-all duration-200 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >

        <div className="flex items-center justify-between mx-6 pt-6 pb-5 border-b border-[var(--color-mkhe-border)]/50 transition-colors">
          <div className="w-10"></div>
          <h2 className="text-lg font-bold text-gradient-gold">
            {step === "verify" ? t("otp.title") : t("profile.new_password")}
          </h2>
          <div className="w-10 flex justify-end">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[var(--color-mkhe-primary)]/10 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5 text-[var(--color-mkhe-text)]/70" />
            </button>
          </div>
        </div>


        <div className="p-8">
          {step === "verify" ? (
            <form
              onSubmit={handleVerifySubmit}
              className="space-y-6 text-center"
            >
              <div>
                <p className="text-sm text-[var(--color-mkhe-text)]/70 leading-relaxed mb-6">
                  {t("otp.description")} <br />
                  <strong className="text-[var(--color-mkhe-primary)]">
                    {maskedEmail}
                  </strong>
                </p>
              </div>

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
                    className="w-12 h-14 text-center text-2xl font-bold text-[var(--color-mkhe-text)] bg-transparent border-2 border-[var(--color-mkhe-border)] rounded-lg focus:border-[var(--color-mkhe-primary)] focus:outline-none transition-colors"
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 -mt-2 text-red-500 text-xs font-medium px-1 justify-center mb-4">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className="w-full"
              >
                {loading ? t("buttons.verifying") : t("buttons.submit")}
              </Button>

              <div className="text-center text-sm mt-6">
                <span className="text-[var(--color-mkhe-text)]/60">
                  {t("labels.not_received")}{" "}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0}
                  className={`font-bold ml-1 transition-colors ${
                    timer > 0
                      ? "text-[var(--color-mkhe-text)]/40 cursor-not-allowed"
                      : "text-[var(--color-mkhe-primary)] hover:underline cursor-pointer"
                  }`}
                >
                  {t("labels.resend")}
                </button>
                {timer > 0 && (
                  <span className="text-[var(--color-mkhe-text)]/60 ml-1">
                    ({timer}s)
                  </span>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-sm text-[var(--color-mkhe-text)]/70">
                  {t("profile.change_password_desc")}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <InputField
                    type={showPass ? "text" : "password"}
                    label={t("auth.new_password")}
                    value={newPass.password}
                    onChange={(e) => {
                      setErrorMsg("");
                      setErrors((prev) => ({ ...prev, password: null }));
                      setNewPass({ ...newPass, password: e.target.value });
                    }}
                    placeholder="••••••••"
                    required
                    error={errors.password ? errors.password : null}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="cursor-pointer p-1"
                      >
                        {showPass ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    }
                  />
                </div>

                <div>
                  <InputField
                    type={showConfirmPass ? "text" : "password"}
                    label={t("auth.confirm_new_password")}
                    value={newPass.confirm}
                    onChange={(e) => {
                      setErrorMsg("");
                      setErrors((prev) => ({ ...prev, confirm: null }));
                      setNewPass({ ...newPass, confirm: e.target.value });
                    }}
                    placeholder="••••••••"
                    required
                    error={errors.confirm ? errors.confirm : null}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="cursor-pointer p-1"
                      >
                        {showConfirmPass ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    }
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-medium px-1 justify-center mb-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-4">
                {loading ? t("buttons.saving") : t("profile.update_password")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
