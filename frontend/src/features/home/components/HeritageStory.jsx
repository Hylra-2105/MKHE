import React, { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

// Tự import ảnh
import AG1 from "@/assets/images/AG1.png";
import AG2 from "@/assets/images/AG2.png";
import AG3 from "@/assets/images/AG3.png";
import AG4 from "@/assets/images/AG4.png";

import DT1 from "@/assets/images/DT1.png";
import DT2 from "@/assets/images/DT2.png";
import DT3 from "@/assets/images/DT3.png";
import DT4 from "@/assets/images/DT4.png";

const HeritageStory = () => {
  const { t } = useTranslation("home");
  const [activeTab, setActiveTab] = useState(null);

  // Drag-to-scroll logic
  const sliderRef = useRef(null);
  const timelineRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside a node or popup
      if (event.target.closest('.timeline-node')) {
        return;
      }
      setActiveTab(null);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleNodeClick = (index) => {
    if (activeTab === index) {
      setActiveTab(null);
      return;
    }
    setActiveTab(index);
    if (sliderRef.current && timelineRef.current) {
      const container = sliderRef.current;
      const timeline = timelineRef.current;
      
      const nodeX = 150 + index * 300;
      const paddingLeft = timeline.offsetLeft;
      
      const targetScrollLeft = (paddingLeft + nodeX) - (container.clientWidth / 2);
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const journeyData = [
    { 
      id: "ag1", province: t("heritage.nodes.ag1.province"), dna: t("heritage.nodes.ag1.dna"), image: AG1, type: 'ag',
      content: {
        title: t("heritage.nodes.ag1.title"),
        text: t("heritage.nodes.ag1.text")
      }
    },
    { 
      id: "ag2", province: t("heritage.nodes.ag2.province"), dna: t("heritage.nodes.ag2.dna"), image: AG2, type: 'ag',
      content: {
        title: t("heritage.nodes.ag2.title"),
        text: t("heritage.nodes.ag2.text")
      }
    },
    { 
      id: "ag3", province: t("heritage.nodes.ag3.province"), dna: t("heritage.nodes.ag3.dna"), image: AG3, type: 'ag',
      content: {
        title: t("heritage.nodes.ag3.title"),
        text: t("heritage.nodes.ag3.text")
      }
    },
    { 
      id: "ag4", province: t("heritage.nodes.ag4.province"), dna: t("heritage.nodes.ag4.dna"), image: AG4, type: 'ag',
      content: {
        title: t("heritage.nodes.ag4.title"),
        text: t("heritage.nodes.ag4.text")
      }
    },
    { 
      id: "dt1", province: t("heritage.nodes.dt1.province"), dna: t("heritage.nodes.dt1.dna"), image: DT1, type: 'dt',
      content: {
        title: t("heritage.nodes.dt1.title"),
        text: t("heritage.nodes.dt1.text")
      }
    },
    { 
      id: "dt2", province: t("heritage.nodes.dt2.province"), dna: t("heritage.nodes.dt2.dna"), image: DT2, type: 'dt',
      content: {
        title: t("heritage.nodes.dt2.title"),
        text: t("heritage.nodes.dt2.text")
      }
    },
    { 
      id: "dt3", province: t("heritage.nodes.dt3.province"), dna: t("heritage.nodes.dt3.dna"), image: DT3, type: 'dt',
      content: {
        title: t("heritage.nodes.dt3.title"),
        text: t("heritage.nodes.dt3.text")
      }
    },
    { 
      id: "dt4", province: t("heritage.nodes.dt4.province"), dna: t("heritage.nodes.dt4.dna"), image: DT4, type: 'dt',
      content: {
        title: t("heritage.nodes.dt4.title"),
        text: t("heritage.nodes.dt4.text")
      }
    },
  ];

  return (
    <section className="pt-20 pb-20 md:pb-32 bg-gradient-to-b from-mkhe-bg to-mkhe-primary/10 text-mkhe-text relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* EDITORIAL HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true, amount: 0.3 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-4 mb-8">
              <span className="w-16 h-[1px] bg-mkhe-primary"></span>
              <span className="text-mkhe-primary tracking-[0.4em] text-xs uppercase font-bold">{t("heritage.journey_tag", "The Journey")}</span>
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] text-mkhe-text font-bold leading-[1.1] mb-8 relative">
              {t("heritage.title_1", "Hành trình ")} <br/>
              <span className="text-mkhe-primary font-logo italic font-normal text-6xl md:text-8xl lg:text-[7.5rem] leading-none block mt-2 ml-12">{t("heritage.title_2", "Di sản")}</span>
            </h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true, amount: 0.3 }} 
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:w-1/2 flex lg:justify-end pb-8"
          >
            <p className="text-mkhe-text/70 text-lg max-w-md leading-relaxed border-l-[1px] border-mkhe-primary/40 pl-8 ml-4 lg:ml-0 font-light">
              {t("heritage.desc")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* HORIZONTAL SCROLLABLE TIMELINE */}
      <div 
        ref={sliderRef}
        className={`relative z-20 w-full overflow-x-auto pb-32 pt-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="flex">
          {/* Padding spacers that adapt to the screen width and max-w-7xl container */}
          <div className="shrink-0 w-[max(1.5rem,calc((100vw-80rem)/2))] lg:w-[max(2rem,calc((100vw-80rem)/2))]"></div>
          
          {/* Inner container to hold the wide SVG and nodes */}
          <div ref={timelineRef} className="relative w-[2400px] h-[400px] shrink-0"> 
            {/* Wavy SVG Path */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 2400 400"
              preserveAspectRatio="none"
            >
              {/* Background Path (Faint) */}
              <path 
                d="M 0,200 Q 150,400 300,200 T 600,200 T 900,200 T 1200,200 T 1500,200 T 1800,200 T 2100,200 T 2400,200" 
                className="stroke-mkhe-border/20 stroke-[2] fill-transparent" 
              />
              {/* Active Animated Path */}
              <motion.path 
                d="M 0,200 Q 150,400 300,200 T 600,200 T 900,200 T 1200,200 T 1500,200 T 1800,200 T 2100,200 T 2400,200" 
                className="stroke-mkhe-primary stroke-[4] fill-transparent" 
                style={{ filter: 'drop-shadow(0 0 8px rgba(212,163,115,0.6))' }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: activeTab !== null ? (activeTab + 0.5) / 8 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </svg>

            {/* Timeline Nodes */}
            {journeyData.map((tab, index) => {
              const isActive = activeTab === index;
              // 8 nodes distributed evenly. 2400px total width.
              const leftPos = `${(150 + index * 300) / 24}%`;
              const topPos = index % 2 === 0 ? "75%" : "25%";
              
              return (
                <div 
                  key={tab.id}
                  className="absolute flex flex-col items-center timeline-node"
                  style={{ left: leftPos, top: topPos, transform: 'translate(-50%, -50%)' }}
                >
                  <button 
                    onClick={() => handleNodeClick(index)}
                    className={`cursor-pointer relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 overflow-hidden transition-all duration-500 group ${isActive ? 'border-mkhe-primary scale-110 shadow-[0_0_30px_rgba(212,163,115,0.6)] z-10' : 'border-mkhe-border hover:border-mkhe-primary/50 z-0 bg-mkhe-bg'}`}
                  >
                    <img src={tab.image} alt={tab.province} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </button>
                  
                  {/* Node Label */}
                  <div className={`absolute text-center w-64 transition-all duration-500 ${index % 2 === 0 ? 'top-[115%]' : 'bottom-[115%]'}`}>
                    <h4 className={`text-xl md:text-2xl font-bold tracking-wide ${isActive ? 'text-mkhe-primary' : 'text-mkhe-text'}`}>{tab.province}</h4>
                    <p className="text-[10px] md:text-xs text-mkhe-text/50 uppercase tracking-wider mt-1">{tab.dna}</p>
                  </div>

                  {/* Pop-up Story Card */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: index % 2 === 0 ? 20 : -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: index % 2 === 0 ? 20 : -20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`absolute w-[85vw] max-w-[380px] left-1/2 -translate-x-1/2 bg-mkhe-bg/95 backdrop-blur-xl border border-mkhe-primary/30 p-5 md:p-6 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-30 pointer-events-auto flex flex-col items-center text-center ${
                          index % 2 === 0 ? 'bottom-[140%]' : 'top-[140%]'
                        }`}
                      >
                        {/* Triangle pointer */}
                        <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-mkhe-bg border-mkhe-primary/30 rotate-45 ${
                          index % 2 === 0 ? 'bottom-0 translate-y-[8px] border-b border-r' : 'top-0 -translate-y-[8px] border-t border-l'
                        }`}></div>
                        
                        <h5 className="font-bold text-lg md:text-xl mb-3 text-mkhe-primary font-logo leading-tight">
                          {tab.content.title}
                        </h5>
                        <p className="text-mkhe-text/90 text-xs md:text-sm leading-relaxed font-light">
                          {tab.content.text}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          
          <div className="shrink-0 w-[max(1.5rem,calc((100vw-80rem)/2))] lg:w-[max(2rem,calc((100vw-80rem)/2))]"></div>
        </div>
      </div>



      {/* Bờ cong sóng (Wave Divider) nghệ thuật */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] z-20 pointer-events-none translate-y-1/2">
        <svg
          className="relative block w-full h-[150px] md:h-[300px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 240"
          preserveAspectRatio="none"
        >
          {/* Lớp nền chính (Base) che đường nối */}
          <path 
            d="M0,100 C300,120 600,60 900,110 C1050,115 1150,80 1200,100 V240 H0 Z" 
            className="fill-mkhe-bg"
          ></path>

          {/* Dải lụa mỏng 1 */}
          <path 
            d="M0,180 C200,240 350,40 600,60 C850,80 1000,220 1200,160" 
            className="fill-transparent stroke-mkhe-primary/30 stroke-[2]"
          ></path>
          
          {/* Dải lụa mỏng 2 */}
          <path 
            d="M0,80 C250,20 400,160 700,140 C950,120 1050,40 1200,100" 
            className="fill-transparent stroke-mkhe-primary/40 stroke-[1]"
          ></path>

          {/* Dải lụa mỏng 3 (mảng fill lơ lửng, cong đều) */}
          <path 
            d="M0,120 C300,60 500,200 800,160 C1000,130 1100,70 1200,140 C1000,180 800,220 500,140 C300,80 150,140 0,150 Z" 
            className="fill-mkhe-primary/5 stroke-none"
          ></path>

          {/* Dải sáng phát quang (Đường line chính) */}
          <path 
            d="M0,140 C250,220 450,20 750,80 C1000,140 1100,220 1200,180" 
            className="fill-transparent stroke-mkhe-primary stroke-[3]"
            style={{ filter: 'drop-shadow(0px 0px 8px rgba(212,163,115,0.8))' }}
          ></path>
          
          {/* Một dải sáng lướt qua */}
          <path 
            d="M0,60 C300,20 500,180 850,200 C1050,220 1150,100 1200,60" 
            className="fill-transparent stroke-mkhe-primary/80 stroke-[1]"
            style={{ filter: 'drop-shadow(0px 0px 4px rgba(212,163,115,0.5))' }}
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeritageStory;
