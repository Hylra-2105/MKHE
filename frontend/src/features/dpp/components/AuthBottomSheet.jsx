import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { X, Sparkles } from "lucide-react";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";

const AuthBottomSheet = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation(["dpp", "login", "common"]);
  const { socialLoginAction } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);

      if (!result || !result.user) {
        throw new Error("Không lấy được thông tin từ Google");
      }

      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalInfo?.isNewUser || false;

      const socialData = {
        email: user.email,
        name: user.displayName || "User",
        avatar: user.photoURL || "",
        providerId: "google",
      };

      const res = await socialLoginAction(socialData);

      if (res && res.success) {
        onSuccess(isNewUser);
      } else {
        const msg = res?.message || "";
        if (msg === "ACCOUNT_BLOCKED") {
          toast.error(t("err_account_blocked"), { duration: 4000 });
        } else {
          toast.error(t([msg, `common:${msg}`, "error_default"]), {
            duration: 3000,
          });
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-mkhe-bg/80 backdrop-blur-3xl border-t border-mkhe-border/50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Top decorative bar */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-mkhe-border/50 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full cursor-pointer text-mkhe-text/70 hover:text-mkhe-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-8 pb-12 pt-6">
              <div className="text-center space-y-4 mb-8">
                <div className="mx-auto w-16 h-16 bg-mkhe-primary/20 rounded-full flex items-center justify-center border border-mkhe-primary/30 mb-2">
                  <Sparkles className="w-8 h-8 text-mkhe-primary" />
                </div>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-mkhe-text via-mkhe-text/90 to-mkhe-primary/60 font-logo">
                  {t("o2o.new_member")}
                </h3>
                <p className="text-sm text-mkhe-text/70 leading-relaxed max-w-xs mx-auto">
                  {t("o2o.login_to_save_voucher")} <strong className="text-mkhe-primary">{t("o2o.voucher_code")}</strong> {t("o2o.login_to_save_voucher_suffix")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center cursor-pointer gap-3 py-4 bg-mkhe-text/5 border border-mkhe-border/50 rounded-2xl hover:bg-mkhe-text/10 hover:border-mkhe-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isGoogleLoading ? (
                  <span className="w-6 h-6 border-2 border-mkhe-text border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <GoogleIcon className="w-6 h-6" />
                )}
                <span className="text-base font-bold text-mkhe-text tracking-wide">
                  {isGoogleLoading ? t("login:btn_processing") : t("login:google", "Tiếp tục với Google")}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthBottomSheet;
