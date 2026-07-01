import React from "react";
import { motion } from "framer-motion";

const SectionTransition = () => {
  return (
    <div className="w-full h-32 md:h-48 flex flex-col items-center justify-center relative overflow-hidden z-20 -mt-12 md:-mt-16">
      {/* Background gradient fading from transparent (over video) to solid mkhe-bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mkhe-bg/90 to-mkhe-bg z-0"></div>

      {/* Họa tiết lưới (Board Game grid) */}
      <div 
        className="absolute inset-0 opacity-15 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(212, 163, 115, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 163, 115, 0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center',
          maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%, black 80%, transparent)'
        }}
      ></div>

      {/* Họa tiết DNA (Mã Gen Mekong) - Theo chiều ngang */}
      <svg
        className="w-full h-full max-w-none relative z-10"
        viewBox="0 0 1600 200"
        preserveAspectRatio="xMidYMid slice"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
        }}
      >
        {/* DNA Strand 1 */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          d="M-100,100 C100,200 300,0 500,100 C700,200 900,0 1100,100 C1300,200 1500,0 1700,100"
          className="stroke-mkhe-primary/30 stroke-[2] fill-transparent"
        />
        
        {/* DNA Strand 2 */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
          d="M-100,100 C100,0 300,200 500,100 C700,0 900,200 1100,100 C1300,0 1500,200 1700,100"
          className="stroke-mkhe-primary/70 stroke-[3] fill-transparent"
          style={{ filter: "drop-shadow(0 0 8px rgba(212,163,115,0.6))" }}
        />

        {/* Các liên kết (DNA bonds) */}
        {[-100, 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700].map((x, i) => {
          return (
            <motion.line
              key={i}
              initial={{ opacity: 0, y1: 100, y2: 100 }}
              whileInView={{ 
                opacity: 1, 
                y1: i % 2 === 0 ? 100 : 50, 
                y2: i % 2 === 0 ? 100 : 150 
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1 + i * 0.1 }}
              x1={x}
              x2={x}
              y1="50"
              y2="150"
              className="stroke-mkhe-primary/40 stroke-[1.5]"
            />
          );
        })}

        {/* Các chấm sáng (Nodes) */}
        {[-100, 100, 300, 500, 700, 900, 1100, 1300, 1500, 1700].map((x, i) => (
          <motion.circle
            key={`node-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.5 + i * 0.1 }}
            cx={x}
            cy="100"
            r="4"
            className="fill-mkhe-primary"
            style={{ filter: "drop-shadow(0 0 6px rgba(212,163,115,1))" }}
          />
        ))}
      </svg>
      
      {/* Icon kết nối nhấp nháy ở giữa */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-mkhe-primary/80"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-mkhe-primary shadow-[0_0_15px_rgba(212,163,115,1)] animate-pulse"></div>
        <div className="w-[1px] h-12 bg-gradient-to-t from-transparent to-mkhe-primary/80"></div>
      </motion.div>

    </div>
  );
};

export default SectionTransition;
