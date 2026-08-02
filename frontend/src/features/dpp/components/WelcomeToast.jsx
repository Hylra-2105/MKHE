import {  useState, useEffect  } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const WelcomeToast = ({ onToastClick }) => {
  const { t } = useTranslation("dpp");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hiện sau 1.5s
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    // Tự động ẩn sau 10s (hiển thị 8.5s)
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClick = () => {
    setIsVisible(false);
    if (onToastClick) {
      onToastClick();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.x > 50 || offset.x < -50 || velocity.x > 500 || velocity.x < -500) {
              setIsVisible(false);
            }
          }}
          onClick={handleClick}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] cursor-pointer touch-none"
        >
          <div className="bg-mkhe-bg/80 backdrop-blur-md border border-mkhe-border/50 shadow-xl px-5 py-3 rounded-full flex items-center gap-2">
            <span className="text-sm font-semibold text-mkhe-text">
              {t("o2o.toast_secret")}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeToast;
