import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const BoardGameTeaser = () => {
  const { t } = useTranslation("home");

  return (
    <section className="py-32 pb-48 px-6 bg-gradient-to-b from-mkhe-bg to-mkhe-primary/10 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Mystical Constellation Grid (Top Transition) */}
      <div className="absolute top-0 left-0 w-full leading-[0] z-0 pointer-events-none">
        <svg
          className="relative block w-full h-[150px] md:h-[250px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 200"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Lưới không gian (Grid lines) */}
          <path d="M-100,50 L300,150 L500,20 L800,180 L1300,50" className="stroke-mkhe-primary/20 stroke-[1] fill-transparent" strokeDasharray="5,5" />
          <path d="M100,200 L400,20 L700,150 L1000,50 L1300,150" className="stroke-mkhe-primary/10 stroke-[1] fill-transparent" />
          <path d="M-50,150 L300,0 L600,120 L900,30 L1250,180" className="stroke-mkhe-primary/15 stroke-[1] fill-transparent" strokeDasharray="10,5" />

          {/* Glowing Nodes (Các vì sao/điểm kết nối) */}
          <circle cx="300" cy="150" r="3" className="fill-mkhe-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(212,163,115,0.8))' }} />
          <circle cx="500" cy="20" r="4" className="fill-mkhe-primary" style={{ filter: 'drop-shadow(0 0 8px rgba(212,163,115,0.8))' }} />
          <circle cx="800" cy="180" r="2" className="fill-mkhe-primary" />
          <circle cx="400" cy="20" r="3" className="fill-mkhe-primary/70" />
          <circle cx="700" cy="150" r="5" className="fill-mkhe-primary" style={{ filter: 'drop-shadow(0 0 10px rgba(212,163,115,0.8))' }} />
          <circle cx="1000" cy="50" r="3" className="fill-mkhe-primary" style={{ filter: 'drop-shadow(0 0 5px rgba(212,163,115,0.8))' }} />

          {/* Floating Diamonds (Thẻ bài / Kim cương) */}
          <polygon points="150,80 160,100 150,120 140,100" className="fill-mkhe-primary/30" />
          <polygon points="850,80 855,90 850,100 845,90" className="fill-mkhe-primary/50" />
          <polygon points="1050,120 1065,150 1050,180 1035,150" className="fill-transparent stroke-mkhe-primary/40 stroke-[1]" />
          <polygon points="450,150 460,165 450,180 440,165" className="fill-transparent stroke-mkhe-primary/60 stroke-[1]" />
        </svg>
      </div>

      {/* ABSTRACT GLOWING ORBS */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-mkhe-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#8B5A2B]/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* FLOATING VIP INVITATION CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.5 }}
        className="relative z-10 max-w-4xl w-full text-center rounded-[2rem] border border-mkhe-border bg-mkhe-input/30 backdrop-blur-xl p-16 md:p-24 shadow-2xl overflow-hidden group"
      >
        {/* Subtle inner glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-mkhe-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <div className="absolute inset-0 border border-mkhe-primary/0 group-hover:border-mkhe-primary/20 rounded-[2rem] transition-colors duration-700 pointer-events-none"></div>

        {/* Badge "Coming Soon" */}
        <div className="inline-flex items-center gap-3 mb-10">
          <span className="w-8 h-[1px] bg-mkhe-primary"></span>
          <span className="text-mkhe-primary text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
            {t("boardgame.badge", "Sắp Ra Mắt")}
          </span>
          <span className="w-8 h-[1px] bg-mkhe-primary"></span>
        </div>

        {/* Tiêu đề chính */}
        <h2 className="text-5xl md:text-7xl font-logo font-light mb-8 text-mkhe-text tracking-tight leading-tight">
          {t("boardgame.title", "Boardgame Di Sản")}
        </h2>

        {/* Đoạn mô tả mồi chài */}
        <p className="max-w-2xl mx-auto text-mkhe-text/50 leading-relaxed text-sm font-light uppercase tracking-widest">
          {t("boardgame.desc", "Hành trình khám phá văn hóa sông nước Mekong qua từng lá bài độc bản. Sẵn sàng ra mắt vào cuối năm nay.")}
        </p>

        {/* Decorative corner accents */}
        <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-mkhe-border/50"></div>
        <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-mkhe-border/50"></div>
        <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-mkhe-border/50"></div>
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-mkhe-border/50"></div>
      </motion.div>

      {/* Mystical Rings (Bottom Transition) */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] z-0 pointer-events-none">
        <svg
          className="relative block w-full h-[150px] md:h-[200px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 200"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Half-rings and circles */}
          <circle cx="200" cy="200" r="150" className="fill-transparent stroke-mkhe-primary/5 stroke-[1]" />
          <circle cx="200" cy="200" r="100" className="fill-transparent stroke-mkhe-primary/10 stroke-[2]" strokeDasharray="10 20" />
          <circle cx="1000" cy="200" r="200" className="fill-transparent stroke-mkhe-primary/5 stroke-[1]" />
          <circle cx="1000" cy="200" r="140" className="fill-transparent stroke-mkhe-primary/10 stroke-[1]" strokeDasharray="5 15" />
          
          <path d="M0,150 L1200,150" className="stroke-mkhe-primary/10 stroke-[1]" />
          <path d="M600,0 L600,200" className="stroke-mkhe-primary/5 stroke-[1]" />
          
          <polygon points="600,130 620,150 600,170 580,150" className="fill-mkhe-primary/20" />
          <circle cx="600" cy="150" r="40" className="fill-transparent stroke-mkhe-primary/30 stroke-[1]" strokeDasharray="4 4" />
        </svg>
      </div>
    </section>
  );
};

export default BoardGameTeaser;
