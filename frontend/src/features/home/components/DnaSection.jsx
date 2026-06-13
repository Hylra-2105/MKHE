import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DnaCard from "./DnaCard";

const DnaSection = ({ title, data, isReverse = false }) => {
  const { t } = useTranslation("home");

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
    setIsHovered(true);
    setDragOffset(0);
  };

  const handleDragMove = (e) => {
    if (!shouldSlide || !isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = clientX - dragStart;
    setDragOffset(delta);
  };

  const handleDragEnd = (e) => {
    if (!shouldSlide || !isDragging) return;
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = dragStart - clientX;

    const itemsMoved = Math.max(1, Math.round(Math.abs(deltaX) / 80));

    if (Math.abs(deltaX) > dragThreshold) {
      setIsTransitioning(true);
      if (deltaX > 0) {
        setCurrentIndex((prev) => Math.min(prev + itemsMoved, maxIndex));
      } else {
        setCurrentIndex((prev) => Math.max(prev - itemsMoved, 0));
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    setIsHovered(false);
    startAuto();
  };

  if (data.length === 0) return null;

  return (
    <div className="mb-2 md:mb-5">
      {/* HEADER */}
      <div className="max-w-[1100px] mx-auto flex items-end justify-between mb-2 md:mb-4 px-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-widest font-logo text-transparent bg-clip-text bg-gradient-to-r from-mkhe-primary via-[#D4A373] to-[#C38D64] drop-shadow-sm">
            {title}
          </h3>
          <button className="group flex items-center gap-1.5 text-mkhe-text/60 text-xs md:text-sm font-medium hover:text-mkhe-primary transition-colors mt-1 w-fit cursor-pointer">
            {t("dna.view_all", "Xem toàn bộ")}
            <span className="transform group-hover:translate-x-1 transition-transform">
              &gt;
            </span>
          </button>
        </div>

        <div className="flex gap-3 pb-1">
          <button
            onClick={handlePrev}
            className="w-11 h-11 rounded-full bg-mkhe-primary/5 border border-mkhe-primary/30 flex items-center justify-center text-mkhe-primary hover:bg-mkhe-primary/10 hover:border-mkhe-primary/60 transition-all cursor-pointer z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="w-11 h-11 rounded-full bg-mkhe-primary/5 border border-mkhe-primary/30 flex items-center justify-center text-mkhe-primary hover:bg-mkhe-primary/10 hover:border-mkhe-primary/60 transition-all cursor-pointer z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KHU VỰC SLIDER */}
      <div
        className="max-w-[1100px] mx-auto py-2 -my-2 md:py-6 md:-my-6 px-4 select-none overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsDragging(false);
          setHoveredCard(null);
          setDragOffset(0);
        }}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseMove={handleDragMove}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleDragMove}
      >
        <div
          style={{ perspective: "1200px", perspectiveOrigin: "center center" }}
        >
          {/* Responsive padding: ít hơn trên mobile vì không có hiệu ứng phóng to (scale 1.25) */}
          <div
            className="flex items-end pt-2 pb-4 md:pt-6 md:pb-12"
            style={{
              transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% + ${dragOffset}px))`,
              transition:
                isDragging || !isTransitioning
                  ? "none"
                  : "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
              willChange: "transform",
              transformStyle: "preserve-3d",
            }}
          >
            {data.map((item, idx) => (
              <DnaCard
                key={`${item._id}-${idx}`}
                item={item}
                idx={idx}
                itemsPerView={itemsPerView}
                isHoveredCard={hoveredCard === idx}
                isDimmed={hoveredCard !== null && hoveredCard !== idx}
                isMobile={windowWidth < 768}
                onHover={() => setHoveredCard(idx)}
                onLeave={() => setHoveredCard(null)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DnaSection;
