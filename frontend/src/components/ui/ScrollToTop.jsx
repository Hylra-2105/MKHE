import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEffectsConfig from "@/hooks/useEffectsConfig";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { enableEffects } = useEffectsConfig();

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={enableEffects ? { opacity: 0, y: 20, scale: 0.8 } : { opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={enableEffects ? { opacity: 0, y: 20, scale: 0.8 } : { opacity: 0, y: 0, scale: 1 }}
          onClick={scrollToTop}
          className={`group fixed bottom-[180px] right-7 w-[50px] h-[50px] text-mkhe-text/40 dark:text-white/40 hover:text-mkhe-primary rounded-full transition-all duration-300 z-[49] flex items-center justify-center cursor-pointer border border-black/10 dark:border-white/20 hover:border-mkhe-primary/50 shadow-lg ${enableEffects ? 'hover:-translate-y-1' : ''}`}
          title="Lên đầu trang"
        >
          {/* Vòng sáng tỏa ra khi hover */}
          {enableEffects && (
            <div className="absolute inset-1 bg-mkhe-primary/30 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          )}
          <svg viewBox="0 0 60 60" className={`w-8 h-8 fill-none stroke-current transform rotate-90 ${enableEffects ? 'transition-transform duration-500 group-hover:-translate-y-1' : ''}`} xmlns="http://www.w3.org/2000/svg">
            {/* Trục mũi tên đứt đoạn mờ ảo */}
            <path d="M 55,30 L 45,30" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.5"/>
            <path d="M 45,30 L 20,30" strokeWidth="1.5" opacity="0.8" />
            
            {/* Các vòng cung bọc ngoài như cánh hoa sen / khiên bảo vệ */}
            <path d="M 35,12 C 12,22 12,38 35,48" strokeWidth="1.5" />
            <path d="M 40,18 C 22,25 22,35 40,42" strokeWidth="1" opacity="0.3" />
            
            {/* Đầu mũi giáo (Spearhead) sắc lẹm */}
            <polygon points="10,30 24,20 21,30 24,40" className="fill-current drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" stroke="none" />
            
            {/* Tâm la bàn năng lượng (Energy Node) */}
            <circle cx="35" cy="30" r="4" strokeWidth="1.5" className="fill-mkhe-primary" />
            <circle cx="35" cy="30" r="1.5" className="fill-current" stroke="none" />
            <circle cx="45" cy="30" r="1" className="fill-current" stroke="none" opacity="0.5" />
            
            {/* Tàn dư ma thuật (Sparks) lơ lửng */}
            <circle cx="28" cy="15" r="1" className="fill-current" stroke="none" opacity="0.6"/>
            <circle cx="28" cy="45" r="1" className="fill-current" stroke="none" opacity="0.6"/>
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
