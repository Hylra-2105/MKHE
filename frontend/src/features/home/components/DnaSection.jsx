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

    if (dragOffset > dragThreshold) {
      setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    } else if (dragOffset < -dragThreshold) {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }

    setDragOffset(0);
    startAuto();
  };

  if (!data || data.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: isReverse ? 100 : -100 }} 
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
            <h3 className="text-5xl md:text-8xl font-logo font-light text-mkhe-text tracking-tight mb-2 flex items-center gap-6">
              {!isReverse && <span className="w-12 h-[1px] bg-mkhe-primary"></span>}
              {title}
              {isReverse && <span className="w-12 h-[1px] bg-mkhe-primary"></span>}
            </h3>
            <button
              onClick={() => navigate(`/shop?category=${dnaType}`)}
              className={`group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-mkhe-text/50 hover:text-mkhe-primary transition-colors ${isReverse ? "justify-end" : ""}`}
            >
              <span className="w-0 h-[1px] bg-mkhe-primary transition-all duration-300 group-hover:w-4"></span>
              {t("dna.view_all", "Xem toàn bộ")}
            </button>
          </div>

          {/* CUSTOM NAVIGATION ARROWS */}
          <div className={`hidden md:flex items-center gap-4 ${isReverse ? "justify-start" : "justify-end"}`}>
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-mkhe-text/20 flex items-center justify-center text-mkhe-text/50 hover:text-mkhe-primary hover:border-mkhe-primary transition-all hover:-translate-x-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-mkhe-text/20 flex items-center justify-center text-mkhe-text/50 hover:text-mkhe-primary hover:border-mkhe-primary transition-all hover:translate-x-1"
            >
              <ChevronRight className="w-5 h-5" />
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
