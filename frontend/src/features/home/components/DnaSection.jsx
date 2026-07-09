import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DnaCard from "./DnaCard";

const DnaSection = ({ title, data, isReverse = false, dnaType }) => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  const getItemsPerView = (width) => {
    if (width < 450) return 2;
    if (width < 700) return 3;
    if (width < 1000) return 4;
    return 5;
  };

  const [itemsPerView, setItemsPerView] = useState(
    getItemsPerView(typeof window !== "undefined" ? window.innerWidth : 1200),
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const [isHovered, setIsHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const autoRef = useRef(null);

  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragThreshold = 30;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setItemsPerView(getItemsPerView(width));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, data.length - itemsPerView);
  const shouldSlide = data.length > itemsPerView;

  useEffect(() => {
    setIsTransitioning(false);
    setCurrentIndex(isReverse && shouldSlide ? maxIndex : 0);
  }, [data.length, shouldSlide, maxIndex, isReverse]);

  const startAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (!shouldSlide) return;

    autoRef.current = setInterval(() => {
      if (!isHovered && !isDragging) {
        setIsTransitioning(true);
        setCurrentIndex((prev) => {
          if (isReverse) {
            return prev <= 0 ? maxIndex : prev - 1;
          } else {
            return prev >= maxIndex ? 0 : prev + 1;
          }
        });
      }
    }, 4000);
  };

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoRef.current);
  }, [data.length, isHovered, isDragging, shouldSlide, maxIndex, isReverse]);

  const handleNext = () => {
    if (!shouldSlide) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    startAuto();
  };

  const handlePrev = () => {
    if (!shouldSlide) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    startAuto();
  };

  const handleDragStart = (e) => {
    if (!shouldSlide) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
    setIsDragging(true);
    setIsTransitioning(false);
    if (autoRef.current) clearInterval(autoRef.current);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const currentOffset = clientX - dragStart;
    setDragOffset(currentOffset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsTransitioning(true);

    const itemWidth = windowWidth / itemsPerView;
    let moveCount = Math.round(Math.abs(dragOffset) / itemWidth);
    if (moveCount === 0 && Math.abs(dragOffset) > dragThreshold) {
      moveCount = 1;
    }

    if (dragOffset > dragThreshold) {
      setCurrentIndex((prev) => Math.max(0, prev - moveCount));
    } else if (dragOffset < -dragThreshold) {
      setCurrentIndex((prev) => Math.min(maxIndex, prev + moveCount));
    }

    setDragOffset(0);
    startAuto();
  };

  if (!data || data.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: isReverse ? -100 : 100 }} 
      whileInView={{ opacity: 1, x: 0 }} 
      viewport={{ once: true, amount: 0.2 }} 
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full bg-transparent group/section pb-12"
    >
      {/* GIANT SECTION TYPOGRAPHY */}
      <div className={`absolute top-0 ${isReverse ? '-right-10' : '-left-10'} pointer-events-none opacity-5 z-0`}>
        <span className="text-[150px] md:text-[250px] font-logo font-bold text-mkhe-text tracking-tighter leading-none">
          {title.toUpperCase()}
        </span>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        
        {/* EDITORIAL HEADER */}
        <div className={`flex flex-col md:flex-row items-end justify-between mb-16 ${isReverse ? "md:flex-row-reverse text-right" : "text-left"}`}>
          <div className="relative">
            {/* Sub-label: Dấu ấn di sản */}
            <div className={`flex items-center gap-4 mb-4 opacity-80 ${isReverse ? "justify-end" : "justify-start"}`}>
              {!isReverse && (
                <>
                  <div className="w-1.5 h-1.5 bg-mkhe-primary rotate-45 shadow-[0_0_8px_#D4A373]"></div>
                  <div className="w-12 md:w-20 h-[1px] bg-gradient-to-r from-mkhe-primary to-transparent"></div>
                </>
              )}
              <span className="text-mkhe-primary tracking-[0.4em] text-xs md:text-sm uppercase font-bold">
                {t("dna.heritage_mark", "Dấu ấn di sản")}
              </span>
              {isReverse && (
                <>
                  <div className="w-12 md:w-20 h-[1px] bg-gradient-to-l from-mkhe-primary to-transparent"></div>
                  <div className="w-1.5 h-1.5 bg-mkhe-primary rotate-45 shadow-[0_0_8px_#D4A373]"></div>
                </>
              )}
            </div>

            {/* Main Title */}
            <h3 className={`text-6xl md:text-[7rem] lg:text-[8rem] font-logo font-light tracking-tight mb-6 flex items-baseline ${isReverse ? "justify-end" : "justify-start"}`}>
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-mkhe-text via-mkhe-text/90 to-mkhe-text/40 drop-shadow-sm filter">
                {title}
              </span>
              <span className="text-mkhe-primary text-5xl md:text-7xl italic ml-1 font-serif animate-pulse">.</span>
            </h3>
            <button
              onClick={() => navigate(`/shop?culturalDNA=${dnaType}`)}
              className={`group flex items-center cursor-pointer gap-2 text-xs uppercase tracking-[0.2em] text-mkhe-text/50 hover:text-mkhe-primary transition-colors ${isReverse ? "justify-end" : ""}`}
            >
              <span className="w-0 h-[1px] bg-mkhe-primary transition-all duration-300 group-hover:w-4"></span>
              {t("dna.view_all")}
            </button>
          </div>

          {/* CUSTOM NAVIGATION ARROWS (Magic Bird/Bow) */}
          <div className={`hidden md:flex items-center gap-6 ${isReverse ? "justify-start" : "justify-end"}`}>
            <button
              onClick={handlePrev}
              className="group relative w-16 h-12 flex items-center justify-center text-mkhe-text/40 hover:text-mkhe-primary transition-colors cursor-pointer"
            >
              {/* Vòng sáng tỏa ra khi hover */}
              <div className="absolute inset-0 bg-mkhe-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <svg viewBox="0 0 60 60" className="w-12 h-12 fill-none stroke-current transform transition-transform duration-500 group-hover:-translate-x-3" xmlns="http://www.w3.org/2000/svg">
                {/* Trục mũi tên đứt đoạn mờ ảo */}
                <path d="M 55,30 L 45,30" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.5"/>
                <path d="M 45,30 L 20,30" strokeWidth="1.5" opacity="0.8" />
                
                {/* Các vòng cung bọc ngoài như cánh hoa sen / khiên bảo vệ */}
                <path d="M 35,12 C 12,22 12,38 35,48" strokeWidth="1.5" />
                <path d="M 40,18 C 22,25 22,35 40,42" strokeWidth="1" opacity="0.3" />
                
                {/* Đầu mũi giáo (Spearhead) sắc lẹm */}
                <polygon points="10,30 24,20 21,30 24,40" className="fill-current drop-shadow-[0_0_8px_rgba(212,163,115,0.8)]" stroke="none" />
                
                {/* Tâm la bàn năng lượng (Energy Node) */}
                <circle cx="35" cy="30" r="4" strokeWidth="1.5" className="fill-mkhe-bg" />
                <circle cx="35" cy="30" r="1.5" className="fill-current" stroke="none" />
                <circle cx="45" cy="30" r="1" className="fill-current" stroke="none" opacity="0.5" />
                
                {/* Tàn dư ma thuật (Sparks) lơ lửng */}
                <circle cx="28" cy="15" r="1" className="fill-current" stroke="none" opacity="0.6"/>
                <circle cx="28" cy="45" r="1" className="fill-current" stroke="none" opacity="0.6"/>
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              className="group relative w-16 h-12 flex items-center justify-center text-mkhe-text/40 hover:text-mkhe-primary transition-colors cursor-pointer"
            >
              {/* Vòng sáng tỏa ra khi hover */}
              <div className="absolute inset-0 bg-mkhe-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <svg viewBox="0 0 60 60" className="w-12 h-12 fill-none stroke-current transform rotate-180 transition-transform duration-500 group-hover:translate-x-3" xmlns="http://www.w3.org/2000/svg">
                {/* Trục mũi tên đứt đoạn mờ ảo */}
                <path d="M 55,30 L 45,30" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.5"/>
                <path d="M 45,30 L 20,30" strokeWidth="1.5" opacity="0.8" />
                
                {/* Các vòng cung bọc ngoài như cánh hoa sen / khiên bảo vệ */}
                <path d="M 35,12 C 12,22 12,38 35,48" strokeWidth="1.5" />
                <path d="M 40,18 C 22,25 22,35 40,42" strokeWidth="1" opacity="0.3" />
                
                {/* Đầu mũi giáo (Spearhead) sắc lẹm */}
                <polygon points="10,30 24,20 21,30 24,40" className="fill-current drop-shadow-[0_0_8px_rgba(212,163,115,0.8)]" stroke="none" />
                
                {/* Tâm la bàn năng lượng (Energy Node) */}
                <circle cx="35" cy="30" r="4" strokeWidth="1.5" className="fill-mkhe-bg" />
                <circle cx="35" cy="30" r="1.5" className="fill-current" stroke="none" />
                <circle cx="45" cy="30" r="1" className="fill-current" stroke="none" opacity="0.5" />
                
                {/* Tàn dư ma thuật (Sparks) lơ lửng */}
                <circle cx="28" cy="15" r="1" className="fill-current" stroke="none" opacity="0.6"/>
                <circle cx="28" cy="45" r="1" className="fill-current" stroke="none" opacity="0.6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* CASCADING CAROUSEL WRAPPER */}
        <div
          className="relative w-full touch-pan-y pt-8 pb-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setHoveredCard(null);
          }}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeaveCapture={handleDragEnd}
        >
          <div className="w-full relative">
            <div
              className="flex"
              style={{
                transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% + ${dragOffset}px))`,
                transition: isTransitioning ? "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
                willChange: "transform",
              }}
            >
              {data.map((item, idx) => {
                const isHoveredCard = hoveredCard === idx;
                const isDimmed = hoveredCard !== null && hoveredCard !== idx;

                return (
                  <DnaCard
                    key={item._id || idx}
                    item={item}
                    idx={idx}
                    itemsPerView={itemsPerView}
                    isHoveredCard={isHoveredCard}
                    isDimmed={isDimmed}
                    isMobile={windowWidth < 768}
                    onHover={() => setHoveredCard(idx)}
                    onLeave={() => setHoveredCard(null)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DnaSection;
