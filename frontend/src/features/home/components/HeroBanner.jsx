import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// === IMPORT VIDEO ===
import bannerVideo from "@/assets/videos/video-banner-mkhe.mp4";

const HeroBanner = () => {
  const { t } = useTranslation("home");
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    if (isVideoOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVideoOpen]);

  return (
    <>
      <section className="relative min-h-[90vh] bg-mkhe-bg overflow-hidden flex items-center pt-12 pb-20">
        {/* =========================================
            STRIPE-STYLE COLORFUL GRADIENT STRIPES
        ========================================== */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div
            className="absolute -bottom-1/3 -right-1/4 w-full h-full"
            style={{
              background: `linear-gradient(135deg, #c5a059 0%, #8E5E37 20%, transparent 50%)`,
              transform: "rotate(-20deg)",
              borderRadius: "40% 60% 50% 50%",
              opacity: 0.35,
            }}
          />
          <div
            className="absolute -top-1/4 -right-1/3 w-3/4 h-3/4"
            style={{
              background: `linear-gradient(110deg, #8E5E37 0%, #D4A373 30%, transparent 70%)`,
              transform: "rotate(-35deg)",
              borderRadius: "50% 40% 60% 50%",
              opacity: 0.3,
            }}
          />
          <div
            className="absolute top-0 right-1/4 w-2/3 h-screen"
            style={{
              background: `linear-gradient(45deg, transparent 0%, #c5a059 20%, #D4A373 40%, transparent 70%)`,
              transform: "skewX(-15deg)",
              opacity: 0.25,
            }}
          />
          <div
            className="absolute top-1/3 right-0 w-1/2 h-1/2"
            style={{
              background: `linear-gradient(160deg, #D4A373 0%, #C38D64 25%, #8E5E37 50%, transparent 80%)`,
              opacity: 0.35,
            }}
          />
          <div
            className="absolute -bottom-1/2 right-1/3 w-2/3 h-full"
            style={{
              background: `radial-gradient(ellipse at center, #8E5E37 0%, #c5a059 30%, transparent 80%)`,
              filter: "blur(80px)",
              opacity: 0.2,
            }}
          />
        </div>
        <motion.div
          className="absolute top-[-5%] left-[-20%] md:left-[-5%] w-[60vw] md:w-[40vw] h-[120vh] pointer-events-none z-10"
          style={{
            background: "linear-gradient(180deg, rgba(212, 163, 115, 0.2) 0%, transparent 80%)",
            clipPath: "polygon(45% 0, 55% 0, 100% 100%, 0% 100%)", // Cắt khối thành hình chóp nón (tia sáng)
            filter: "blur(40px)", // Làm nhòe viền để ánh sáng tỏa ra tự nhiên
            transformOrigin: "top center", // Điểm neo ở trên trần nhà để đung đưa
          }}
          // Đung đưa lùi tới từ góc 15 độ đến 25 độ
          animate={{ rotate: [15, -50, 15] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 🔦 Đèn rọi bên PHẢI */}
        <motion.div
          className="absolute top-[-5%] right-[-20%] md:right-[-5%] w-[60vw] md:w-[40vw] h-[120vh] pointer-events-none z-10"
          style={{
            background: "linear-gradient(180deg, rgba(212, 163, 115, 0.2) 0%, transparent 80%)",
            clipPath: "polygon(45% 0, 55% 0, 100% 100%, 0% 100%)",
            filter: "blur(40px)",
            transformOrigin: "top center",
          }}
          // Đung đưa ngược chiều, từ -15 độ đến -25 độ
          animate={{ rotate: [-15, 50, -15] }} 
          // delay: 1 giúp 2 đèn lắc không đều nhau, nhìn tự nhiên hơn
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }} 
        />

        {/* =========================================
            NỘI DUNG CHÍNH (CĂN GIỮA)
        ========================================== */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col items-center text-center">
          
          <div className="max-w-4xl flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mkhe-primary/10 text-mkhe-primary text-[11px] md:text-sm font-bold uppercase tracking-widest mb-6 border border-mkhe-primary/20 backdrop-blur-sm shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-mkhe-primary shadow-[0_0_8px_var(--color-mkhe-primary)]"></span>
              Heritage & Elegance
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-mkhe-text font-logo leading-[1.2] tracking-tight mb-6 drop-shadow-sm max-w-3xl"
            >
              {t("hero.title_1")}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mkhe-primary via-[#D4A373] to-[#C38D64]">
                {t("hero.title_highlight")}
              </span>
            </motion.h1>
            {/* CỤM NÚT BẤM KẾT HỢP NÚT PLAY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col items-center gap-8"
            >
              {/* NÚT PLAY LƠ LỬNG (ĐÃ CHUYỂN LÊN TRÊN) */}
              <div 
                onClick={() => setIsVideoOpen(true)}
                className="group flex flex-col items-center gap-3 cursor-pointer"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                  {/* Vòng tròn nhịp đập */}
                  <div className="absolute inset-0 bg-mkhe-primary/40 rounded-full animate-ping opacity-75" />
                  
                  {/* Nút Play Gốc */}
                  <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-mkhe-primary to-[#8E5E37] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,163,115,0.4)] transform transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-6 h-6 md:w-8 md:h-8 text-white translate-x-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="text-base md:text-lg text-mkhe-text/80 mb-10 max-w-2xl leading-relaxed font-medium">
                {t(
                  "hero.subtitle",
                  "Khám phá di sản tinh hoa qua từng đường nét thủ công đương đại. Đánh thức bản sắc bằng công nghệ số.",
                )}
              </div>

              {/* 2 NÚT CHỨC NĂNG (ĐÃ CHUYỂN XUỐNG DƯỚI) */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-mkhe-primary to-[#D4A373] text-white px-8 py-3.5 md:py-4 rounded-full font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-mkhe-primary/30 cursor-pointer">
                  {t("hero.cta_explore", "Khám phá Bộ Sưu Tập")}{" "}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="bg-mkhe-bg/50 backdrop-blur-md text-mkhe-primary border-2 border-mkhe-primary/50 px-8 py-3.5 md:py-4 rounded-full font-bold hover:bg-mkhe-primary/10 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                  {t("hero.cta_about", "Câu chuyện MKHE")}
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================
          POPUP MODAL XEM VIDEO (GIỮ NGUYÊN)
      ========================================== */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10"
          >
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white bg-white/10 hover:bg-mkhe-primary rounded-full p-2 transition-all cursor-pointer z-[110]"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
            >
              <video
                src={bannerVideo}
                autoPlay
                controls 
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeroBanner;