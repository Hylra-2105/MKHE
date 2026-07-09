import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import useEffectsConfig from "@/hooks/useEffectsConfig";

const BoardGameTeaser = () => {
  const { enableEffects } = useEffectsConfig();
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
      <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-mkhe-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none`}></div>
      <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#8B5A2B]/10 rounded-full blur-[120px] animate-pulse pointer-events-none`} style={{ animationDelay: '2s' }}></div>

      {/* FLOATING VIP INVITATION CARD */}
      <motion.div 
        initial={enableEffects ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }}
        whileInView={enableEffects ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.5 }}
        className="relative z-10 max-w-4xl w-full text-center rounded-[2rem] border border-mkhe-border bg-mkhe-input/30 backdrop-blur-xl p-16 md:p-24 shadow-2xl group"
      >
        {/* Subtle inner glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-mkhe-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2rem] overflow-hidden"></div>
        <div className="absolute inset-0 border border-mkhe-primary/0 group-hover:border-mkhe-primary/20 rounded-[2rem] transition-colors duration-700 pointer-events-none"></div>

        {/* Badge "Coming Soon" */}
        <div className="inline-flex items-center gap-3 mb-10">
          <span className="w-8 h-[1px] bg-mkhe-primary"></span>
          <span className={`text-mkhe-primary text-xs font-bold uppercase tracking-[0.3em] animate-pulse`}>
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

        {/* Họa tiết góc trên trái (Tràn viền 3D) */}
        <div className="absolute -top-6 -left-6 w-40 h-40 pointer-events-none opacity-90 z-20">
          <svg viewBox="0 0 150 150" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="gold-corner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4A373" stopOpacity="1" />
                <stop offset="50%" stopColor="#D4A373" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Khung viền vuông vức bọc góc */}
            <path d="M 0,150 L 0,0 L 150,0" stroke="url(#gold-corner)" strokeWidth="2" fill="none" />
            <path d="M -15,130 L -15,-15 L 130,-15" stroke="#D4A373" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="4 4"/>
            
            {/* Họa tiết rễ cây / hoa sen lan toả */}
            <path d="M 0,100 Q 50,100 100,0" stroke="#D4A373" strokeWidth="1.5" fill="none" opacity="0.8" />
            <path d="M 0,60 Q 30,60 60,0" stroke="#D4A373" strokeWidth="1.5" fill="none" strokeDasharray="3 3" opacity="0.6"/>
            <path d="M 0,120 Q 80,120 120,0" stroke="#D4A373" strokeWidth="0.5" fill="none" opacity="0.5"/>
            
            {/* Tâm sao/ngọc nhô ra khỏi góc */}
            <polygon points="0,0 -20,20 0,40 20,20" fill="#E6CC98" fillOpacity="0.9" className="drop-shadow-[0_0_15px_rgba(230,204,152,0.8)]" />
            <polygon points="0,0 -10,10 0,20 10,10" fill="#8B5A2B" opacity="0.6" />
            
            {/* Các gai nhọn (spikes) đâm chéo ra ngoài */}
            <polygon points="-20,20 -45,15 -25,30" fill="#D4A373" opacity="0.7" />
            <polygon points="20,-20 15,-45 30,-25" fill="#D4A373" opacity="0.7" />
            
            {/* Magical floating dots */}
            <circle cx="80" cy="80" r="2.5" fill="#E6CC98" className={`animate-pulse drop-shadow-[0_0_8px_#E6CC98]`} />
            <circle cx="110" cy="30" r="1.5" fill="#D4A373" />
            <circle cx="30" cy="110" r="1.5" fill="#D4A373" />
          </svg>
        </div>

        {/* Họa tiết góc trên phải (Tràn viền 3D, lật ngang) */}
        <div className="absolute -top-6 -right-6 w-40 h-40 pointer-events-none opacity-90 z-20 transform scale-x-[-1]">
          <svg viewBox="0 0 150 150" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="gold-corner-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4A373" stopOpacity="1" />
                <stop offset="50%" stopColor="#D4A373" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 0,150 L 0,0 L 150,0" stroke="url(#gold-corner-right)" strokeWidth="2" fill="none" />
            <path d="M -15,130 L -15,-15 L 130,-15" stroke="#D4A373" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="4 4"/>
            <path d="M 0,100 Q 50,100 100,0" stroke="#D4A373" strokeWidth="1.5" fill="none" opacity="0.8" />
            <path d="M 0,60 Q 30,60 60,0" stroke="#D4A373" strokeWidth="1.5" fill="none" strokeDasharray="3 3" opacity="0.6"/>
            <path d="M 0,120 Q 80,120 120,0" stroke="#D4A373" strokeWidth="0.5" fill="none" opacity="0.5"/>
            <polygon points="0,0 -20,20 0,40 20,20" fill="#E6CC98" fillOpacity="0.9" className="drop-shadow-[0_0_15px_rgba(230,204,152,0.8)]" />
            <polygon points="0,0 -10,10 0,20 10,10" fill="#8B5A2B" opacity="0.6" />
            <polygon points="-20,20 -45,15 -25,30" fill="#D4A373" opacity="0.7" />
            <polygon points="20,-20 15,-45 30,-25" fill="#D4A373" opacity="0.7" />
            <circle cx="80" cy="80" r="2.5" fill="#E6CC98" className={`animate-pulse drop-shadow-[0_0_8px_#E6CC98]`} />
            <circle cx="110" cy="30" r="1.5" fill="#D4A373" />
            <circle cx="30" cy="110" r="1.5" fill="#D4A373" />
          </svg>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-mkhe-border/50"></div>
        <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-mkhe-border/50"></div>
        <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-mkhe-border/50"></div>
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-mkhe-border/50"></div>

        {/* Họa tiết đáy lấy cảm hứng từ Di Sản - Ma Thuật (Freestyle) */}
        <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none flex justify-center items-end opacity-90 z-20">
          <svg viewBox="0 0 1000 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gold-fade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4A373" stopOpacity="0" />
                <stop offset="50%" stopColor="#D4A373" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Base line with a raised center pedestal */}
            <path 
              d="M 0,150 L 350,150 L 400,130 L 600,130 L 650,150 L 1000,150" 
              stroke="url(#gold-fade)" strokeWidth="2" fill="none" 
            />
            
            {/* Outer large semi-circle dropping down (Mandala ring) */}
            <path 
              d="M 360,130 A 140 140 0 0 0 640,130" 
              stroke="#D4A373" strokeWidth="1" fill="none" strokeOpacity="0.4" strokeDasharray="6 6" 
            />
            
            {/* Inner semi-circle dropping down */}
            <path 
              d="M 410,130 A 90 90 0 0 0 590,130" 
              stroke="#D4A373" strokeWidth="2" fill="none" strokeOpacity="0.8" 
            />
            
            {/* The sharp core geometric shield/spike */}
            <polygon 
              points="500,230 430,130 570,130" 
              fill="#D4A373" fillOpacity="0.1" stroke="#D4A373" strokeWidth="1.5" 
            />
            
            {/* Core glowing 3D gem (Diamond/Lotus shape) */}
            <polygon 
              points="500,210 460,130 500,100 540,130" 
              fill="#E6CC98" fillOpacity="0.9" stroke="#E6CC98" strokeWidth="1" 
              className="drop-shadow-[0_0_20px_rgba(230,204,152,0.7)]" 
            />
            
            {/* Inner detail lines forming facets inside the gem */}
            <path d="M 500,210 L 500,100 M 460,130 L 540,130 M 480,115 L 520,170 M 520,115 L 480,170" 
                  stroke="#8B5A2B" strokeWidth="1" opacity="0.4" fill="none" />
            
            {/* Small floating orbits/dots around the center tip */}
            <circle cx="500" cy="245" r="4" fill="#E6CC98" className={`animate-pulse drop-shadow-[0_0_8px_#E6CC98]`} />
            <circle cx="480" cy="225" r="2.5" fill="#D4A373" opacity="0.8" />
            <circle cx="520" cy="225" r="2.5" fill="#D4A373" opacity="0.8" />
            
            {/* Lotus petal flourishes on the pedestal */}
            <path d="M 400,130 Q 425,90 450,130" stroke="#D4A373" strokeWidth="2" fill="none" />
            <path d="M 600,130 Q 575,90 550,130" stroke="#D4A373" strokeWidth="2" fill="none" />
            <circle cx="425" cy="115" r="2" fill="#D4A373" />
            <circle cx="575" cy="115" r="2" fill="#D4A373" />

            {/* Left mystical trail/energy waves */}
            <path d="M 100,150 Q 225,90 350,150" stroke="#D4A373" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
            <path d="M 150,150 Q 250,115 350,150" stroke="#D4A373" strokeWidth="1" fill="none" strokeDasharray="3 4" strokeOpacity="0.7" />

            {/* Right mystical trail/energy waves */}
            <path d="M 900,150 Q 775,90 650,150" stroke="#D4A373" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
            <path d="M 850,150 Q 750,115 650,150" stroke="#D4A373" strokeWidth="1" fill="none" strokeDasharray="3 4" strokeOpacity="0.7" />
          </svg>
        </div>
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
