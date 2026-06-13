import React, { useState, useEffect } from "react";
import "@google/model-viewer"; 
import { Box, Smartphone, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const ModelViewer3D = ({ src, alt }) => {
  const { t } = useTranslation("dpp");
  const [isMounted, setIsMounted] = useState(false);
  const modelRef = React.useRef(null);

  useEffect(() => {
    // Kỹ thuật "Nhường đường cho UI" (Lazy Mount)
    // Đợi 600ms để trình duyệt vẽ xong layout & CSS rồi mới khởi động WebGL
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted && modelRef.current) {
      // Ép model-viewer không được giảm độ phân giải khi người dùng xoay/tương tác
      modelRef.current.minimumRenderScale = 1;
    }
  }, [isMounted]);

  if (!src || !isMounted) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center space-y-6 opacity-80">
        <div className="relative flex items-center justify-center">
          <Box className="w-16 h-16 text-mkhe-primary/20 absolute" />
          <Loader2 className="w-8 h-8 text-mkhe-primary animate-spin absolute" />
        </div>
        <p className="text-mkhe-primary/70 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse mt-8">{t("model.initializing")}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center group cursor-grab active:cursor-grabbing">
      {/* Decorative center glow behind the model */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-mkhe-primary/15 rounded-full blur-[80px] pointer-events-none transition-opacity duration-700 group-hover:opacity-60" />

      <model-viewer
        ref={modelRef}
        src={src}
        alt={alt || t("model.alt")}
        camera-controls
        auto-rotate
        rotation-per-second="20deg"
        interaction-prompt="none"
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="2"
        shadow-softness="1.5"
        exposure="1.2"
        environment-image="neutral"
        bounds="tight"
        camera-target="0m auto 0m"
        camera-orbit="0deg 75deg 120%"
        style={{ width: "100%", height: "100%", backgroundColor: "transparent", zIndex: 10 }}
      >
        {/* Nút bấm hiển thị khi có AR (Chỉ hiện trên điện thoại hỗ trợ) */}
        <button 
          slot="ar-button" 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-mkhe-bg hover:bg-mkhe-primary text-mkhe-text border border-mkhe-border hover:border-mkhe-primary backdrop-blur-xl px-8 py-4 rounded-full transition-all duration-300 shadow-xl transform hover:scale-105"
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
            {t("model.arExperience")}
          </span>
        </button>
      </model-viewer>
    </div>
  );
};

export default ModelViewer3D;