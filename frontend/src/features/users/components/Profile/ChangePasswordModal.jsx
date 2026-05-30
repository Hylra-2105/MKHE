import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { X, Eye, EyeOff, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { maskEmail } from "@/utils/validators";
import { authApi } from "@/api/authApi";

const ChangePasswordModal = ({ isOpen, onClose, userEmail }) => {
  const { t, i18n } = useTranslation("user");
  const currentLang = i18n.language;

  const [step, setStep] = useState("verify");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [newPass, setNewPass] = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);

  const [timer, setTimer] = useState(0);
  const [hasSentOTP, setHasSentOTP] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // =========================================================
  // BƯỚC 1: KHÔI PHỤC TRẠNG THÁI TỪ LOCALSTORAGE KHI F5 (RELOAD) PAGÉ
  // =========================================================
  useEffect(() => {
    const expiresAt = localStorage.getItem("mkhe_otp_expires_at");
    const savedStep = localStorage.getItem("mkhe_otp_step");
    const savedHasSent = localStorage.getItem("mkhe_otp_has_sent");

    if (expiresAt) {
      const remaining = Math.ceil((parseInt(expiresAt) - Date.now()) / 1000);
      if (remaining > 0) {
        setTimer(remaining);
        setStep(savedStep || "verify");
        setHasSentOTP(savedHasSent === "true");
        return;
      }
    }

    // Nếu đã từng gửi trước đó nhưng thời gian đếm ngược kết thúc, vẫn giữ lại trạng thái form cho người dùng nhập tiếp
    if (savedHasSent === "true") {
      setHasSentOTP(true);
      setStep(savedStep || "verify");
      setTimer(0);
    }
  }, []);

  // =========================================================
  // BƯỚC 2: ĐẾM NGƯỢC THỜI GIAN (Bỏ điều kiện isOpen để đóng modal vẫn đếm ngầm)
  // =========================================================
  useEffect(() => {
    let interval;
    if (timer > 0 && step === "verify") {
      interval = setInterval(() => {
        setTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // Tự động kích hoạt khi gõ đủ 6 số
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 6 && !loading && step === "verify") {
      executeVerifyOTP(otpString);
    }
  }, [otp]);

  // =========================================================
  // BƯỚC 3: XỬ LÝ KHI NGƯỜI DÙNG BẤM MỞ MODAL (Kiểm tra chặn spam mail)
  // =========================================================
  useEffect(() => {
    if (isOpen) {
      const expiresAt = localStorage.getItem("mkhe_otp_expires_at");
      const savedStep = localStorage.getItem("mkhe_otp_step");
      const remaining = expiresAt
        ? Math.ceil((parseInt(expiresAt) - Date.now()) / 1000)
        : 0;

      // TH1: Nếu đã xác thực thành công và đang ở bước nhập mật khẩu mới
      // -> Giữ nguyên form update, không gửi OTP mới.
      if (savedStep === "update") {
        setStep("update");
        return;
      }

      // TH2: Nếu đồng hồ đếm ngược lock vẫn đang chạy -> Giữ nguyên form, không gửi lại mail mới
      if (remaining > 0) {
        setTimer(remaining);
        return;
      }

      // TH3: Gửi OTP (lần đầu hoặc khi đã hết 60s chờ)
      const sendInitialOtp = async () => {
        try {
          setErrorMsg("");
          await authApi.sendChangePasswordOtp({ language: currentLang });
          toast.success(t("messages.otp_sent_success"));

          // Lưu mốc thời gian khóa nút "Gửi lại" trong 60 giây tiếp theo xuống LocalStorage
          const lockUntil = Date.now() + 60000;
          localStorage.setItem("mkhe_otp_expires_at", lockUntil.toString());
          localStorage.setItem("mkhe_otp_has_sent", "true");
          localStorage.setItem("mkhe_otp_step", "verify");

          setTimer(60);
          setHasSentOTP(true);
          setStep("verify");
        } catch (error) {
          const msg = error.response?.data?.message || "SERVER_ERROR";
          setErrorMsg(t(msg));
        }
      };
      sendInitialOtp();
    }
  }, [isOpen, currentLang, t]);

  // Nếu chưa từng bấm Đổi mật khẩu bao giờ thì tàng hình hoàn toàn
  if (!isOpen && !hasSentOTP) return null;

  const maskedEmail = maskEmail(userEmail);

  const handleClose = () => {
    setErrorMsg("");
    if (step === "update") {
      localStorage.removeItem("mkhe_otp_expires_at");
      localStorage.removeItem("mkhe_otp_has_sent");
      localStorage.removeItem("mkhe_otp_step");
      setStep("verify");
      setHasSentOTP(false);
      setTimer(0);
      setOtp(["", "", "", "", "", ""]);
      setNewPass({ password: "", confirm: "" });
    }
    onClose();
  };

  // ================= CÁC HÀM XỬ LÝ 6 Ô OTP =================
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
  // ==========================================================

  const executeVerifyOTP = async (otpString) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await authApi.verifyChangePasswordOtp({
        otp: otpString,
      });

      if (response.success) {
        setStep("update");
        localStorage.setItem("mkhe_otp_step", "update"); // Lưu lại bước để F5 không bay mất trang nhập pass mới
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
    if (newPass.password.length < 6) return setErrorMsg(t("errors.pass_short"));
    if (newPass.password !== newPass.confirm)
      return setErrorMsg(t("errors.pass_mismatch"));

    setLoading(true);
    try {
      const response = await authApi.changePasswordWithOtp({
        otp: otp.join(""),
        newPassword: newPass.password,
      });

      if (response.success) {
        toast.success(t("messages.change_pass_success"));

        // ĐỔI THÀNH CÔNG: Dọn sạch mọi dấu vết trong máy
        localStorage.removeItem("mkhe_otp_expires_at");
        localStorage.removeItem("mkhe_otp_has_sent");
        localStorage.removeItem("mkhe_otp_step");

        setStep("verify");
        setHasSentOTP(false);
        setTimer(0);
        setOtp(["", "", "", "", "", ""]);
        setNewPass({ password: "", confirm: "" });
        onClose();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "SERVER_ERROR";
      setErrorMsg(t(msg));
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
      setErrorMsg(t(msg));
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`relative bg-[var(--color-mkhe-bg)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-mkhe-border)]/30 transform transition-all duration-200 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        {/* HEADER */}
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

        {/* BODY */}
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
                <div className="flex items-center gap-2 text-red-500 text-sm mb-4 justify-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <Info className="w-4 h-4" />
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
                <div className="relative">
                  <label className="text-[10px] font-bold text-[var(--color-mkhe-text)]/50 uppercase ml-1 block mb-1">
                    {t("auth.new_password")}
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPass.password}
                    onChange={(e) => {
                      setErrorMsg("");
                      setNewPass({ ...newPass, password: e.target.value });
                    }}
                    className="w-full p-4 bg-transparent border border-[var(--color-mkhe-border)]/50 text-[var(--color-mkhe-text)] rounded-xl focus:outline-none focus:border-[var(--color-mkhe-primary)] transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-9 text-[var(--color-mkhe-text)]/50 hover:text-[var(--color-mkhe-primary)] cursor-pointer transition-colors"
                  >
                    {showPass ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold text-[var(--color-mkhe-text)]/50 uppercase ml-1 block mb-1">
                    {t("auth.confirm_new_password")}
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPass.confirm}
                    onChange={(e) => {
                      setErrorMsg("");
                      setNewPass({ ...newPass, confirm: e.target.value });
                    }}
                    className="w-full p-4 bg-transparent border border-[var(--color-mkhe-border)]/50 text-[var(--color-mkhe-text)] rounded-xl focus:outline-none focus:border-[var(--color-mkhe-primary)] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-red-500 text-sm mb-4 justify-center bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-4">
                  <Info className="w-4 h-4" />
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
